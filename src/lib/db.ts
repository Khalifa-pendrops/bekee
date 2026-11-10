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
  OrderSource
} from '@/types';
import { 
  mockProducts, 
  mockCategories, 
  mockCollections, 
  mockDeliveryZones, 
  mockStoreSettings 
} from '@/data/mockData';
import { isSupabaseConfigured, supabaseAdmin } from './supabase';

// In-memory runtime state for development mode
let inMemoryProducts: Product[] = [...mockProducts];
let inMemoryOrders: Order[] = [];
let inMemoryReservations: StockReservation[] = [];
let inMemoryMovements: InventoryMovement[] = [];
let inMemoryQuotes: DeliveryQuoteRequest[] = [];
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
    if (isSupabaseConfigured && supabaseAdmin) {
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
      if (!error && data) {
        return data as Product[];
      }
    }

    // Local in-memory repository fallback
    let results = inMemoryProducts.filter((p) => p.isPublished && !p.isArchived);

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
      const q = params.search.toLowerCase();
      results = results.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q)) ||
          p.categorySlug.toLowerCase().includes(q)
      );
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
    const list = await this.getProducts();
    const found = list.find((p) => p.slug === slug);
    return found || null;
  },

  async getAllProductsForAdmin(): Promise<Product[]> {
    return inMemoryProducts;
  },

  async createProduct(newProduct: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product> {
    const created: Product = {
      ...newProduct,
      id: `prod_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    inMemoryProducts.unshift(created);
    return created;
  },

  async updateProduct(id: string, updates: Partial<Product>): Promise<Product | null> {
    const index = inMemoryProducts.findIndex((p) => p.id === id);
    if (index === -1) return null;

    inMemoryProducts[index] = {
      ...inMemoryProducts[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    return inMemoryProducts[index];
  },

  async duplicateProduct(id: string): Promise<Product | null> {
    const source = inMemoryProducts.find((p) => p.id === id);
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

