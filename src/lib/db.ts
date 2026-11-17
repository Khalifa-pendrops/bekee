import { 
  Product, 
  Category, 
  Collection, 
  DeliveryZone, 
  DeliveryType,
  ShippingAddress,
  StoreSettings, 
  Order, 
  ImmutableOrderItem,
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

// Persistent Local Disk Storage Helpers for Orders (Survives Dev Restarts & Worker Boundary Reloads)
function getCustomOrders(): Order[] {
  if (typeof window !== 'undefined') {
    return [];
  }
  try {
    const fs = require('fs');
    const path = require('path');
    const filePath = path.join(process.cwd(), 'src', 'data', 'orders.json');
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf-8');
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed)) return parsed as Order[];
    }
  } catch (err) {
    // Ignore read errors
  }
  return [];
}

function saveCustomOrders(orders: Order[]): void {
  if (typeof window !== 'undefined') {
    return;
  }
  try {
    const fs = require('fs');
    const path = require('path');
    const filePath = path.join(process.cwd(), 'src', 'data', 'orders.json');
    fs.writeFileSync(filePath, JSON.stringify(orders, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to save orders to disk:', err);
  }
}

// Helper to transform Supabase relational order row to application Order type
function mapSupabaseOrder(row: any): Order {
  // 1. Map relation items if present
  let mappedItems: ImmutableOrderItem[] = (row.order_items || []).map((i: any) => ({
    id: i.id,
    productId: i.product_id,
    variantId: i.variant_id,
    sku: i.sku,
    productName: i.product_name,
    colorName: i.color_name,
    size: i.size,
    unitPriceKobo: Number(i.unit_price_kobo),
    quantity: Number(i.quantity),
    totalKobo: Number(i.total_kobo),
    imageUrl: i.image_url || '',
  }));

  // 2. Fallback: If relational child table had no rows, recover items snapshot from disk or JSON payload
  if (mappedItems.length === 0) {
    const diskOrders = getCustomOrders();
    const diskMatch = diskOrders.find(
      (o) => o.orderNumber === row.order_number || o.id === row.id || o.paymentReference === row.payment_reference
    );
    if (diskMatch && diskMatch.items && diskMatch.items.length > 0) {
      mappedItems = diskMatch.items;
    } else if (row.shipping_address?._itemsSnapshot && Array.isArray(row.shipping_address._itemsSnapshot)) {
      mappedItems = row.shipping_address._itemsSnapshot;
    }
  }

  // Clean shippingAddress so internal snapshot isn't exposed
  const rawShipping = row.shipping_address;
  let cleanShipping = rawShipping;
  if (rawShipping && rawShipping._itemsSnapshot) {
    const { _itemsSnapshot, ...rest } = rawShipping;
    cleanShipping = rest;
  }

  return {
    id: row.id,
    orderNumber: row.order_number,
    orderSource: row.order_source || 'storefront',
    customerName: row.customer_name,
    customerEmail: row.customer_email,
    customerPhone: row.customer_phone,
    deliveryType: row.delivery_type || 'dispatch_delivery',
    shippingAddress: cleanShipping || undefined,
    items: mappedItems,
    subtotalKobo: Number(row.subtotal_kobo || 0),
    deliveryFeeKobo: Number(row.delivery_fee_kobo || 0),
    discountKobo: Number(row.discount_kobo || 0),
    discountCode: row.discount_code || undefined,
    totalKobo: Number(row.total_kobo || 0),
    paymentStatus: row.payment_status || 'pending',
    paymentMethod: row.payment_method || 'paystack',
    paymentReference: row.payment_reference || undefined,
    paidAt: row.paid_at || undefined,
    fulfillmentStatus: row.fulfillment_status || 'unfulfilled',
    carrierName: row.carrier_name || undefined,
    trackingNumber: row.tracking_number || undefined,
    trackingUrl: row.tracking_url || undefined,
    dispatchedAt: row.dispatched_at || undefined,
    deliveredAt: row.delivered_at || undefined,
    internalNotes: row.internal_notes || undefined,
    recordedByStaffName: row.recorded_by_staff_name || undefined,
    timeline: (row.order_timeline || []).map((t: any) => ({
      id: t.id,
      orderId: t.order_id,
      title: t.title,
      description: t.description || '',
      actor: t.actor || 'System',
      createdAt: t.created_at,
    })),
    createdAt: row.created_at || new Date().toISOString(),
    updatedAt: row.updated_at || new Date().toISOString(),
  };
}

// In-memory runtime state for development mode
let inMemoryProducts: Product[] = [...getCustomProducts(), ...mockProducts];
let inMemoryOrders: Order[] = [...getCustomOrders()];
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
            category:categories(id, name, slug),
            subcategory:subcategories(id, name, slug),
            images:product_images(*),
            variants:product_variants(*)
          `)
          .eq('is_published', true)
          .eq('is_archived', false);

        const { data, error } = await query;
        if (!error && data && data.length > 0) {
          const sbMapped = (data as any[]).map((sb) => {
            const mappedVariants = (sb.variants || []).map((v: any) => ({
              id: v.id,
              productId: sb.id,
              sku: v.sku,
              colorName: v.color_name || 'Standard',
              colorHex: v.color_hex || '#54121B',
              size: v.size,
              priceKobo: v.price_kobo,
              salePriceKobo: v.sale_price_kobo || undefined,
              stockQuantity: v.stock_quantity ?? 5,
              lowStockThreshold: v.low_stock_threshold ?? 2,
              isActive: v.is_active ?? true,
            }));

            const mappedImages = (sb.images || [])
              .sort((a: any, b: any) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
              .map((img: any) => ({
                id: img.id,
                url: img.url,
                altText: img.alt_text || sb.name,
                isPrimary: !!img.is_primary,
                sortOrder: img.sort_order ?? 0,
              }));

            return {
              id: sb.id,
              name: sb.name,
              slug: sb.slug,
              tagline: sb.tagline || '',
              description: sb.description || '',
              categorySlug: sb.category?.slug || 'clothing',
              subCategorySlug: sb.subcategory?.slug || 'dresses',
              collectionSlugs: sb.collection_slugs || ['new-arrivals'],
              fabricAndCare: sb.fabric_and_care || [],
              images: mappedImages,
              variants: mappedVariants,
              hasVariants: mappedVariants.length > 1,
              isPublished: sb.is_published,
              isFeatured: sb.is_featured,
              isArchived: sb.is_archived,
              tags: sb.tags || [],
              createdAt: sb.created_at,
              updatedAt: sb.updated_at,
            } as Product;
          });

          // Supabase is our authoritative database; merge any unique local custom products that haven't synced
          const sbSlugs = new Set(sbMapped.map(s => s.slug));
          results = [...sbMapped, ...customList.filter(s => !sbSlugs.has(s.slug))];
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
    // 1. Fetch full product list (queries Supabase with full relational data)
    const list = await this.getProducts();
    const found = list.find((p) => p.slug === slug || p.id === slug);
    if (found) return found;

    // 2. Check local disk fallback if offline
    const customList = getCustomProducts();
    const foundCustom = customList.find((p) => p.slug === slug || p.id === slug);
    if (foundCustom) return foundCustom;

    // 3. Check inMemory fallback
    return inMemoryProducts.find((p) => p.slug === slug || p.id === slug) || null;
  },

  async getAllProductsForAdmin(): Promise<Product[]> {
    return this.getProducts();
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

        const { data: subData } = await supabaseAdmin
          .from('subcategories')
          .select('id')
          .eq('slug', created.subCategorySlug)
          .maybeSingle();

        if (catData?.id) {
          const { data: existingProd } = await supabaseAdmin
            .from('products')
            .select('id')
            .eq('slug', created.slug)
            .maybeSingle();

          let prodId = existingProd?.id;

          if (prodId) {
            await supabaseAdmin.from('products').update({
              name: created.name,
              tagline: created.tagline,
              description: created.description,
              category_id: catData.id,
              subcategory_id: subData?.id || null,
              fabric_and_care: created.fabricAndCare,
              is_published: created.isPublished,
              is_featured: created.isFeatured,
              tags: created.tags,
              updated_at: new Date().toISOString(),
            }).eq('id', prodId);
          } else {
            const { data: prodData } = await supabaseAdmin
              .from('products')
              .insert({
                name: created.name,
                slug: created.slug,
                tagline: created.tagline,
                description: created.description,
                category_id: catData.id,
                subcategory_id: subData?.id || null,
                fabric_and_care: created.fabricAndCare,
                is_published: created.isPublished,
                is_featured: created.isFeatured,
                tags: created.tags,
              })
              .select()
              .single();
            prodId = prodData?.id;
          }

          if (prodId) {
            await supabaseAdmin.from('product_variants').delete().eq('product_id', prodId);
            if (created.variants && created.variants.length > 0) {
              const variantRows = created.variants.map((v) => ({
                product_id: prodId,
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

            await supabaseAdmin.from('product_images').delete().eq('product_id', prodId);
            if (created.images && created.images.length > 0) {
              const imageRows = created.images.map((img, idx) => ({
                product_id: prodId,
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

    // Mirror updates to Supabase
    if (isSupabaseConfigured && supabaseAdmin && targetProduct) {
      try {
        const { data: existingProd } = await supabaseAdmin
          .from('products')
          .select('id')
          .or(`id.eq.${id},slug.eq.${targetProduct.slug}`)
          .maybeSingle();

        if (existingProd?.id) {
          await supabaseAdmin.from('products').update({
            name: targetProduct.name,
            tagline: targetProduct.tagline,
            description: targetProduct.description,
            fabric_and_care: targetProduct.fabricAndCare,
            is_published: targetProduct.isPublished,
            is_featured: targetProduct.isFeatured,
            is_archived: targetProduct.isArchived,
            tags: targetProduct.tags,
            updated_at: new Date().toISOString(),
          }).eq('id', existingProd.id);

          if (updates.variants) {
            await supabaseAdmin.from('product_variants').delete().eq('product_id', existingProd.id);
            const variantRows = updates.variants.map((v) => ({
              product_id: existingProd.id,
              sku: v.sku,
              color_name: v.colorName,
              color_hex: v.colorHex || '#54121B',
              size: v.size,
              price_kobo: v.priceKobo,
              sale_price_kobo: v.salePriceKobo || null,
              stock_quantity: v.stockQuantity,
              low_stock_threshold: v.lowStockThreshold || 2,
              is_active: v.isActive ?? true,
            }));
            await supabaseAdmin.from('product_variants').insert(variantRows);
          }

          if (updates.images) {
            await supabaseAdmin.from('product_images').delete().eq('product_id', existingProd.id);
            const imageRows = updates.images.map((img, idx) => ({
              product_id: existingProd.id,
              url: img.url,
              alt_text: img.altText || targetProduct!.name,
              is_primary: img.isPrimary,
              sort_order: idx,
            }));
            await supabaseAdmin.from('product_images').insert(imageRows);
          }
        }
      } catch (err) {
        // Fall back cleanly
      }
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
    const allProducts = await this.getProducts();
    const now = new Date();
    const expiresAt = new Date(now.getTime() + durationMinutes * 60 * 1000).toISOString();

    // Verify stock availability accounting for existing active reservations
    for (const item of items) {
      let foundVariant: any = null;
      for (const p of allProducts) {
        const v = p.variants.find(
          (v) =>
            v.id === item.variantId ||
            v.sku === item.variantId ||
            (v.sku && item.variantId && v.sku.toLowerCase() === item.variantId.toLowerCase())
        );
        if (v) {
          foundVariant = v;
          break;
        }
      }

      // Supabase direct lookup fallback if needed
      if (!foundVariant && isSupabaseConfigured && supabaseAdmin) {
        try {
          const { data: sbVar } = await supabaseAdmin
            .from('product_variants')
            .select('*')
            .or(`id.eq.${item.variantId},sku.eq.${item.variantId}`)
            .maybeSingle();

          if (sbVar) {
            foundVariant = {
              id: sbVar.id,
              sku: sbVar.sku,
              stockQuantity: sbVar.stock_quantity ?? 5,
              priceKobo: sbVar.price_kobo,
            };
          }
        } catch (e) {
          // Ignore
        }
      }

      if (!foundVariant) {
        return { success: false, error: 'Variant not found' };
      }

      // Active reservations
      const activeReserved = inMemoryReservations
        .filter(
          (r) =>
            (r.variantId === foundVariant.id || r.variantId === item.variantId) &&
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
    paystackTransactionId?: string,
    fallbackMetadata?: {
      orderId?: string;
      orderNumber?: string;
      customerName?: string;
      customerEmail?: string;
      customerPhone?: string;
      deliveryZone?: string;
    }
  ): Promise<{ success: boolean; status: string; order?: Order; error?: string }> {
    // 1. Locate order across in-memory and disk persistence
    let diskOrders = getCustomOrders();
    let order = inMemoryOrders.find((o) => o.paymentReference === paymentReference) ||
                diskOrders.find((o) => o.paymentReference === paymentReference);

    // 2. Secondary lookup by metadata orderId or orderNumber if reference differed
    if (!order && fallbackMetadata) {
      if (fallbackMetadata.orderId) {
        order = inMemoryOrders.find((o) => o.id === fallbackMetadata.orderId) ||
                diskOrders.find((o) => o.id === fallbackMetadata.orderId);
      }
      if (!order && fallbackMetadata.orderNumber) {
        order = inMemoryOrders.find((o) => o.orderNumber === fallbackMetadata.orderNumber) ||
                diskOrders.find((o) => o.orderNumber === fallbackMetadata.orderNumber);
      }
    }

    // 3. Fallback: Reconstruct and rescue order from verified Paystack gateway response
    if (!order && fallbackMetadata) {
      console.warn(`[db.settleOrderPayment] Rescuing order from Paystack metadata for ref: ${paymentReference}`);
      const derivedOrderNum = fallbackMetadata.orderNumber || 
        (paymentReference.includes('ARUBEKEE-') ? paymentReference.split('_')[2] : 
        (paymentReference.includes('ARU-') ? paymentReference.split('_')[2] : 
        `ARUBEKEE-${Date.now().toString().slice(-6)}`));
      const derivedOrderId = fallbackMetadata.orderId || `ord_${Date.now()}_rec`;

      order = {
        id: derivedOrderId,
        orderNumber: derivedOrderNum,
        orderSource: 'storefront',
        customerName: fallbackMetadata.customerName || 'Online Shopper',
        customerEmail: fallbackMetadata.customerEmail || 'customer@arubekee.internal',
        customerPhone: fallbackMetadata.customerPhone || 'N/A',
        deliveryType: 'dispatch_delivery',
        shippingAddress: {
          fullName: fallbackMetadata.customerName || 'Online Shopper',
          email: fallbackMetadata.customerEmail || 'customer@arubekee.internal',
          phone: fallbackMetadata.customerPhone || 'N/A',
          state: fallbackMetadata.deliveryZone || 'Nigeria',
          city: 'Standard Delivery Route',
          streetAddress: 'Online Order Delivery',
        },
        items: [],
        subtotalKobo: amountPaidKobo,
        deliveryFeeKobo: 0,
        discountKobo: 0,
        totalKobo: amountPaidKobo,
        paymentStatus: 'pending',
        paymentMethod: 'paystack',
        paymentReference,
        fulfillmentStatus: 'unfulfilled',
        internalNotes: `Delivery Zone: ${fallbackMetadata.deliveryZone || 'Standard'}. [Auto-recovered & reconciled via Paystack gateway ${paystackTransactionId || ''}]`,
        timeline: [
          {
            id: `tl_${Date.now()}_init`,
            orderId: derivedOrderId,
            title: 'Order Recovered & Verified',
            description: `Payment of ₦${(amountPaidKobo / 100).toLocaleString()} authoritatively verified with Paystack.`,
            actor: 'Paystack Gateway',
            createdAt: new Date().toISOString(),
          },
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      inMemoryOrders.unshift(order);
      diskOrders.unshift(order);
      saveCustomOrders(diskOrders);
    }

    if (!order) {
      return { success: false, status: 'NOT_FOUND', error: 'Matching order not found for this transaction reference.' };
    }

    // Idempotency: if already marked paid, return early
    if (order.paymentStatus === 'paid') {
      return { success: true, status: 'ALREADY_PAID', order };
    }

    const now = new Date();
    const reservations = inMemoryReservations.filter((r) => r.orderId === order.id);

    // Check for expired reservations where stock became unavailable
    let hasConflict = false;
    const allProds = await this.getProducts();

    for (const res of reservations) {
      if (new Date(res.expiresAt) < now && !res.isCommitted) {
        let currentVariantStock = 0;
        for (const p of allProds) {
          const v = p.variants.find((v) => v.id === res.variantId || v.sku === res.variantId);
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

      // Persist state update
      this.saveOrder(order);
      return { success: true, status: 'QUARANTINED_INVENTORY_CONFLICT', order };
    }

    // Standard Success: Commit reservations & decrement physical stock
    if (reservations.length > 0) {
      for (const res of reservations) {
        res.isCommitted = true;
        res.isReleased = false;

        for (const p of allProds) {
          const v = p.variants.find((v) => v.id === res.variantId || v.sku === res.variantId);
          if (v) {
            v.stockQuantity = Math.max(0, v.stockQuantity - res.quantityReserved);

            // Mirror to Supabase if configured
            if (isSupabaseConfigured && supabaseAdmin) {
              supabaseAdmin
                .from('product_variants')
                .update({ stock_quantity: v.stockQuantity })
                .or(`id.eq.${res.variantId},sku.eq.${res.variantId}`)
                .then(() => {});
            }

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
    } else if (order.items && order.items.length > 0) {
      // Fallback stock deduction if reservation was cleared across worker boundary
      for (const item of order.items) {
        for (const p of allProds) {
          const v = p.variants.find((v) => v.id === item.variantId || v.sku === item.variantId);
          if (v) {
            v.stockQuantity = Math.max(0, v.stockQuantity - item.quantity);

            // Mirror to Supabase if configured
            if (isSupabaseConfigured && supabaseAdmin) {
              supabaseAdmin
                .from('product_variants')
                .update({ stock_quantity: v.stockQuantity })
                .or(`id.eq.${item.variantId},sku.eq.${item.variantId}`)
                .then(() => {});
            }

            inMemoryMovements.push({
              id: `mov_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
              variantId: item.variantId,
              changeQuantity: -item.quantity,
              resultingQuantity: v.stockQuantity,
              reason: 'online_sale',
              referenceId: order.orderNumber,
              recordedBy: 'Paystack System',
              notes: 'Confirmed online payment via Paystack (reconciled item)',
              createdAt: new Date().toISOString(),
            });
            break;
          }
        }
      }
    }

    order.paymentStatus = 'paid';
    order.paidAt = new Date().toISOString();
    order.timeline.push({
      id: `tl_${Date.now()}`,
      orderId: order.id,
      title: 'Payment Confirmed',
      description: `Payment of ₦${(amountPaidKobo / 100).toLocaleString()} confirmed via Paystack (${paystackTransactionId || 'Gateway'}). Ready for fulfillment.`,
      actor: 'Paystack Gateway',
      createdAt: new Date().toISOString(),
    });

    // Persist changes to disk and in-memory
    await this.saveOrder(order);

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
    isInvoice?: boolean;
    deliveryFeeKobo?: number;
    deliveryType?: 'aba_pickup' | 'state_capital' | 'major_city' | 'remote_area';
    shippingAddress?: {
      streetAddress: string;
      city: string;
      state: string;
      landmark?: string;
    };
  }): Promise<{ success: boolean; order?: Order; error?: string }> {
    const allProds = await this.getProducts();
    let targetProduct: Product | null = null;
    let targetVariant: any = null;

    for (const p of allProds) {
      const v = p.variants.find((v) => v.id === params.variantId || v.sku === params.variantId);
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

    // Decrement / reserve physical stock for this invoice/sale
    targetVariant.stockQuantity -= params.quantity;

    if (isSupabaseConfigured && supabaseAdmin) {
      supabaseAdmin
        .from('product_variants')
        .update({ stock_quantity: targetVariant.stockQuantity })
        .or(`id.eq.${params.variantId},sku.eq.${params.variantId}`)
        .then(() => {});
    }

    // Log movement
    inMemoryMovements.push({
      id: `mov_${Date.now()}`,
      variantId: params.variantId,
      changeQuantity: -params.quantity,
      resultingQuantity: targetVariant.stockQuantity,
      reason: params.isInvoice ? 'whatsapp_order' : (params.orderSource === 'whatsapp_order' ? 'whatsapp_order' : 'offline_sale_aba'),
      referenceId: params.isInvoice ? 'INVOICE-RESERVED' : 'OFFLINE-MANUAL',
      recordedBy: params.staffName,
      notes: params.notes || (params.isInvoice ? 'WhatsApp direct invoice generated' : 'In-store Aba walk-in or WhatsApp sale'),
      createdAt: new Date().toISOString(),
    });

    const subtotalKobo = params.unitPriceKobo * params.quantity;
    const deliveryFeeKobo = params.deliveryFeeKobo || 0;
    const totalKobo = subtotalKobo + deliveryFeeKobo;
    const isPendingInvoice = !!params.isInvoice;
    const orderNumber = isPendingInvoice
      ? `ARUBEKEE-INV-${Math.floor(1000 + Math.random() * 9000)}`
      : `ARUBEKEE-OFF-${Math.floor(1000 + Math.random() * 9000)}`;

    const deliveryType: DeliveryType = params.deliveryType === 'aba_pickup' ? 'aba_pickup' : 'dispatch_delivery';
    const isShipped = deliveryType !== 'aba_pickup';

    const shippingAddress: ShippingAddress | undefined = params.shippingAddress
      ? {
          fullName: params.customerName || (isPendingInvoice ? 'WhatsApp Client' : 'Walk-in Customer'),
          phone: params.customerPhone || 'N/A',
          email: 'offline@arubekee.internal',
          streetAddress: params.shippingAddress.streetAddress,
          city: params.shippingAddress.city,
          state: params.shippingAddress.state,
          landmark: params.shippingAddress.landmark,
        }
      : undefined;

    const newOrder: Order = {
      id: `ord_${Date.now()}`,
      orderNumber,
      orderSource: params.orderSource,
      customerName: params.customerName || (isPendingInvoice ? 'WhatsApp Client' : 'Walk-in Customer'),
      customerEmail: 'offline@arubekee.internal',
      customerPhone: params.customerPhone || 'N/A',
      deliveryType,
      shippingAddress,
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
          totalKobo: subtotalKobo,
          imageUrl: targetProduct.images[0]?.url || '',
        },
      ],
      subtotalKobo,
      deliveryFeeKobo,
      discountKobo: 0,
      totalKobo,
      paymentStatus: isPendingInvoice ? 'pending' : 'paid',
      paymentMethod: params.paymentMethod,
      fulfillmentStatus: isPendingInvoice ? 'unfulfilled' : (isShipped ? 'unfulfilled' : 'delivered'),
      paidAt: isPendingInvoice ? undefined : new Date().toISOString(),
      dispatchedAt: (!isPendingInvoice && !isShipped) ? new Date().toISOString() : undefined,
      recordedByStaffName: params.staffName,
      internalNotes: params.notes,
      timeline: [
        {
          id: `tl_${Date.now()}`,
          orderId: `ord_${Date.now()}`,
          title: isPendingInvoice ? 'WhatsApp Invoice Issued' : 'Offline Sale Logged',
          description: isPendingInvoice
            ? `Invoice for ${params.quantity} item(s) issued to ${params.customerName || 'customer'} by ${params.staffName}. Stock reserved.`
            : `Sale of ${params.quantity} item(s) logged by ${params.staffName} via ${params.paymentMethod}. Physical stock deducted.`,
          actor: params.staffName,
          createdAt: new Date().toISOString(),
        },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    inMemoryOrders.unshift(newOrder);
    saveCustomOrders(inMemoryOrders);
    return { success: true, order: newOrder };
  },

  async adjustStock(params: {
    variantId: string;
    newQuantity: number;
    reason: 'restock' | 'damaged_writeoff' | 'customer_return_restock' | 'inventory_audit';
    staffName: string;
    notes?: string;
  }): Promise<{ success: boolean; variant?: any; error?: string }> {
    const allProds = await this.getProducts();
    for (const p of allProds) {
      const v = p.variants.find((v) => v.id === params.variantId || v.sku === params.variantId);
      if (v) {
        const change = params.newQuantity - v.stockQuantity;
        v.stockQuantity = Math.max(0, params.newQuantity);

        if (isSupabaseConfigured && supabaseAdmin) {
          supabaseAdmin
            .from('product_variants')
            .update({ stock_quantity: v.stockQuantity })
            .or(`id.eq.${params.variantId},sku.eq.${params.variantId}`)
            .then(() => {});
        }

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
    const orderMap = new Map<string, Order>();

    // 1. Seed from local persistent disk storage and in-memory cache
    const diskOrders = getCustomOrders();
    for (const o of diskOrders) {
      if (o.orderNumber) orderMap.set(o.orderNumber, o);
    }
    for (const o of inMemoryOrders) {
      if (o.orderNumber) orderMap.set(o.orderNumber, o);
    }

    // 2. Fetch from Supabase if configured and merge
    if (isSupabaseConfigured && supabaseAdmin) {
      try {
        let query = supabaseAdmin
          .from('orders')
          .select(`
            *,
            order_items(*),
            order_timeline(*)
          `)
          .order('created_at', { ascending: false });

        if (filter?.paymentStatus) query = query.eq('payment_status', filter.paymentStatus);
        if (filter?.fulfillmentStatus) query = query.eq('fulfillment_status', filter.fulfillmentStatus);

        const { data, error } = await query;
        if (!error && data && data.length > 0) {
          for (const row of data) {
            const mapped = mapSupabaseOrder(row);
            const existing = orderMap.get(mapped.orderNumber);
            if (existing) {
              // Preserve full item details if Supabase order_items had no children
              if ((!mapped.items || mapped.items.length === 0) && existing.items && existing.items.length > 0) {
                mapped.items = existing.items;
              }
            }
            orderMap.set(mapped.orderNumber, mapped);
          }
        }
      } catch (err) {
        // Fallback gracefully to local disk and memory
      }
    }

    let list = Array.from(orderMap.values()).sort(
      (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
    );

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
    if (isSupabaseConfigured && supabaseAdmin) {
      try {
        const { data, error } = await supabaseAdmin
          .from('orders')
          .select(`*, order_items(*), order_timeline(*)`)
          .eq('order_number', orderNumber)
          .maybeSingle();
        if (!error && data) {
          return mapSupabaseOrder(data);
        }
      } catch (err) {
        // Fallback to local
      }
    }

    const inMem = inMemoryOrders.find((o) => o.orderNumber === orderNumber);
    if (inMem) return inMem;
    const disk = getCustomOrders().find((o) => o.orderNumber === orderNumber);
    if (disk) {
      if (!inMemoryOrders.some((o) => o.id === disk.id)) inMemoryOrders.unshift(disk);
      return disk;
    }
    return null;
  },

  async getOrderById(id: string): Promise<Order | null> {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

    if (isSupabaseConfigured && supabaseAdmin) {
      try {
        let query = supabaseAdmin.from('orders').select(`*, order_items(*), order_timeline(*)`);
        if (isUuid) {
          query = query.eq('id', id);
        } else {
          query = query.eq('order_number', id);
        }
        const { data, error } = await query.maybeSingle();
        if (!error && data) {
          return mapSupabaseOrder(data);
        }
      } catch (err) {
        // Fallback to local
      }
    }

    const inMem = inMemoryOrders.find((o) => o.id === id || o.orderNumber === id);
    if (inMem) return inMem;
    const disk = getCustomOrders().find((o) => o.id === id || o.orderNumber === id);
    if (disk) {
      if (!inMemoryOrders.some((o) => o.id === disk.id)) inMemoryOrders.unshift(disk);
      return disk;
    }
    return null;
  },

  async getOrderByPaymentReference(paymentReference: string): Promise<Order | null> {
    if (isSupabaseConfigured && supabaseAdmin) {
      try {
        const { data, error } = await supabaseAdmin
          .from('orders')
          .select(`*, order_items(*), order_timeline(*)`)
          .eq('payment_reference', paymentReference)
          .maybeSingle();
        if (!error && data) {
          return mapSupabaseOrder(data);
        }
      } catch (err) {
        // Fallback to local
      }
    }

    const inMem = inMemoryOrders.find((o) => o.paymentReference === paymentReference);
    if (inMem) return inMem;
    const disk = getCustomOrders().find((o) => o.paymentReference === paymentReference);
    if (disk) {
      if (!inMemoryOrders.some((o) => o.id === disk.id)) inMemoryOrders.unshift(disk);
      return disk;
    }
    return null;
  },

  async saveOrder(order: Order): Promise<Order> {
    // 1. Immediately persist to local disk and memory for synchronous speed
    const diskOrders = getCustomOrders();
    const diskIdx = diskOrders.findIndex((o) => o.id === order.id || o.orderNumber === order.orderNumber || o.paymentReference === order.paymentReference);

    // Safeguard: Preserve items if incoming update has empty items
    if ((!order.items || order.items.length === 0) && diskIdx > -1 && diskOrders[diskIdx].items && diskOrders[diskIdx].items.length > 0) {
      order.items = diskOrders[diskIdx].items;
    }

    if (diskIdx > -1) {
      diskOrders[diskIdx] = order;
    } else {
      diskOrders.unshift(order);
    }
    saveCustomOrders(diskOrders);

    const memIdx = inMemoryOrders.findIndex((o) => o.id === order.id || o.orderNumber === order.orderNumber || o.paymentReference === order.paymentReference);
    if (memIdx > -1) {
      inMemoryOrders[memIdx] = order;
    } else {
      inMemoryOrders.unshift(order);
    }

    // 2. Sync to Supabase cloud database
    if (isSupabaseConfigured && supabaseAdmin) {
      try {
        const payload: any = {
          order_number: order.orderNumber,
          order_source: order.orderSource,
          customer_name: order.customerName,
          customer_email: order.customerEmail,
          customer_phone: order.customerPhone,
          delivery_type: order.deliveryType,
          shipping_address: order.shippingAddress
            ? { ...order.shippingAddress, _itemsSnapshot: order.items }
            : { _itemsSnapshot: order.items },
          subtotal_kobo: order.subtotalKobo,
          delivery_fee_kobo: order.deliveryFeeKobo,
          discount_kobo: order.discountKobo,
          discount_code: order.discountCode || null,
          total_kobo: order.totalKobo,
          payment_status: order.paymentStatus,
          payment_method: order.paymentMethod,
          payment_reference: order.paymentReference || null,
          paid_at: order.paidAt || null,
          fulfillment_status: order.fulfillmentStatus,
          carrier_name: order.carrierName || null,
          tracking_number: order.trackingNumber || null,
          tracking_url: order.trackingUrl || null,
          dispatched_at: order.dispatchedAt || null,
          delivered_at: order.deliveredAt || null,
          internal_notes: order.internalNotes || null,
          recorded_by_staff_name: order.recordedByStaffName || null,
          updated_at: new Date().toISOString(),
        };

        const { data: upsertedOrder, error: upsertError } = await supabaseAdmin
          .from('orders')
          .upsert(payload, { onConflict: 'order_number' })
          .select('id')
          .maybeSingle();

        if (upsertError) {
          console.warn('[db.saveOrder] Supabase sync notice:', upsertError.message);
        } else if (upsertedOrder?.id && order.items && order.items.length > 0) {
          // Sync items to order_items child table
          try {
            await supabaseAdmin.from('order_items').delete().eq('order_id', upsertedOrder.id);
            const itemRows = order.items.map((i) => ({
              order_id: upsertedOrder.id,
              product_id: i.productId,
              variant_id: i.variantId,
              sku: i.sku,
              product_name: i.productName,
              color_name: i.colorName,
              size: i.size,
              unit_price_kobo: i.unitPriceKobo,
              quantity: i.quantity,
              total_kobo: i.totalKobo,
              image_url: i.imageUrl || '',
            }));
            await supabaseAdmin.from('order_items').insert(itemRows);
          } catch (itemErr: any) {
            console.warn('[db.saveOrder] Order items sync notice:', itemErr.message);
          }
        }
      } catch (err: any) {
        console.warn('[db.saveOrder] Supabase sync exception:', err.message);
      }
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

