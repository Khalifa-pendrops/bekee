import { 
  Product, 
  Category, 
  Collection, 
  DeliveryZone, 
  StoreSettings, 
  Order, 
  StockReservation, 
  InventoryMovement, 
  DeliveryQuoteRequest, 
  CartItem,
  PaymentMethod,
  OrderSource,
  DiscountCode
} from '@/types';
import { 
  mockProducts, 
  mockCategories, 
  mockCollections, 
  mockDeliveryZones, 
  mockStoreSettings,
  mockDiscountCodes
} from '@/data/mockData';
import { isSupabaseConfigured, supabaseAdmin } from './supabase';

// Persistent Local Disk Storage Helpers for Custom / Admin Products (Server-Safe)
function getCustomProducts(): Product[] {
  if (typeof window !== 'undefined') {
    return [];
  }
  try {
    const fs = require('fs');
    const path = require('path');
    const filePath = path.join(process.cwd(), 'src', 'data', 'customProducts.json');
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf-8');
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed)) return parsed as Product[];
    }
  } catch (err) {
    // Ignore read errors
  }
  return [];
}

function saveCustomProducts(products: Product[]): void {
  if (typeof window !== 'undefined') {
    return;
  }
  try {
    const fs = require('fs');
    const path = require('path');
    const filePath = path.join(process.cwd(), 'src', 'data', 'customProducts.json');
    fs.writeFileSync(filePath, JSON.stringify(products, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to save custom products to disk:', err);
  }
}

// In-memory runtime state for development mode
let inMemoryProducts: Product[] = [...getCustomProducts(), ...mockProducts];
let inMemoryOrders: Order[] = [];
let inMemoryReservations: StockReservation[] = [];
let inMemoryMovements: InventoryMovement[] = [];
let inMemoryQuotes: DeliveryQuoteRequest[] = [];
let inMemoryDiscounts: DiscountCode[] = [...mockDiscountCodes];
let inMemorySettings: StoreSettings = { ...mockStoreSettings };

export const db = {
  // ----------------------------------------------------
  // PRODUCTS & CATALOGUE
  // ----------------------------------------------------
  async getProducts(params?: {
    categorySlug?: string;
    subCategorySlug?: string;
    collectionSlug?: string;
    search?: string;
    inStockOnly?: boolean;
    minPriceKobo?: number;
    maxPriceKobo?: number;
    sort?: 'newest' | 'price-asc' | 'price-desc' | 'featured';
  }): Promise<Product[]> {
    const customList = getCustomProducts();
    const customSlugs = new Set(customList.map(p => p.slug));
    const mergedBase = [...customList, ...mockProducts.filter(p => !customSlugs.has(p.slug))];

    let results = mergedBase.filter((p) => p.isPublished && !p.isArchived);

    if (isSupabaseConfigured && supabaseAdmin) {
      try {
        let query = supabaseAdmin
          .from('products')
          .select(`
            *,
            images:product_images(*),
            variants:product_variants(*)
          `)
          .eq('is_published', true)
          .eq('is_archived', false);

        const { data, error } = await query;
        if (!error && data && data.length > 0) {
          const sbMapped = (data as any[]).map((sb) => ({
            id: sb.id,
            name: sb.name,
            slug: sb.slug,
            tagline: sb.tagline,
            description: sb.description,
            categorySlug: sb.category_slug || 'clothing',
            subCategorySlug: sb.sub_category_slug || 'dresses',
            collectionSlugs: sb.collection_slugs || ['new-arrivals'],
            fabricAndCare: sb.fabric_and_care || [],
            images: sb.images || [],
            variants: sb.variants || [],
            hasVariants: (sb.variants || []).length > 1,
            isPublished: sb.is_published,
            isFeatured: sb.is_featured,
            isArchived: sb.is_archived,
            tags: sb.tags || [],
            createdAt: sb.created_at,
            updatedAt: sb.updated_at,
          })) as Product[];

          // Merge custom products with Supabase so custom products are NEVER lost
          results = [...customList, ...sbMapped.filter(s => !customSlugs.has(s.slug))];
        }
      } catch (err) {
        // Fall back cleanly to disk/memory mergedBase
      }
    }

    if (params?.categorySlug) {
      results = results.filter((p) => p.categorySlug === params.categorySlug);
    }

    if (params?.subCategorySlug) {
      results = results.filter((p) => p.subCategorySlug === params.subCategorySlug);
    }

    if (params?.collectionSlug) {
      results = results.filter((p) => p.collectionSlugs.includes(params.collectionSlug!));
    }

    if (params?.search) {
      const rawQuery = params.search.toLowerCase().trim();
      
      // Common Nigerian fashion synonyms
      const synonymMap: Record<string, string[]> = {
        gown: ['dress', 'midi', 'jumpsuit'],
        gowns: ['dress', 'dresses'],
        shoe: ['heels', 'sandals', 'mules', 'slippers'],
        shoes: ['heels', 'sandals', 'mules', 'slippers'],
        purse: ['bag', 'handbag', 'clutch', 'tote'],
        purses: ['bag', 'bags', 'handbag', 'tote'],
        shades: ['sunglasses'],
        jewelries: ['jewellery', 'jewelry', 'earrings', 'gold'],
        'co-ord': ['matching-sets', 'set', 'two-piece'],
        cord: ['matching-sets', 'set', 'two-piece'],
        suit: ['workwear', 'jumpsuit'],
      };

      const tokens = rawQuery.split(/\s+/).filter(Boolean);

      results = results.filter((p) => {
        // Build a searchable corpus string for this product
        const colorNames = p.variants.map((v) => v.colorName.toLowerCase()).join(' ');
        const sizes = p.variants.map((v) => v.size.toLowerCase()).join(' ');
        const skus = p.variants.map((v) => v.sku.toLowerCase()).join(' ');
        const fabrics = (p.fabricAndCare || []).join(' ').toLowerCase();
        const tags = p.tags.join(' ').toLowerCase();

        const corpus = `${p.name} ${p.tagline || ''} ${p.description} ${p.categorySlug} ${p.subCategorySlug} ${tags} ${colorNames} ${sizes} ${skus} ${fabrics}`.toLowerCase();

        // Exact match
        if (corpus.includes(rawQuery)) return true;

        // Check if every token matches the product corpus (or a synonym matches)
        return tokens.every((token) => {
          if (corpus.includes(token)) return true;

          const synonyms = synonymMap[token];
          if (synonyms && synonyms.some((syn) => corpus.includes(syn))) {
            return true;
          }

          return false;
        });
      });
    }

    if (params?.inStockOnly) {
      results = results.filter((p) =>
        p.variants.some((v) => v.stockQuantity > 0)
      );
    }

    if (params?.minPriceKobo !== undefined) {
      results = results.filter((p) =>
        p.variants.some((v) => (v.salePriceKobo || v.priceKobo) >= params.minPriceKobo!)
      );
    }

    if (params?.maxPriceKobo !== undefined) {
      results = results.filter((p) =>
        p.variants.some((v) => (v.salePriceKobo || v.priceKobo) <= params.maxPriceKobo!)
      );
    }

    // Sort order
    if (params?.sort === 'price-asc') {
      results.sort((a, b) => (a.variants[0]?.priceKobo || 0) - (b.variants[0]?.priceKobo || 0));
    } else if (params?.sort === 'price-desc') {
      results.sort((a, b) => (b.variants[0]?.priceKobo || 0) - (a.variants[0]?.priceKobo || 0));
    } else if (params?.sort === 'newest') {
      results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    return results;
  },

  async getProductBySlug(slug: string): Promise<Product | null> {
    // 1. Check local persistent disk storage first for instant match
    const customList = getCustomProducts();
    const foundCustom = customList.find((p) => p.slug === slug || p.id === slug);
    if (foundCustom) return foundCustom;

    // 2. Check full product list
    const list = await this.getProducts();
    const found = list.find((p) => p.slug === slug || p.id === slug);
    if (found) return found;

    // 3. Check inMemory fallback
    return inMemoryProducts.find((p) => p.slug === slug || p.id === slug) || null;
  },

  async getAllProductsForAdmin(): Promise<Product[]> {
    const customList = getCustomProducts();
    const customSlugs = new Set(customList.map(p => p.slug));
    return [...customList, ...inMemoryProducts.filter(p => !customSlugs.has(p.slug))];
  },

  async createProduct(newProduct: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product> {
    const created: Product = {
      ...newProduct,
      id: `prod_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // 1. Write to persistent JSON storage on disk
    const customList = getCustomProducts();
    const updated = [created, ...customList.filter(p => p.slug !== created.slug)];
    saveCustomProducts(updated);

    // 2. Update runtime memory cache
    inMemoryProducts = [created, ...inMemoryProducts.filter(p => p.slug !== created.slug)];

    // 3. Mirror to Supabase if credentials are active
    if (isSupabaseConfigured && supabaseAdmin) {
      try {
        const { data: catData } = await supabaseAdmin
          .from('categories')
          .select('id')
          .eq('slug', created.categorySlug)
          .maybeSingle();

        if (catData?.id) {
          const { data: prodData, error: prodErr } = await supabaseAdmin
            .from('products')
            .insert({
              name: created.name,
              slug: created.slug,
              tagline: created.tagline,
              description: created.description,
              category_id: catData.id,
              fabric_and_care: created.fabricAndCare,
              is_published: created.isPublished,
              is_featured: created.isFeatured,
              tags: created.tags,
            })
            .select()
            .single();

          if (!prodErr && prodData?.id) {
            if (created.variants && created.variants.length > 0) {
              const variantRows = created.variants.map((v) => ({
                product_id: prodData.id,
                sku: v.sku,
                color_name: v.colorName,
                color_hex: v.colorHex || '#54121B',
                size: v.size,
                price_kobo: v.priceKobo,
                sale_price_kobo: v.salePriceKobo || null,
                stock_quantity: v.stockQuantity,
                low_stock_threshold: v.lowStockThreshold || 2,
                is_active: true,
              }));
              await supabaseAdmin.from('product_variants').insert(variantRows);
            }

            if (created.images && created.images.length > 0) {
              const imageRows = created.images.map((img, idx) => ({
                product_id: prodData.id,
                url: img.url,
                alt_text: img.altText || created.name,
                is_primary: img.isPrimary,
                sort_order: idx,
              }));
              await supabaseAdmin.from('product_images').insert(imageRows);
            }
          }
        }
      } catch (sbErr) {
        // Silently continue with guaranteed disk persistence
      }
    }

    return created;
  },

  async updateProduct(id: string, updates: Partial<Product>): Promise<Product | null> {
    const customList = getCustomProducts();
    const foundIndex = customList.findIndex(p => p.id === id || p.slug === id);
    let targetProduct: Product | null = null;

    if (foundIndex > -1) {
      customList[foundIndex] = {
        ...customList[foundIndex],
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      targetProduct = customList[foundIndex];
      saveCustomProducts(customList);
    } else {
      const mockFound = mockProducts.find(p => p.id === id || p.slug === id);
      if (mockFound) {
        targetProduct = {
          ...mockFound,
          ...updates,
          updatedAt: new Date().toISOString(),
        };
        customList.unshift(targetProduct);
        saveCustomProducts(customList);
      }
    }

    const memIndex = inMemoryProducts.findIndex((p) => p.id === id || p.slug === id);
    if (memIndex > -1 && targetProduct) {
      inMemoryProducts[memIndex] = targetProduct;
    } else if (targetProduct) {
      inMemoryProducts.unshift(targetProduct);
    }

    return targetProduct;
  },

  async duplicateProduct(id: string): Promise<Product | null> {
    const customList = getCustomProducts();
    const all = [...customList, ...inMemoryProducts];
    const source = all.find((p) => p.id === id || p.slug === id);
    if (!source) return null;

    const copy: Product = {
      ...source,
      id: `prod_${Date.now()}_copy`,
      name: `${source.name} (Copy)`,
      slug: `${source.slug}-copy-${Math.floor(Math.random() * 900)}`,
      isPublished: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      variants: source.variants.map((v) => ({
        ...v,
        id: `var_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
        sku: `${v.sku}-COPY`,
      })),
    };

    customList.unshift(copy);
    saveCustomProducts(customList);
    inMemoryProducts.unshift(copy);
    return copy;
  },

  // ----------------------------------------------------
  // CATEGORIES & COLLECTIONS
  // ----------------------------------------------------
  async getCategories(): Promise<Category[]> {
    return mockCategories;
  },

  async getCategoryBySlug(slug: string): Promise<Category | null> {
    return mockCategories.find((c) => c.slug === slug) || null;
  },

  async getCollections(): Promise<Collection[]> {
    return mockCollections;
  },

  async getCollectionBySlug(slug: string): Promise<Collection | null> {
    return mockCollections.find((c) => c.slug === slug) || null;
  },

  // ----------------------------------------------------
  // DELIVERY ZONES & SHIPPING LOGIC
  // ----------------------------------------------------
  async getDeliveryZones(): Promise<DeliveryZone[]> {
    return mockDeliveryZones;
  },

  matchDeliveryZone(state: string, isAbaPickup: boolean): DeliveryZone | null {
    if (isAbaPickup) {
      return mockDeliveryZones.find((z) => z.id === 'zone_aba_pickup') || null;
    }

    const cleanState = state.trim().toLowerCase();

    // Priority 1: Aba Metropolis Local
    if (cleanState === 'abia' || cleanState.includes('aba')) {
      return mockDeliveryZones.find((z) => z.id === 'zone_aba_local') || null;
    }

    // Priority 2: South-East Regional Transit
    const southEastStates = ['imo', 'enugu', 'anambra', 'ebonyi'];
    if (southEastStates.some((s) => cleanState.includes(s))) {
      return mockDeliveryZones.find((z) => z.id === 'zone_south_east') || null;
    }

    // Priority 3: Lagos, PH & Abuja Corridor
    const corridorStates = ['lagos', 'rivers', 'federal capital territory', 'abuja'];
    if (corridorStates.some((s) => cleanState.includes(s))) {
      return mockDeliveryZones.find((z) => z.id === 'zone_lagos_ph_abuja') || null;
    }

    // Priority 4: Nationwide Standard
    const nationwide = mockDeliveryZones.find((z) => z.id === 'zone_nationwide');
    if (nationwide?.statesIncluded.some((s) => cleanState.includes(s.toLowerCase()))) {
      return nationwide;
    }

    return null; // Quote required if outside mapped zones
  },

  // ----------------------------------------------------
  // CONCURRENCY-SAFE INVENTORY & RESERVATIONS
  // ----------------------------------------------------
  async createStockReservation(
    orderId: string,
    items: { variantId: string; quantity: number }[],
    durationMinutes: number = 15
  ): Promise<{ success: boolean; error?: string; expiresAt?: string }> {
    // If Supabase RPC is available, call it
    if (isSupabaseConfigured && supabaseAdmin) {
      const { data, error } = await supabaseAdmin.rpc('create_order_reservation', {
        p_order_id: orderId,
        p_items: items.map((i) => ({ variant_id: i.variantId, quantity: i.quantity })),
        p_duration_minutes: durationMinutes,
      });

      if (!error && data) return data;
    }

    // Memory implementation of reservation lock
    const now = new Date();
    const expiresAt = new Date(now.getTime() + durationMinutes * 60 * 1000).toISOString();

    // Verify stock availability accounting for existing active reservations
    for (const item of items) {
      let foundVariant = null;
      for (const p of inMemoryProducts) {
        const v = p.variants.find((v) => v.id === item.variantId);
        if (v) {
          foundVariant = v;
          break;
        }
      }

      if (!foundVariant) {
        return { success: false, error: 'Variant not found' };
      }

      // Active reservations
      const activeReserved = inMemoryReservations
        .filter(
          (r) =>
            r.variantId === item.variantId &&
            !r.isReleased &&
            !r.isCommitted &&
            new Date(r.expiresAt) > now
        )
        .reduce((sum, r) => sum + r.quantityReserved, 0);

      const availableStock = foundVariant.stockQuantity - activeReserved;

      if (availableStock < item.quantity) {
        return {
          success: false,
          error: `Insufficient stock for ${foundVariant.sku}. Requested: ${item.quantity}, Available: ${Math.max(availableStock, 0)}`,
        };
      }
    }

    // Create reservations
    for (const item of items) {
      inMemoryReservations.push({
        id: `res_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        orderId,
        variantId: item.variantId,
        quantityReserved: item.quantity,
        expiresAt,
        isReleased: false,
        isCommitted: false,
        createdAt: new Date().toISOString(),
      });
    }

    return { success: true, expiresAt };
  },

  async releaseExpiredReservations(): Promise<{ releasedCount: number }> {
    if (isSupabaseConfigured && supabaseAdmin) {
      const { data, error } = await supabaseAdmin.rpc('release_expired_reservations');
      if (!error && data !== null) {
        return { releasedCount: Number(data) || 0 };
      }
    }

    const now = new Date();
    let released = 0;
    for (const r of inMemoryReservations) {
      if (!r.isCommitted && !r.isReleased && new Date(r.expiresAt) < now) {
        r.isReleased = true;
        released++;
      }
    }
    return { releasedCount: released };
  },

  async settleOrderPayment(
    paymentReference: string,
    amountPaidKobo: number,
    paystackTransactionId?: string
  ): Promise<{ success: boolean; status: string; order?: Order; error?: string }> {
    const order = inMemoryOrders.find((o) => o.paymentReference === paymentReference);
    if (!order) {
      return { success: false, status: 'NOT_FOUND', error: 'Order not found' };
    }

    // Idempotency: if already paid, return early
    if (order.paymentStatus === 'paid') {
      return { success: true, status: 'ALREADY_PAID', order };
    }

    const now = new Date();
    const reservations = inMemoryReservations.filter((r) => r.orderId === order.id);

    // Check for expired reservations where stock became unavailable
    let hasConflict = false;
    for (const res of reservations) {
      if (new Date(res.expiresAt) < now && !res.isCommitted) {
        let currentVariantStock = 0;
        for (const p of inMemoryProducts) {
          const v = p.variants.find((v) => v.id === res.variantId);
          if (v) {
            currentVariantStock = v.stockQuantity;
            break;
          }
        }

        if (currentVariantStock < res.quantityReserved) {
          hasConflict = true;
          break;
        }
      }
    }

    if (hasConflict) {
      // Quarantine order: customer paid late and item was purchased by someone else!
      order.paymentStatus = 'inventory_conflict_quarantined';
      order.internalNotes =
        (order.internalNotes || '') +
        ' [INVENTORY CONFLICT: Customer paid after 15-minute reservation expired. Stock insufficient. Requires merchant action: Restock or Refund]';
      order.timeline.push({
        id: `tl_${Date.now()}`,
        orderId: order.id,
        title: 'Payment Quarantined (Inventory Conflict)',
        description: 'Payment was received after reservation expired. Stock was already claimed. Awaiting owner resolution.',
        actor: 'Paystack Gateway',
        createdAt: new Date().toISOString(),
      });

      return { success: true, status: 'QUARANTINED_INVENTORY_CONFLICT', order };
    }

    // Standard Success: Commit reservations & decrement physical stock
    for (const res of reservations) {
      res.isCommitted = true;
      res.isReleased = false;

      for (const p of inMemoryProducts) {
        const v = p.variants.find((v) => v.id === res.variantId);
        if (v) {
          v.stockQuantity = Math.max(0, v.stockQuantity - res.quantityReserved);
          inMemoryMovements.push({
            id: `mov_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
            variantId: res.variantId,
            changeQuantity: -res.quantityReserved,
            resultingQuantity: v.stockQuantity,
            reason: 'online_sale',
            referenceId: order.orderNumber,
            recordedBy: 'Paystack System',
            notes: 'Confirmed online payment via Paystack',
            createdAt: new Date().toISOString(),
          });
          break;
        }
      }
    }

    order.paymentStatus = 'paid';
    order.paidAt = new Date().toISOString();
    order.timeline.push({
      id: `tl_${Date.now()}`,
      orderId: order.id,
      title: 'Payment Confirmed',
      description: `Payment of ₦${(amountPaidKobo / 100).toLocaleString()} confirmed via Paystack. Ready for fulfillment.`,
      actor: 'Paystack Gateway',
      createdAt: new Date().toISOString(),
    });

    return { success: true, status: 'PAID', order };
  },

  // ----------------------------------------------------
  // RECORD OFFLINE ABA BOUTIQUE / WHATSAPP SALE
  // ----------------------------------------------------
  async recordOfflineSale(params: {
    variantId: string;
    quantity: number;
    unitPriceKobo: number;
    paymentMethod: PaymentMethod;
    staffName: string;
    orderSource: OrderSource;
    customerName?: string;
    customerPhone?: string;
    notes?: string;
  }): Promise<{ success: boolean; order?: Order; error?: string }> {
    let targetProduct: Product | null = null;
    let targetVariant = null;

    for (const p of inMemoryProducts) {
      const v = p.variants.find((v) => v.id === params.variantId);
      if (v) {
        targetProduct = p;
        targetVariant = v;
        break;
      }
    }

    if (!targetProduct || !targetVariant) {
      return { success: false, error: 'Product variant not found' };
    }

    if (targetVariant.stockQuantity < params.quantity) {
      return {
        success: false,
        error: `Insufficient physical stock. Available: ${targetVariant.stockQuantity}, Requested: ${params.quantity}`,
      };
    }

    // Decrement stock
    targetVariant.stockQuantity -= params.quantity;

    // Log movement
    inMemoryMovements.push({
      id: `mov_${Date.now()}`,
      variantId: params.variantId,
      changeQuantity: -params.quantity,
      resultingQuantity: targetVariant.stockQuantity,
      reason: params.orderSource === 'whatsapp_order' ? 'whatsapp_order' : 'offline_sale_aba',
      referenceId: 'OFFLINE-MANUAL',
      recordedBy: params.staffName,
      notes: params.notes || 'In-store Aba walk-in or WhatsApp direct order',
      createdAt: new Date().toISOString(),
    });

    const totalKobo = params.unitPriceKobo * params.quantity;
    const orderNumber = `ARU-OFF-${Math.floor(1000 + Math.random() * 9000)}`;

    const newOrder: Order = {
      id: `ord_${Date.now()}`,
      orderNumber,
      orderSource: params.orderSource,
      customerName: params.customerName || 'Walk-in Customer',
      customerEmail: 'offline@arubekee.internal',
      customerPhone: params.customerPhone || 'N/A',
      deliveryType: 'aba_pickup',
      items: [
        {
          id: `item_${Date.now()}`,
          productId: targetProduct.id,
          variantId: targetVariant.id,
          sku: targetVariant.sku,
          productName: targetProduct.name,
          colorName: targetVariant.colorName,
          size: targetVariant.size,
          unitPriceKobo: params.unitPriceKobo,
          quantity: params.quantity,
          totalKobo,
          imageUrl: targetProduct.images[0]?.url || '',
        },
      ],
      subtotalKobo: totalKobo,
      deliveryFeeKobo: 0,
      discountKobo: 0,
      totalKobo,
      paymentStatus: 'paid',
      paymentMethod: params.paymentMethod,
      fulfillmentStatus: 'delivered',
      paidAt: new Date().toISOString(),
      dispatchedAt: new Date().toISOString(),
      recordedByStaffName: params.staffName,
      internalNotes: params.notes,
      timeline: [
        {
          id: `tl_${Date.now()}`,
          orderId: `ord_${Date.now()}`,
          title: 'Offline Sale Logged',
          description: `Sale of ${params.quantity} item(s) logged by ${params.staffName} via ${params.paymentMethod}. Physical stock deducted.`,
          actor: params.staffName,
          createdAt: new Date().toISOString(),
        },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    inMemoryOrders.unshift(newOrder);
    return { success: true, order: newOrder };
  },

  async adjustStock(params: {
    variantId: string;
    newQuantity: number;
    reason: 'restock' | 'damaged_writeoff' | 'customer_return_restock' | 'inventory_audit';
    staffName: string;
    notes?: string;
  }): Promise<{ success: boolean; variant?: any; error?: string }> {
    for (const p of inMemoryProducts) {
      const v = p.variants.find((v) => v.id === params.variantId);
      if (v) {
        const change = params.newQuantity - v.stockQuantity;
        v.stockQuantity = Math.max(0, params.newQuantity);

        inMemoryMovements.unshift({
          id: `mov_${Date.now()}`,
          variantId: params.variantId,
          changeQuantity: change,
          resultingQuantity: v.stockQuantity,
          reason: params.reason,
          recordedBy: params.staffName,
          notes: params.notes || `Stock adjusted by ${params.staffName}`,
          createdAt: new Date().toISOString(),
        });

        return { success: true, variant: v };
      }
    }
    return { success: false, error: 'Variant not found' };
  },

  async getInventoryMovements(): Promise<InventoryMovement[]> {
    return inMemoryMovements;
  },

  // ----------------------------------------------------
  // ORDERS REPOSITORY
  // ----------------------------------------------------
  async getOrders(filter?: {
    paymentStatus?: string;
    fulfillmentStatus?: string;
    search?: string;
  }): Promise<Order[]> {
    let list = inMemoryOrders;

    if (filter?.paymentStatus) {
      list = list.filter((o) => o.paymentStatus === filter.paymentStatus);
    }
    if (filter?.fulfillmentStatus) {
      list = list.filter((o) => o.fulfillmentStatus === filter.fulfillmentStatus);
    }
    if (filter?.search) {
      const q = filter.search.toLowerCase();
      list = list.filter(
        (o) =>
          o.orderNumber.toLowerCase().includes(q) ||
          o.customerName.toLowerCase().includes(q) ||
          o.customerPhone.includes(q) ||
          o.customerEmail.toLowerCase().includes(q)
      );
    }

    return list;
  },

  async getOrderByNumber(orderNumber: string): Promise<Order | null> {
    return inMemoryOrders.find((o) => o.orderNumber === orderNumber) || null;
  },

  async getOrderById(id: string): Promise<Order | null> {
    return inMemoryOrders.find((o) => o.id === id) || null;
  },

  async saveOrder(order: Order): Promise<Order> {
    const existingIndex = inMemoryOrders.findIndex((o) => o.id === order.id);
    if (existingIndex > -1) {
      inMemoryOrders[existingIndex] = order;
    } else {
      inMemoryOrders.unshift(order);
    }
    return order;
  },

  // ----------------------------------------------------
  // DELIVERY QUOTE REQUESTS
  // ----------------------------------------------------
  async submitDeliveryQuoteRequest(
    quote: Omit<DeliveryQuoteRequest, 'id' | 'status' | 'createdAt'>
  ): Promise<DeliveryQuoteRequest> {
    const created: DeliveryQuoteRequest = {
      ...quote,
      id: `quote_${Date.now()}`,
      status: 'pending_quote',
      createdAt: new Date().toISOString(),
    };

    inMemoryQuotes.unshift(created);
    return created;
  },

  async getDeliveryQuoteRequests(): Promise<DeliveryQuoteRequest[]> {
    return inMemoryQuotes;
  },

  // ----------------------------------------------------
  // DISCOUNT CODES
  // ----------------------------------------------------
  async getDiscountCodes(): Promise<DiscountCode[]> {
    return inMemoryDiscounts;
  },

  async validateDiscountCode(
    code: string,
    subtotalKobo: number
  ): Promise<{ valid: boolean; discountKobo: number; message?: string; discount?: DiscountCode }> {
    const cleanCode = code.trim().toUpperCase();
    const discount = inMemoryDiscounts.find((d) => d.code.toUpperCase() === cleanCode && d.isActive);

    if (!discount) {
      return { valid: false, discountKobo: 0, message: 'Invalid or inactive promotional code' };
    }

    if (discount.minOrderKobo && subtotalKobo < discount.minOrderKobo) {
      const minNaira = (discount.minOrderKobo / 100).toLocaleString();
      return {
        valid: false,
        discountKobo: 0,
        message: `Order must be at least ₦${minNaira} to use this code`,
      };
    }

    if (discount.maxUses && discount.timesUsed >= discount.maxUses) {
      return { valid: false, discountKobo: 0, message: 'This promotion has reached its maximum usage limit' };
    }

    let discountKobo = 0;
    if (discount.discountType === 'percentage') {
      discountKobo = Math.round((subtotalKobo * discount.discountValue) / 100);
    } else {
      discountKobo = Math.min(discount.discountValue, subtotalKobo);
    }

    return {
      valid: true,
      discountKobo,
      discount,
      message: `Discount code ${discount.code} applied!`,
    };
  },

  // ----------------------------------------------------
  // STORE SETTINGS
  // ----------------------------------------------------
  async getStoreSettings(): Promise<StoreSettings> {
    return inMemorySettings;
  },

  async updateStoreSettings(updates: Partial<StoreSettings>): Promise<StoreSettings> {
    inMemorySettings = {
      ...inMemorySettings,
      ...updates,
    };
    return inMemorySettings;
  },
};

