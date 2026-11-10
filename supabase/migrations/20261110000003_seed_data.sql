-- ========================================================
-- ARUBEKEE COLLECTION - SEED DATA
-- Aba, Abia State, Nigeria Fashion Catalog
-- ========================================================

-- 1. SEED DEFAULT STORE SETTINGS
INSERT INTO store_settings (
  store_name,
  brand_tagline,
  business_address,
  city,
  state,
  country,
  phone,
  whatsapp_number,
  email,
  business_hours,
  announcement_bar_text,
  is_announcement_bar_active,
  announcement_bar_link,
  delivery_policy,
  return_and_exchange_policy,
  aba_pickup_instructions,
  is_aba_pickup_enabled,
  instagram_handle,
  meta_title,
  meta_description,
  paystack_test_mode,
  is_live_payments_configured
) VALUES (
  'ARUBEKEE COLLECTION',
  'Refined African Luxury & Contemporary Ready-to-Wear',
  'Ehi Road Fashion District, Aba, Abia State, Nigeria',
  'Aba',
  'Abia State',
  'Nigeria',
  '+234 803 000 1234',
  '2348030001234',
  'care@arubekee.com',
  'Monday – Saturday: 9:00 AM – 6:00 PM WAT',
  'Bespoke & Ready-to-Wear Fashion from Aba • Nationwide Express Dispatch • Free Aba Boutique Pickup',
  TRUE,
  '/shop',
  'Orders dispatched within 24 hours from our Aba atelier. South-East transit takes 1-2 business days. Nationwide interstate transit takes 2-4 business days.',
  'Unworn items with tags intact can be exchanged within 48 hours of receipt. Simple WhatsApp coordination.',
  'Available Monday - Saturday at our Aba boutique showroom. Present your Order Confirmation SMS or Email upon collection.',
  TRUE,
  '@arubekeecollection',
  'ARUBEKEE COLLECTION | Premium Women''s Fashion • Aba, Nigeria',
  'Shop luxury women''s dresses, two-piece sets, block heels, artisanal bags, and accessories handcrafted in Aba, Abia State.',
  TRUE,
  FALSE
) ON CONFLICT DO NOTHING;

-- 2. SEED CATEGORIES
INSERT INTO categories (id, name, slug, description, size_system, sort_order, is_active)
VALUES
  ('c1000000-0000-0000-0000-000000000001', 'Clothing', 'clothing', 'Tailored dresses, jumpsuits, co-ord sets, tops, and trousers crafted with premium crepe, silk, and structured cotton.', 'clothing_uk', 1, TRUE),
  ('c1000000-0000-0000-0000-000000000002', 'Shoes', 'shoes', 'Comfortable block heels, artisanal leather sandals, chic slippers, and statement pumps handcrafted by Aba cobblers.', 'shoes_eu', 2, TRUE),
  ('c1000000-0000-0000-0000-000000000003', 'Bags', 'bags', 'Structured leather totes, elegant evening clutches, shoulder bag silhouettes, and everyday crossbodies.', 'dimension_or_none', 3, TRUE),
  ('c1000000-0000-0000-0000-000000000004', 'Accessories', 'accessories', 'Statement gold-tone jewellery, UV400 sunglasses, leather cinching belts, and silk scarves.', 'standard_alpha', 4, TRUE)
ON CONFLICT (slug) DO NOTHING;

