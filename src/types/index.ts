// ==========================================
// ARUBEKEE COLLECTION - DOMAIN TYPES
// Currency: NGN (Naira) stored as integer Kobo (1 NGN = 100 Kobo)
// Location: Aba, Abia State, Nigeria
// Timezone: Africa/Lagos
// ==========================================

export type Currency = 'NGN';

export type CategorySlug = 'clothing' | 'shoes' | 'bags' | 'accessories';

export interface SubCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  categorySlug: CategorySlug;
}

export interface Category {
  id: string;
  name: string;
  slug: CategorySlug;
  description: string;
  subcategories: SubCategory[];
  sizeSystem: 'clothing_uk' | 'shoes_eu' | 'standard_alpha' | 'dimension_or_none';
  imagePlaceholder?: string;
}

export interface Collection {
  id: string;
  name: string;
  slug: 'new-arrivals' | 'workwear' | 'weekend-looks' | 'occasion-wear' | 'sale' | string;
  tagline: string;
  description: string;
  bannerImage?: string;
  isFeatured: boolean;
  itemCount?: number;
}

export type ClothingSize = 'UK 6' | 'UK 8' | 'UK 10' | 'UK 12' | 'UK 14' | 'UK 16' | 'UK 18' | 'UK 20';
export type ShoeSize = 'EU 36' | 'EU 37' | 'EU 38' | 'EU 39' | 'EU 40' | 'EU 41' | 'EU 42';
export type StandardSize = 'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL' | 'One Size';

export interface ProductVariant {
  id: string;
  productId: string;
  sku: string;
  colorName: string;
  colorHex?: string;
  size: string; // e.g. "UK 10", "EU 39", or "One Size"
  priceKobo: number; // Integer kobo (e.g. 35,000 NGN = 3,500,000 kobo)
  salePriceKobo?: number; // Optional genuine sale price
  stockQuantity: number;
  lowStockThreshold: number;
  barcode?: string;
  isActive: boolean;
}

export interface ProductImage {
  id: string;
  url: string;
  altText: string;
  isPrimary: boolean;
  sortOrder: number;
  colorAssociation?: string; // Optional filter matching variant color
}

export interface SizeGuideMeasurement {
  size: string;
  bustCm?: string;
  waistCm?: string;
  hipCm?: string;
  lengthCm?: string;
  footLengthCm?: string;
  ukEquivalent?: string;
  usEquivalent?: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  tagline?: string;
  description: string;
  categorySlug: CategorySlug;
  subCategorySlug: string;
  collectionSlugs: string[];
  fabricAndCare?: string[];
  stylingTips?: string;
  images: ProductImage[];
  variants: ProductVariant[];
  hasVariants: boolean;
  isPublished: boolean;
  isArchived: boolean;
  isFeatured: boolean;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

// ------------------------------------------
// CART & WISHLIST
// ------------------------------------------

export interface CartItem {
  id: string; // Composite: `${productId}-${variantId}`
  productId: string;
  variantId: string;
  productName: string;
  productSlug: string;
  image: string;
  colorName: string;
  size: string;
  unitPriceKobo: number;
  originalPriceKobo?: number;
  quantity: number;
  maxAvailableStock: number;
}

export interface Cart {
  items: CartItem[];
  subtotalKobo: number;
  totalQuantity: number;
}

export interface WishlistItem {
  productId: string;
  productSlug: string;
  productName: string;
  primaryImage: string;
  startingPriceKobo: number;
  originalPriceKobo?: number;
  hasSale: boolean;
  categorySlug: CategorySlug;
  addedAt: string;
}

// ------------------------------------------
// NIGERIAN CHECKOUT & DELIVERY
// ------------------------------------------

export type DeliveryType = 'aba_pickup' | 'dispatch_delivery' | 'quote_required';

export interface DeliveryZone {
  id: string;
  name: string; // e.g. "Aba Central Express", "South East Transit", "Lagos / Abuja Corridor", "Nationwide Standard"
  description: string;
  estimatedDays: string;
  statesIncluded: string[]; // Nigerian states matching this zone
  feeKobo: number;
  freeShippingAboveKobo?: number;
  isActive: boolean;
  priorityOrder: number;
}

export interface ShippingAddress {
  fullName: string;
  phone: string; // Nigerian format (e.g. 080... or +234...)
  alternatePhone?: string;
  email: string;
  state: string; // Nigerian State (Abia, Lagos, Rivers, Abuja FCT, etc.)
  city: string; // e.g. Aba, Port Harcourt, Ikeja
  streetAddress: string;
  landmark?: string; // Crucial in Nigeria for courier delivery
  deliveryInstructions?: string;
}

export interface DeliveryQuoteRequest {
  id: string;
  customerName: string;
  phone: string;
  email: string;
  state: string;
  city: string;
  streetAddress: string;
  landmark?: string;
  items: {
    productName: string;
    variantSummary: string;
    quantity: number;
    subtotalKobo: number;
  }[];
  subtotalKobo: number;
  quotedDeliveryFeeKobo?: number;
  status: 'pending_quote' | 'quoted' | 'accepted_and_paid' | 'declined';
  ownerNotes?: string;
  createdAt: string;
  checkoutLinkSentAt?: string;
}

export interface DiscountCode {
  id: string;
  code: string;
  discountType: 'percentage' | 'fixed_kobo';
  discountValue: number; // e.g., 10 for 10% or 500000 for 5,000 NGN
  minOrderKobo?: number;
  maxUses?: number;
  timesUsed: number;
  startsAt?: string;
  expiresAt?: string;
  isActive: boolean;
}

// ------------------------------------------
// ORDERS & FULFILLMENT
// ------------------------------------------

export type PaymentStatus = 
  | 'pending' 
  | 'paid' 
  | 'failed' 
  | 'expired' 
  | 'refund_pending' 
  | 'refunded' 
  | 'partially_refunded'
  | 'inventory_conflict_quarantined'; // For late payments after reservation expired

export type FulfillmentStatus = 
  | 'unfulfilled' 
  | 'ready_for_pickup' 
  | 'dispatched' 
  | 'delivered' 
  | 'cancelled' 
  | 'returned';

export type PaymentMethod = 'paystack' | 'bank_transfer_offline' | 'cash_in_store' | 'pos_terminal';

export type OrderSource = 'storefront' | 'offline_aba_store' | 'whatsapp_order';

export interface ImmutableOrderItem {
  id: string;
  productId: string;
  variantId: string;
  sku: string;
  productName: string;
  colorName: string;
  size: string;
  unitPriceKobo: number;
  quantity: number;
  totalKobo: number;
  imageUrl: string;
}

export interface OrderTimelineEvent {
  id: string;
  orderId: string;
  title: string;
  description: string;
  actor: string; // 'System', 'Customer', or Staff Name
  createdAt: string;
}

export interface Order {
  id: string;
  orderNumber: string; // Human friendly e.g. "ARU-2611-9481"
  orderSource: OrderSource;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  deliveryType: DeliveryType;
  shippingAddress?: ShippingAddress;
  items: ImmutableOrderItem[];
  
