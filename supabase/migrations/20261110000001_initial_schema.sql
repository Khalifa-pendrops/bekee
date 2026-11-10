-- ========================================================
-- ARUBEKEE COLLECTION - POSTGRESQL SCHEMA (SUPABASE)
-- Market: Nigeria (NGN integer Kobo)
-- Timezone: Africa/Lagos
-- Location: Aba, Abia State, Nigeria
-- ========================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES & ROLES
CREATE TYPE staff_role_enum AS ENUM ('owner', 'manager', 'sales_staff');

CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  phone TEXT,
  role staff_role_enum DEFAULT 'sales_staff',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. CATEGORIES & SUBCATEGORIES
CREATE TYPE size_system_enum AS ENUM ('clothing_uk', 'shoes_eu', 'standard_alpha', 'dimension_or_none');

CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  size_system size_system_enum DEFAULT 'clothing_uk',
  image_url TEXT,
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS subcategories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. CURATED COLLECTIONS
CREATE TABLE IF NOT EXISTS collections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  tagline TEXT,
  description TEXT,
  banner_image_url TEXT,
  is_featured BOOLEAN DEFAULT FALSE,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. PRODUCTS
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  tagline TEXT,
  description TEXT NOT NULL,
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
  subcategory_id UUID REFERENCES subcategories(id) ON DELETE SET NULL,
  fabric_and_care JSONB DEFAULT '[]'::jsonb,
  styling_tips TEXT,
  is_published BOOLEAN DEFAULT FALSE,
  is_archived BOOLEAN DEFAULT FALSE,
  is_featured BOOLEAN DEFAULT FALSE,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- PRODUCT TO COLLECTION LINK
CREATE TABLE IF NOT EXISTS product_collections (
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  collection_id UUID NOT NULL REFERENCES collections(id) ON DELETE CASCADE,
  PRIMARY KEY (product_id, collection_id)
);

-- 5. PRODUCT IMAGES
CREATE TABLE IF NOT EXISTS product_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  alt_text TEXT,
  is_primary BOOLEAN DEFAULT FALSE,
  sort_order INT DEFAULT 0,
  color_association TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. PRODUCT VARIANTS (SELLABLE ATOMIC UNITS)
CREATE TABLE IF NOT EXISTS product_variants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  sku TEXT UNIQUE NOT NULL,
  color_name TEXT NOT NULL,
  color_hex TEXT,
  size TEXT NOT NULL, -- e.g. "UK 10", "EU 39", "One Size"
  price_kobo BIGINT NOT NULL CHECK (price_kobo >= 0),
  sale_price_kobo BIGINT CHECK (sale_price_kobo IS NULL OR (sale_price_kobo >= 0 AND sale_price_kobo < price_kobo)),
  stock_quantity INT NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
  low_stock_threshold INT NOT NULL DEFAULT 2 CHECK (low_stock_threshold >= 0),
  barcode TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for lightning fast catalogue queries
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_published ON products(is_published) WHERE is_published = TRUE AND is_archived = FALSE;
CREATE INDEX IF NOT EXISTS idx_variants_product ON product_variants(product_id);
CREATE INDEX IF NOT EXISTS idx_variants_sku ON product_variants(sku);
CREATE INDEX IF NOT EXISTS idx_variants_stock ON product_variants(stock_quantity);

-- 7. DELIVERY ZONES & RATE RULES
CREATE TABLE IF NOT EXISTS delivery_zones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  estimated_days TEXT NOT NULL,
  states_included TEXT[] NOT NULL DEFAULT '{}',
  fee_kobo BIGINT NOT NULL DEFAULT 0 CHECK (fee_kobo >= 0),
  free_shipping_above_kobo BIGINT CHECK (free_shipping_above_kobo IS NULL OR free_shipping_above_kobo >= 0),
  priority_order INT NOT NULL DEFAULT 10,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. ORDERS & FULFILLMENT
CREATE TYPE payment_status_enum AS ENUM (
  'pending', 
  'paid', 
  'failed', 
  'expired', 
  'refund_pending', 
  'refunded', 
  'partially_refunded',
  'inventory_conflict_quarantined'
);

CREATE TYPE fulfillment_status_enum AS ENUM (
  'unfulfilled', 
  'ready_for_pickup', 
  'dispatched', 
  'delivered', 
  'cancelled', 
  'returned'
);

CREATE TYPE order_source_enum AS ENUM ('storefront', 'offline_aba_store', 'whatsapp_order');
CREATE TYPE payment_method_enum AS ENUM ('paystack', 'bank_transfer_offline', 'cash_in_store', 'pos_terminal');
CREATE TYPE delivery_type_enum AS ENUM ('aba_pickup', 'dispatch_delivery', 'quote_required');

CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number TEXT UNIQUE NOT NULL,
  order_source order_source_enum NOT NULL DEFAULT 'storefront',
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  delivery_type delivery_type_enum NOT NULL DEFAULT 'dispatch_delivery',
  
  -- Address snapshot in JSONB
  shipping_address JSONB,
  
  -- Financial totals in integer Kobo
  subtotal_kobo BIGINT NOT NULL CHECK (subtotal_kobo >= 0),
  delivery_fee_kobo BIGINT NOT NULL DEFAULT 0 CHECK (delivery_fee_kobo >= 0),
  discount_kobo BIGINT NOT NULL DEFAULT 0 CHECK (discount_kobo >= 0),
  discount_code TEXT,
  total_kobo BIGINT NOT NULL CHECK (total_kobo >= 0),
  
  -- Payment Tracking
  payment_status payment_status_enum NOT NULL DEFAULT 'pending',
  payment_method payment_method_enum NOT NULL DEFAULT 'paystack',
  payment_reference TEXT UNIQUE,
  paystack_transaction_id TEXT,
  paid_at TIMESTAMPTZ,
  
  -- Fulfillment Tracking
  fulfillment_status fulfillment_status_enum NOT NULL DEFAULT 'unfulfilled',
  carrier_name TEXT,
  tracking_number TEXT,
  tracking_url TEXT,
  dispatched_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  
  -- Operational & Staff notes
  internal_notes TEXT,
  recorded_by_staff_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for order dashboard
CREATE INDEX IF NOT EXISTS idx_orders_customer_phone ON orders(customer_phone);
CREATE INDEX IF NOT EXISTS idx_orders_customer_email ON orders(customer_email);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_orders_fulfillment_status ON orders(fulfillment_status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);

-- 9. IMMUTABLE ORDER LINE ITEMS (SNAPSHOTS)
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  variant_id UUID REFERENCES product_variants(id) ON DELETE SET NULL,
  sku TEXT NOT NULL,
  product_name TEXT NOT NULL,
  color_name TEXT NOT NULL,
  size TEXT NOT NULL,
  unit_price_kobo BIGINT NOT NULL CHECK (unit_price_kobo >= 0),
  quantity INT NOT NULL CHECK (quantity > 0),
  total_kobo BIGINT NOT NULL CHECK (total_kobo >= 0),
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);

