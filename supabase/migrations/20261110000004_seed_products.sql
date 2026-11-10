-- ========================================================
-- ARUBEKEE COLLECTION - SEED PRODUCTS, IMAGES & VARIANTS
-- Aba, Abia State, Nigeria Fashion Catalog
-- ========================================================

-- 1. PRODUCT 1: The Chioma Pleated Crepe Midi Dress
INSERT INTO products (
  id, name, slug, tagline, description, category_id, subcategory_id,
  fabric_and_care, styling_tips, is_published, is_featured, tags
) VALUES (
  'p1000000-0000-0000-0000-000000000001',
  'The Chioma Pleated Crepe Midi Dress',
  'chioma-pleated-crepe-midi-dress',
  'Elegantly tailored with sculpted waistline and accordion pleats',
  'Crafted in our Aba atelier using premium heavyweight Spanish crepe that drapes gracefully without clinging. Features a structured jewel neckline, concealed back zip, and removable waist cincher. Ideal for executive meetings, church services, and formal luncheons.',
  'c1000000-0000-0000-0000-000000000001',
  (SELECT id FROM subcategories WHERE slug = 'dresses' LIMIT 1),
  '["95% Polyester Crepe, 5% Elastane", "Concealed Japanese YKK back zipper", "Gentle cold hand wash or dry clean recommended", "Low temperature iron on reverse side"]'::jsonb,
  'Pair with our Adanna Pointed Slingbacks in Oxblood and gold drop earrings for an immaculate boardroom presence.',
  TRUE,
  TRUE,
  ARRAY['dress', 'crepe', 'pleated', 'corporate', 'aba-made', 'bestseller']
) ON CONFLICT (slug) DO NOTHING;

-- Map to collections: new-arrivals, workwear, occasion-wear
INSERT INTO product_collections (product_id, collection_id)
SELECT 'p1000000-0000-0000-0000-000000000001', id FROM collections WHERE slug IN ('new-arrivals', 'workwear', 'occasion-wear')
ON CONFLICT DO NOTHING;