  // Financial breakdown (all in kobo)
  subtotalKobo: number;
  deliveryFeeKobo: number;
  discountKobo: number;
  discountCode?: string;
  totalKobo: number;
  
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  paymentReference?: string;
  paidAt?: string;
  
  fulfillmentStatus: FulfillmentStatus;
  dispatchedAt?: string;
  deliveredAt?: string;
  carrierName?: string;
  trackingNumber?: string;
  trackingUrl?: string;
  
  internalNotes?: string;
  recordedByStaffName?: string; // For offline Aba sales
  timeline: OrderTimelineEvent[];
  
  createdAt: string;
  updatedAt: string;
}

// ------------------------------------------
// INVENTORY RESERVATION & AUDIT
// ------------------------------------------

export interface StockReservation {
  id: string;
  orderId: string;
  variantId: string;
  quantityReserved: number;
  expiresAt: string; // Typically 15 minutes from reservation
  isReleased: boolean;
  isCommitted: boolean;
  createdAt: string;
}

export interface InventoryMovement {
  id: string;
  variantId: string;
  changeQuantity: number; // Positive for restock, negative for sale
  resultingQuantity: number;
  reason: 'online_sale' | 'offline_sale_aba' | 'whatsapp_order' | 'restock' | 'damaged_writeoff' | 'customer_return_restock' | 'inventory_audit';
  referenceId?: string; // orderId or auditId
  recordedBy: string;
  notes?: string;
  createdAt: string;
}

// ------------------------------------------
// STORE SETTINGS & CMS
// ------------------------------------------

export interface StoreSettings {
  storeName: string;
  brandTagline: string;
  businessAddress: string; // Aba, Abia State, Nigeria
  city: string;
  state: string;
  country: string;
  phone: string;
  whatsappNumber: string; // Normalized with international prefix 234...
  email: string;
  businessHours: string;
  announcementBarText: string;
  isAnnouncementBarActive: boolean;
  announcementBarLink?: string;
  
  // Policies (configurable by owner)
  deliveryPolicy: string;
  returnAndExchangePolicy: string;
  abaPickupInstructions: string;
  isAbaPickupEnabled: boolean;
  
  // Social links
  instagramHandle?: string;
  tiktokHandle?: string;
  facebookUrl?: string;
  
  // SEO
  metaTitle: string;
  metaDescription: string;
  
  // Paystack & Integrations status
  paystackTestMode: boolean;
  isLivePaymentsConfigured: boolean;
}