-- 10. ORDER TIMELINE & AUDIT TRAIL
CREATE TABLE IF NOT EXISTS order_timeline (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  actor TEXT NOT NULL DEFAULT 'System',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_order_timeline_order ON order_timeline(order_id);

-- 11. SHORT-LIVED INVENTORY RESERVATIONS (PAYMENT INITIATION)
CREATE TABLE IF NOT EXISTS stock_reservations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  variant_id UUID NOT NULL REFERENCES product_variants(id) ON DELETE CASCADE,
  quantity INT NOT NULL CHECK (quantity > 0),
  expires_at TIMESTAMPTZ NOT NULL,
  is_released BOOLEAN DEFAULT FALSE,
  is_committed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reservations_variant ON stock_reservations(variant_id) 
  WHERE is_released = FALSE AND is_committed = FALSE;
CREATE INDEX IF NOT EXISTS idx_reservations_expiry ON stock_reservations(expires_at) 
  WHERE is_released = FALSE AND is_committed = FALSE;

-- 12. INVENTORY MOVEMENTS LEDGER
CREATE TYPE inventory_reason_enum AS ENUM (
  'online_sale',
  'offline_sale_aba',
  'whatsapp_order',
  'restock',
  'damaged_writeoff',
  'customer_return_restock',
  'inventory_audit'
);

CREATE TABLE IF NOT EXISTS inventory_movements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  variant_id UUID NOT NULL REFERENCES product_variants(id) ON DELETE CASCADE,
  change_quantity INT NOT NULL,
  resulting_quantity INT NOT NULL,
  reason inventory_reason_enum NOT NULL,
  reference_id TEXT, -- orderId or note
  recorded_by TEXT NOT NULL DEFAULT 'System',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_inventory_movements_variant ON inventory_movements(variant_id);

-- 13. DELIVERY QUOTE REQUESTS (FOR UNMAPPED DESTINATIONS)
CREATE TABLE IF NOT EXISTS delivery_quote_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  state TEXT NOT NULL,
  city TEXT NOT NULL,
  street_address TEXT NOT NULL,
  landmark TEXT,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  subtotal_kobo BIGINT NOT NULL CHECK (subtotal_kobo >= 0),
  quoted_delivery_fee_kobo BIGINT,
  status TEXT NOT NULL DEFAULT 'pending_quote' CHECK (status IN ('pending_quote', 'quoted', 'accepted_and_paid', 'declined')),
  owner_notes TEXT,
  checkout_link_sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 14. DISCOUNT CODES
CREATE TABLE IF NOT EXISTS discount_codes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT UNIQUE NOT NULL,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed_kobo')),
  value INT NOT NULL CHECK (value > 0),
  minimum_order_kobo BIGINT DEFAULT 0,
  max_uses INT,
  current_uses INT DEFAULT 0,
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 15. STORE SETTINGS & CMS CONTENT
CREATE TABLE IF NOT EXISTS store_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_name TEXT NOT NULL DEFAULT 'ARUBEKEE COLLECTION',
  brand_tagline TEXT DEFAULT 'Refined African Luxury & Contemporary Ready-to-Wear',
  business_address TEXT NOT NULL DEFAULT 'Ehi Road Fashion District, Aba, Abia State, Nigeria',
  city TEXT NOT NULL DEFAULT 'Aba',
  state TEXT NOT NULL DEFAULT 'Abia State',
  country TEXT NOT NULL DEFAULT 'Nigeria',
  phone TEXT NOT NULL DEFAULT '+234 803 000 1234',
  whatsapp_number TEXT NOT NULL DEFAULT '2348030001234',
  email TEXT NOT NULL DEFAULT 'care@arubekee.com',
  business_hours TEXT NOT NULL DEFAULT 'Monday – Saturday: 9:00 AM – 6:00 PM WAT',
  announcement_bar_text TEXT DEFAULT 'Bespoke & Ready-to-Wear Fashion from Aba • Nationwide Express Dispatch • Free Aba Boutique Pickup',
  is_announcement_bar_active BOOLEAN DEFAULT TRUE,
  announcement_bar_link TEXT DEFAULT '/shop',
  delivery_policy TEXT NOT NULL DEFAULT 'Orders dispatched within 24 hours from Aba. South-East transit takes 1-2 business days. Nationwide interstate transit takes 2-4 business days.',
  return_and_exchange_policy TEXT NOT NULL DEFAULT 'Unworn items with tags intact can be exchanged within 48 hours of receipt. Simple WhatsApp coordination.',
  aba_pickup_instructions TEXT NOT NULL DEFAULT 'Available Monday - Saturday at our Aba boutique showroom. Present your Order Confirmation SMS or Email upon collection.',
  is_aba_pickup_enabled BOOLEAN DEFAULT TRUE,
  instagram_handle TEXT DEFAULT '@arubekeecollection',
  meta_title TEXT DEFAULT 'ARUBEKEE COLLECTION | Premium Women''s Fashion • Aba, Nigeria',
  meta_description TEXT DEFAULT 'Shop luxury women''s dresses, two-piece sets, block heels, artisanal bags, and accessories handcrafted in Aba, Abia State.',
  paystack_test_mode BOOLEAN DEFAULT TRUE,
  is_live_payments_configured BOOLEAN DEFAULT FALSE,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 16. WEBHOOK EVENTS & DURABLE NOTIFICATION OUTBOX
CREATE TABLE IF NOT EXISTS webhook_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  provider TEXT NOT NULL DEFAULT 'paystack',
  event_type TEXT NOT NULL,
  reference TEXT,
  payload JSONB NOT NULL,
  status TEXT NOT NULL DEFAULT 'received' CHECK (status IN ('received', 'processed', 'ignored', 'failed')),
  error_message TEXT,
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_webhook_events_reference ON webhook_events(reference);

CREATE TABLE IF NOT EXISTS notification_outbox (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  channel TEXT NOT NULL CHECK (channel IN ('email', 'sms', 'whatsapp_webhook')),
  recipient TEXT NOT NULL,
  template TEXT NOT NULL,
  payload JSONB NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'sent', 'failed')),
  retry_count INT DEFAULT 0,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  processed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_notification_outbox_status ON notification_outbox(status) WHERE status = 'pending';

-- 17. AUDIT LOGS
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  actor_id UUID,
  actor_name TEXT NOT NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);

-- ========================================================
-- ROW-LEVEL SECURITY (RLS) POLICIES
-- ========================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE subcategories ENABLE ROW LEVEL SECURITY;
ALTER TABLE collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE delivery_zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_timeline ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_settings ENABLE ROW LEVEL SECURITY;

-- Public can view active categories, subcategories, collections, published products, and delivery zones
CREATE POLICY "Public can view active categories" ON categories FOR SELECT USING (is_active = TRUE);
CREATE POLICY "Public can view active subcategories" ON subcategories FOR SELECT USING (is_active = TRUE);
CREATE POLICY "Public can view collections" ON collections FOR SELECT USING (TRUE);
CREATE POLICY "Public can view published products" ON products FOR SELECT USING (is_published = TRUE AND is_archived = FALSE);
CREATE POLICY "Public can view product images" ON product_images FOR SELECT USING (TRUE);
CREATE POLICY "Public can view active product variants" ON product_variants FOR SELECT USING (is_active = TRUE);
CREATE POLICY "Public can view active delivery zones" ON delivery_zones FOR SELECT USING (is_active = TRUE);
CREATE POLICY "Public can view store settings" ON store_settings FOR SELECT USING (TRUE);

-- Authenticated staff have full access based on profile role
CREATE POLICY "Staff have full access to products" ON products FOR ALL TO authenticated 
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_active = TRUE));

CREATE POLICY "Staff have full access to variants" ON product_variants FOR ALL TO authenticated 
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_active = TRUE));

CREATE POLICY "Staff have full access to orders" ON orders FOR ALL TO authenticated 
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_active = TRUE));

CREATE POLICY "Staff have full access to settings" ON store_settings FOR ALL TO authenticated 
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_active = TRUE));