-- 3. SEED SUBCATEGORIES
INSERT INTO subcategories (category_id, name, slug, sort_order) VALUES
  -- Clothing
  ('c1000000-0000-0000-0000-000000000001', 'Dresses', 'dresses', 1),
  ('c1000000-0000-0000-0000-000000000001', 'Tops & Shirts', 'tops-and-shirts', 2),
  ('c1000000-0000-0000-0000-000000000001', 'Trousers & Jeans', 'trousers-and-jeans', 3),
  ('c1000000-0000-0000-0000-000000000001', 'Skirts', 'skirts', 4),
  ('c1000000-0000-0000-0000-000000000001', 'Matching Sets', 'matching-sets', 5),
  ('c1000000-0000-0000-0000-000000000001', 'Jumpsuits', 'jumpsuits', 6),
  -- Shoes
  ('c1000000-0000-0000-0000-000000000002', 'Heels', 'heels', 1),
  ('c1000000-0000-0000-0000-000000000002', 'Sandals', 'sandals', 2),
  ('c1000000-0000-0000-0000-000000000002', 'Slippers', 'slippers', 3),
  ('c1000000-0000-0000-0000-000000000002', 'Flats', 'flats', 4),
  ('c1000000-0000-0000-0000-000000000002', 'Sneakers', 'sneakers', 5),
  -- Bags
  ('c1000000-0000-0000-0000-000000000003', 'Handbags', 'handbags', 1),
  ('c1000000-0000-0000-0000-000000000003', 'Shoulder Bags', 'shoulder-bags', 2),
  ('c1000000-0000-0000-0000-000000000003', 'Crossbody Bags', 'crossbody-bags', 3),
  ('c1000000-0000-0000-0000-000000000003', 'Clutches', 'clutches', 4),
  -- Accessories
  ('c1000000-0000-0000-0000-000000000004', 'Jewellery', 'jewellery', 1),
  ('c1000000-0000-0000-0000-000000000004', 'Sunglasses', 'sunglasses', 2),
  ('c1000000-0000-0000-0000-000000000004', 'Belts', 'belts', 3),
  ('c1000000-0000-0000-0000-000000000004', 'Scarves', 'scarves', 4),
  ('c1000000-0000-0000-0000-000000000004', 'Hair Accessories', 'hair-accessories', 5)
ON CONFLICT (slug) DO NOTHING;

-- 4. SEED COLLECTIONS
INSERT INTO collections (id, name, slug, tagline, description, is_featured, sort_order)
VALUES
  ('d1000000-0000-0000-0000-000000000001', 'New Arrivals', 'new-arrivals', 'Fresh Off The Cutting Table', 'Our newest ready-to-wear drops, crafted this week in Aba with refined precision.', TRUE, 1),
  ('d1000000-0000-0000-0000-000000000002', 'Workwear & Corporate', 'workwear', 'Poised & Professional', 'Sharp tailoring, structured blazers, pleated midis, and boardroom-ready sets.', TRUE, 2),
  ('d1000000-0000-0000-0000-000000000003', 'Weekend Looks', 'weekend-looks', 'Effortless & Relaxed', 'Breezy linen dresses, chic slides, and casual co-ords for weekend brunch and getaways.', TRUE, 3),
  ('d1000000-0000-0000-0000-000000000004', 'Occasion Wear', 'occasion-wear', 'Sunday Best & Evening Glamour', 'Dramatic silhouettes, rich embellishments, and statement accessories for weddings and milestones.', TRUE, 4),
  ('d1000000-0000-0000-0000-000000000005', 'Special Sale', 'sale', 'Limited Archive Pieces', 'Genuine price reductions on select seasonal designs. While stocks last.', TRUE, 5)
ON CONFLICT (slug) DO NOTHING;

-- 5. SEED DELIVERY ZONES
INSERT INTO delivery_zones (name, description, estimated_days, states_included, fee_kobo, free_shipping_above_kobo, priority_order, is_active)
VALUES
  ('Aba Store Boutique Pickup', 'Collect directly at our Aba showroom on Ehi Road. Ready in 2 hours.', 'Same day (Ready in 2 hours)', ARRAY['Abia'], 0, NULL, 1, TRUE),
  ('Aba Metropolis Doorstep Express', 'Direct dispatch rider anywhere within Aba city limits.', 'Same day / 24 hours', ARRAY['Abia'], 250000, 5000000, 2, TRUE),
  ('South-East Regional Transit', 'Enugu, Owerri, Umuahia, Onitsha, Awka, Abakaliki via secure transport park courier.', '1 - 2 business days', ARRAY['Abia', 'Imo', 'Enugu', 'Anambra', 'Ebonyi'], 400000, 7500000, 3, TRUE),
  ('Lagos, Port Harcourt & Abuja Corridor', 'Air cargo and express overland door-to-door courier dispatch.', '2 - 3 business days', ARRAY['Lagos', 'Rivers', 'Federal Capital Territory'], 550000, 10000000, 4, TRUE),
  ('Nationwide Standard Delivery', 'All other Nigerian states and territories via GIG Logistics / Peace Mass Transit Cargo.', '3 - 5 business days', ARRAY['Delta', 'Edo', 'Akwa Ibom', 'Cross River', 'Ogun', 'Oyo', 'Osun', 'Ondo', 'Ekiti', 'Kwara', 'Kogi', 'Benue', 'Plateau', 'Kaduna', 'Kano'], 650000, NULL, 5, TRUE)
ON CONFLICT DO NOTHING;