-- Images
INSERT INTO product_images (product_id, url, alt_text, is_primary, sort_order) VALUES
  ('p1000000-0000-0000-0000-000000000001', 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=900&q=80', 'Chioma Pleated Crepe Midi Dress in deep oxblood', TRUE, 0),
  ('p1000000-0000-0000-0000-000000000001', 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=900&q=80', 'Detail of Chioma pleated crepe fabric', FALSE, 1)
ON CONFLICT DO NOTHING;

-- Variants
INSERT INTO product_variants (product_id, sku, color_name, size, price_kobo, stock_quantity, low_stock_threshold) VALUES
  ('p1000000-0000-0000-0000-000000000001', 'ARU-CLO-CHI-OXB-10', 'Deep Oxblood', 'UK 10', 4800000, 5, 2),
  ('p1000000-0000-0000-0000-000000000001', 'ARU-CLO-CHI-OXB-12', 'Deep Oxblood', 'UK 12', 4800000, 8, 2),
  ('p1000000-0000-0000-0000-000000000001', 'ARU-CLO-CHI-OXB-14', 'Deep Oxblood', 'UK 14', 4800000, 4, 2),
  ('p1000000-0000-0000-0000-000000000001', 'ARU-CLO-CHI-OXB-16', 'Deep Oxblood', 'UK 16', 4800000, 2, 2),
  ('p1000000-0000-0000-0000-000000000001', 'ARU-CLO-CHI-BLK-12', 'Obsidian Black', 'UK 12', 4800000, 6, 2),
  ('p1000000-0000-0000-0000-000000000001', 'ARU-CLO-CHI-BLK-14', 'Obsidian Black', 'UK 14', 4800000, 3, 2)
ON CONFLICT (sku) DO NOTHING;


-- 2. PRODUCT 2: The Amaka Relaxed Silk-Touch Two-Piece Set
INSERT INTO products (
  id, name, slug, tagline, description, category_id, subcategory_id,
  fabric_and_care, styling_tips, is_published, is_featured, tags
) VALUES (
  'p1000000-0000-0000-0000-000000000002',
  'The Amaka Relaxed Silk-Touch Two-Piece Set',
  'amaka-silk-touch-two-piece-set',
  'Effortless luxury tailored for high heat and breezy evenings',
  'A decadent pairing featuring a button-front relaxed tunic shirt with wide-leg fluid trousers. Cut from breathable satin-finish twill that feels cool on the skin in the Nigerian climate.',
  'c1000000-0000-0000-0000-000000000001',
  (SELECT id FROM subcategories WHERE slug = 'matching-sets' LIMIT 1),
  '["100% Breathable Viscose Twill with satin sheen", "Mother-of-pearl buttons", "Elasticated back waistband with clean flat front", "Hand wash cold, air dry in shade"]'::jsonb,
  'Style with minimalist leather slides and gold hoops for daytime leisure.',
  TRUE,
  TRUE,
  ARRAY['co-ord', 'two-piece', 'set', 'weekend', 'luxury-casual']
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO product_collections (product_id, collection_id)
SELECT 'p1000000-0000-0000-0000-000000000002', id FROM collections WHERE slug IN ('new-arrivals', 'weekend-looks', 'sale')
ON CONFLICT DO NOTHING;

INSERT INTO product_images (product_id, url, alt_text, is_primary, sort_order) VALUES
  ('p1000000-0000-0000-0000-000000000002', 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=900&q=80', 'Amaka two-piece matching set in olive sage', TRUE, 0)
ON CONFLICT DO NOTHING;

INSERT INTO product_variants (product_id, sku, color_name, size, price_kobo, sale_price_kobo, stock_quantity, low_stock_threshold) VALUES
  ('p1000000-0000-0000-0000-000000000002', 'ARU-CLO-AMA-OLV-08', 'Olive Sage', 'UK 8', 5200000, 4500000, 3, 1),
  ('p1000000-0000-0000-0000-000000000002', 'ARU-CLO-AMA-OLV-10', 'Olive Sage', 'UK 10', 5200000, 4500000, 6, 2),
  ('p1000000-0000-0000-0000-000000000002', 'ARU-CLO-AMA-OLV-12', 'Olive Sage', 'UK 12', 5200000, 4500000, 5, 2),
  ('p1000000-0000-0000-0000-000000000002', 'ARU-CLO-AMA-OLV-14', 'Olive Sage', 'UK 14', 5200000, 4500000, 2, 1)
ON CONFLICT (sku) DO NOTHING;


-- 3. PRODUCT 3: The Adanna Sculpted Block Mule
INSERT INTO products (
  id, name, slug, tagline, description, category_id, subcategory_id,
  fabric_and_care, styling_tips, is_published, is_featured, tags
) VALUES (
  'p1000000-0000-0000-0000-000000000003',
  'The Adanna Sculpted Block Mule',
  'adanna-sculpted-block-mule',
  'Handcrafted leather mule with 65mm architectural flared block heel',
  'Built for true all-day wear without foot fatigue. Hand-lasted in Aba by master leather cobblers with padded memory-foam footbed and genuine cowhide upper.',
  'c1000000-0000-0000-0000-000000000002',
  (SELECT id FROM subcategories WHERE slug = 'heels' LIMIT 1),
  '["100% Genuine Full-Grain Nigerian Leather upper", "Cushioned arch-support insole", "Non-slip ridged rubber outsole", "Heel height: 65mm (2.5 inches)"]'::jsonb,
  'Elevate your everyday office skirts or cropped cigarette trousers.',
  TRUE,
  TRUE,
  ARRAY['shoes', 'mules', 'block-heels', 'aba-leather', 'comfortable']
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO product_collections (product_id, collection_id)
SELECT 'p1000000-0000-0000-0000-000000000003', id FROM collections WHERE slug IN ('workwear', 'occasion-wear')
ON CONFLICT DO NOTHING;

INSERT INTO product_images (product_id, url, alt_text, is_primary, sort_order) VALUES
  ('p1000000-0000-0000-0000-000000000003', 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=900&q=80', 'Adanna leather sculpted block mules in warm tan', TRUE, 0)
ON CONFLICT DO NOTHING;

INSERT INTO product_variants (product_id, sku, color_name, size, price_kobo, stock_quantity, low_stock_threshold) VALUES
  ('p1000000-0000-0000-0000-000000000003', 'ARU-SHO-ADA-TAN-38', 'Warm Tan Leather', 'EU 38', 3600000, 4, 1),
  ('p1000000-0000-0000-0000-000000000003', 'ARU-SHO-ADA-TAN-39', 'Warm Tan Leather', 'EU 39', 3600000, 7, 2),
  ('p1000000-0000-0000-0000-000000000003', 'ARU-SHO-ADA-TAN-40', 'Warm Tan Leather', 'EU 40', 3600000, 5, 2),
  ('p1000000-0000-0000-0000-000000000003', 'ARU-SHO-ADA-TAN-41', 'Warm Tan Leather', 'EU 41', 3600000, 2, 1),
  ('p1000000-0000-0000-0000-000000000003', 'ARU-SHO-ADA-BLK-39', 'Midnight Black', 'EU 39', 3600000, 3, 1),
  ('p1000000-0000-0000-0000-000000000003', 'ARU-SHO-ADA-BLK-40', 'Midnight Black', 'EU 40', 3600000, 4, 1)
ON CONFLICT (sku) DO NOTHING;


-- 4. PRODUCT 4: The Ngozi Structured Artisan Leather Tote
INSERT INTO products (
  id, name, slug, tagline, description, category_id, subcategory_id,
  fabric_and_care, styling_tips, is_published, is_featured, tags
) VALUES (
  'p1000000-0000-0000-0000-000000000004',
  'The Ngozi Structured Artisan Leather Tote',
  'ngozi-structured-artisan-leather-tote',
  'Spacious architectural silhouette with gold hardware and phone pouch',
  'Designed for the modern Nigerian professional who moves seamlessly between boardroom and travel. Fits a 14-inch laptop, planner, cosmetics, and phone charger. Finished with burnished edges and reinforced base studs.',
  'c1000000-0000-0000-0000-000000000003',
  (SELECT id FROM subcategories WHERE slug = 'handbags' LIMIT 1),
  '["Rigid vegetable-tanned genuine leather", "Brushed brass hardware with anti-tarnish coating", "Interior zip pocket and key leash", "Dimensions: 38cm W x 28cm H x 14cm D"]'::jsonb,
  'An indispensable everyday companion from Monday morning through weekend flights.',
  TRUE,
  TRUE,
  ARRAY['bag', 'tote', 'leather', 'corporate', 'laptop-bag']
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO product_collections (product_id, collection_id)
SELECT 'p1000000-0000-0000-0000-000000000004', id FROM collections WHERE slug IN ('workwear', 'new-arrivals')
ON CONFLICT DO NOTHING;

INSERT INTO product_images (product_id, url, alt_text, is_primary, sort_order) VALUES
  ('p1000000-0000-0000-0000-000000000004', 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=900&q=80', 'Ngozi structured leather tote bag with gold hardware', TRUE, 0)
ON CONFLICT DO NOTHING;

INSERT INTO product_variants (product_id, sku, color_name, size, price_kobo, stock_quantity, low_stock_threshold) VALUES
  ('p1000000-0000-0000-0000-000000000004', 'ARU-BAG-NGO-COG-OS', 'Cognac Amber', 'One Size', 4200000, 6, 2),
  ('p1000000-0000-0000-0000-000000000004', 'ARU-BAG-NGO-OXB-OS', 'Imperial Oxblood', 'One Size', 4200000, 4, 1)
ON CONFLICT (sku) DO NOTHING;

