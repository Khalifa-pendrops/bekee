const { createClient } = require("@supabase/supabase-js");
const fs = require("fs");
const path = require("path");

const envContent = fs.readFileSync(".env.local", "utf8");
const env = {};
envContent.split("\n").forEach(line => {
  const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
  if (match) {
    let value = match[2] || "";
    if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
    if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1);
    env[match[1]] = value.trim();
  }
});

const url = env.NEXT_PUBLIC_SUPABASE_URL;
const key = env.SUPABASE_SERVICE_ROLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(url, key);

// Read existing customProducts.json
const customProducts = JSON.parse(fs.readFileSync("src/data/customProducts.json", "utf8"));

// Additional foundational & footwear products to ensure complete boutique catalog
const additionalProducts = [
  {
    name: "The Adanna Sculpted Block Mule",
    slug: "adanna-sculpted-block-mule",
    tagline: "Handcrafted Aba leather mule with 65mm architectural flared block heel",
    description: "Built for true all-day wear without foot fatigue. Hand-lasted in Aba by master leather cobblers with padded memory-foam footbed and genuine cowhide upper.",
    categorySlug: "shoes",
    subCategorySlug: "heels",
    collectionSlugs: ["workwear", "occasion-wear", "new-arrivals"],
    fabricAndCare: [
      "100% Genuine Full-Grain Nigerian Cowhide Leather",
      "Cushioned arch-support memory foam insole",
      "Non-slip ridged rubber outsole",
      "Heel height: 65mm (2.5 inches)",
    ],
    isPublished: true,
    isArchived: false,
    isFeatured: true,
    tags: ["shoes", "heels", "mules", "block-heels", "aba-leather", "comfortable"],
    images: [
      {
        url: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=900&q=80",
        altText: "Pair of Adanna leather sculpted block mules in warm tan",
        isPrimary: true,
        sortOrder: 0,
      },
    ],
    variants: [
      { sku: "ARU-SHO-ADA-TAN-37", colorName: "Warm Tan Leather", colorHex: "#B45309", size: "EU 37", priceKobo: 3600000, stockQuantity: 4, lowStockThreshold: 1, isActive: true },
      { sku: "ARU-SHO-ADA-TAN-38", colorName: "Warm Tan Leather", colorHex: "#B45309", size: "EU 38", priceKobo: 3600000, stockQuantity: 6, lowStockThreshold: 1, isActive: true },
      { sku: "ARU-SHO-ADA-TAN-39", colorName: "Warm Tan Leather", colorHex: "#B45309", size: "EU 39", priceKobo: 3600000, stockQuantity: 8, lowStockThreshold: 2, isActive: true },
      { sku: "ARU-SHO-ADA-TAN-40", colorName: "Warm Tan Leather", colorHex: "#B45309", size: "EU 40", priceKobo: 3600000, stockQuantity: 5, lowStockThreshold: 2, isActive: true },
      { sku: "ARU-SHO-ADA-TAN-41", colorName: "Warm Tan Leather", colorHex: "#B45309", size: "EU 41", priceKobo: 3600000, stockQuantity: 3, lowStockThreshold: 1, isActive: true },
      { sku: "ARU-SHO-ADA-BLK-38", colorName: "Midnight Black", colorHex: "#181514", size: "EU 38", priceKobo: 3600000, stockQuantity: 4, lowStockThreshold: 1, isActive: true },
      { sku: "ARU-SHO-ADA-BLK-39", colorName: "Midnight Black", colorHex: "#181514", size: "EU 39", priceKobo: 3600000, stockQuantity: 5, lowStockThreshold: 1, isActive: true },
      { sku: "ARU-SHO-ADA-BLK-40", colorName: "Midnight Black", colorHex: "#181514", size: "EU 40", priceKobo: 3600000, stockQuantity: 4, lowStockThreshold: 1, isActive: true },
    ],
  },
  {
    name: "The Chioma Strappy Metallic Stiletto Sandal",
    slug: "chioma-strappy-metallic-stiletto-sandal",
    tagline: "Statement 85mm Evening Heel with Slender Ankle-Wrap Straps",
    description: "Designed for grand Nigerian celebrations, gala dinners, and cocktail receptions. Hand-crafted in Aba using metallic mirror calfskin, a balanced 85mm stiletto, and cushioned forefoot pads.",
    categorySlug: "shoes",
    subCategorySlug: "heels",
    collectionSlugs: ["occasion-wear", "new-arrivals"],
    fabricAndCare: [
      "Metallic mirror leather upper",
      "Leather lining & padded ball-of-foot support",
      "Slim ankle strap with gold buckle closure",
      "Heel height: 85mm (3.3 inches)",
    ],
    isPublished: true,
    isArchived: false,
    isFeatured: true,
    tags: ["shoes", "heels", "sandals", "stiletto", "evening-wear", "metallic"],
    images: [
      {
        url: "https://images.unsplash.com/photo-1535043934128-cf0b28d52f95?auto=format&fit=crop&w=900&q=80",
        altText: "The Chioma Strappy Metallic Stiletto Sandal in Champagne Gold",
        isPrimary: true,
        sortOrder: 0,
      },
    ],
    variants: [
      { sku: "ARU-SHO-CHIO-GLD-37", colorName: "Champagne Gold", colorHex: "#D4AF37", size: "EU 37", priceKobo: 4200000, stockQuantity: 3, lowStockThreshold: 1, isActive: true },
      { sku: "ARU-SHO-CHIO-GLD-38", colorName: "Champagne Gold", colorHex: "#D4AF37", size: "EU 38", priceKobo: 4200000, stockQuantity: 5, lowStockThreshold: 1, isActive: true },
      { sku: "ARU-SHO-CHIO-GLD-39", colorName: "Champagne Gold", colorHex: "#D4AF37", size: "EU 39", priceKobo: 4200000, stockQuantity: 6, lowStockThreshold: 2, isActive: true },
      { sku: "ARU-SHO-CHIO-GLD-40", colorName: "Champagne Gold", colorHex: "#D4AF37", size: "EU 40", priceKobo: 4200000, stockQuantity: 4, lowStockThreshold: 1, isActive: true },
      { sku: "ARU-SHO-CHIO-ROSE-38", colorName: "Metallic Rose Bronze", colorHex: "#B76E79", size: "EU 38", priceKobo: 4200000, stockQuantity: 3, lowStockThreshold: 1, isActive: true },
      { sku: "ARU-SHO-CHIO-ROSE-39", colorName: "Metallic Rose Bronze", colorHex: "#B76E79", size: "EU 39", priceKobo: 4200000, stockQuantity: 4, lowStockThreshold: 1, isActive: true },
    ],
  },
  {
    name: "The Ezinne Woven Leather Slide Slippers",
    slug: "ezinne-woven-leather-slide-slippers",
    tagline: "Effortless Artisanal Slip-On in Hand-Braided Nigerian Calfskin",
    description: "The quintessential Aba resort slip-on. Expertly interlinked leather straps provide breathable luxury for warm climates, styled effortlessly with our silk kaftans and wide-leg sets.",
    categorySlug: "shoes",
    subCategorySlug: "slippers",
    collectionSlugs: ["weekend-looks", "new-arrivals"],
    fabricAndCare: [
      "100% Hand-woven calf leather straps",
      "Moulded leather arch footbed",
      "Flexible anti-slip sole",
    ],
    isPublished: true,
    isArchived: false,
    isFeatured: true,
    tags: ["shoes", "slippers", "slides", "woven-leather", "casual-luxury", "aba-made"],
    images: [
      {
        url: "https://images.unsplash.com/photo-1562273138-f46be4ebdf33?auto=format&fit=crop&w=900&q=80",
        altText: "The Ezinne Woven Leather Slide Slippers in Camel Tan",
        isPrimary: true,
        sortOrder: 0,
      },
    ],
    variants: [
      { sku: "ARU-SHO-EZI-CAM-37", colorName: "Camel Tan", colorHex: "#C19A6B", size: "EU 37", priceKobo: 2800000, stockQuantity: 5, lowStockThreshold: 1, isActive: true },
      { sku: "ARU-SHO-EZI-CAM-38", colorName: "Camel Tan", colorHex: "#C19A6B", size: "EU 38", priceKobo: 2800000, stockQuantity: 7, lowStockThreshold: 2, isActive: true },
      { sku: "ARU-SHO-EZI-CAM-39", colorName: "Camel Tan", colorHex: "#C19A6B", size: "EU 39", priceKobo: 2800000, stockQuantity: 8, lowStockThreshold: 2, isActive: true },
      { sku: "ARU-SHO-EZI-CAM-40", colorName: "Camel Tan", colorHex: "#C19A6B", size: "EU 40", priceKobo: 2800000, stockQuantity: 6, lowStockThreshold: 1, isActive: true },
      { sku: "ARU-SHO-EZI-CAM-41", colorName: "Camel Tan", colorHex: "#C19A6B", size: "EU 41", priceKobo: 2800000, stockQuantity: 3, lowStockThreshold: 1, isActive: true },
      { sku: "ARU-SHO-EZI-BLK-39", colorName: "Obsidian Black", colorHex: "#181514", size: "EU 39", priceKobo: 2800000, stockQuantity: 5, lowStockThreshold: 1, isActive: true },
      { sku: "ARU-SHO-EZI-BLK-40", colorName: "Obsidian Black", colorHex: "#181514", size: "EU 40", priceKobo: 2800000, stockQuantity: 4, lowStockThreshold: 1, isActive: true },
    ],
  },
  {
    name: "The Somto Braided Cross-Strap Leather Sandal",
    slug: "somto-braided-cross-strap-leather-sandal",
    tagline: "35mm Low Block Heel Sandal with Cushioned Memory Insole",
    description: "Striking the ideal harmony between elevated height and everyday ease. Hand-crafted in Aba with interlocking cross straps, brass buckle, and a stable 35mm covered block heel.",
    categorySlug: "shoes",
    subCategorySlug: "sandals",
    collectionSlugs: ["weekend-looks", "workwear"],
    fabricAndCare: [
      "Smooth full-grain leather straps",
      "Padded arch support with dual-density foam",
      "Heel height: 35mm (1.4 inches)",
    ],
    isPublished: true,
    isArchived: false,
    isFeatured: true,
    tags: ["shoes", "sandals", "block-heel", "leather", "casual-chic"],
    images: [
      {
        url: "https://images.unsplash.com/photo-1603808033192-082d6919d3e1?auto=format&fit=crop&w=900&q=80",
        altText: "The Somto Braided Cross-Strap Leather Sandal",
        isPrimary: true,
        sortOrder: 0,
      },
    ],
    variants: [
      { sku: "ARU-SHO-SOM-COG-38", colorName: "Rich Cognac", colorHex: "#9A3324", size: "EU 38", priceKobo: 3200000, stockQuantity: 5, lowStockThreshold: 1, isActive: true },
      { sku: "ARU-SHO-SOM-COG-39", colorName: "Rich Cognac", colorHex: "#9A3324", size: "EU 39", priceKobo: 3200000, stockQuantity: 6, lowStockThreshold: 1, isActive: true },
      { sku: "ARU-SHO-SOM-COG-40", colorName: "Rich Cognac", colorHex: "#9A3324", size: "EU 40", priceKobo: 3200000, stockQuantity: 4, lowStockThreshold: 1, isActive: true },
      { sku: "ARU-SHO-SOM-IVR-39", colorName: "Ivory Cream", colorHex: "#FFFDD0", size: "EU 39", priceKobo: 3200000, stockQuantity: 4, lowStockThreshold: 1, isActive: true },
    ],
  },
  {
    name: "The Amara Pointed-Toe Leather Mule Flat",
    slug: "amara-pointed-toe-leather-mule-flat",
    tagline: "Architectural V-Cut Vamp Flat Slip-On with Micro Heel",
    description: "Sharp, executive, and remarkably comfortable. The Amara mule flat elongates the leg line with a geometric pointed toe and supple glove leather lining.",
    categorySlug: "shoes",
    subCategorySlug: "flats",
    collectionSlugs: ["workwear", "weekend-looks"],
    fabricAndCare: [
      "100% Genuine polished glove leather",
      "Micro heel: 15mm (0.6 inch)",
      "Rubber sole injection for grip",
    ],
    isPublished: true,
    isArchived: false,
    isFeatured: true,
    tags: ["shoes", "flats", "mules", "pointed-toe", "workwear", "aba-leather"],
    images: [
      {
        url: "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&w=900&q=80",
        altText: "The Amara Pointed-Toe Leather Mule Flat",
        isPrimary: true,
        sortOrder: 0,
      },
    ],
    variants: [
      { sku: "ARU-SHO-AMR-OXB-38", colorName: "Burgundy Oxblood", colorHex: "#6B1724", size: "EU 38", priceKobo: 3100000, stockQuantity: 4, lowStockThreshold: 1, isActive: true },
      { sku: "ARU-SHO-AMR-OXB-39", colorName: "Burgundy Oxblood", colorHex: "#6B1724", size: "EU 39", priceKobo: 3100000, stockQuantity: 7, lowStockThreshold: 2, isActive: true },
      { sku: "ARU-SHO-AMR-OXB-40", colorName: "Burgundy Oxblood", colorHex: "#6B1724", size: "EU 40", priceKobo: 3100000, stockQuantity: 5, lowStockThreshold: 1, isActive: true },
      { sku: "ARU-SHO-AMR-GRN-39", colorName: "Emerald Green", colorHex: "#064E3B", size: "EU 39", priceKobo: 3100000, stockQuantity: 4, lowStockThreshold: 1, isActive: true },
    ],
  },
  {
    name: "The Ngozi Structured Artisan Leather Tote",
    slug: "ngozi-structured-artisan-leather-tote",
    tagline: "Spacious Architectural Boardroom & Travel Silhouette with Gold Hardware",
    description: "Designed for the modern Nigerian executive who moves seamlessly between boardroom and travel. Fits a 14-inch laptop, planner, cosmetics, and phone charger. Finished with burnished edges and reinforced base studs.",
    categorySlug: "bags",
    subCategorySlug: "handbags",
    collectionSlugs: ["workwear", "new-arrivals"],
    fabricAndCare: [
      "100% Genuine Nigerian Cowhide Leather",
      "Solid brass hardware in brushed champagne gold",
      "Dimensions: 38cm (W) x 29cm (H) x 14cm (D)",
    ],
    isPublished: true,
    isArchived: false,
    isFeatured: true,
    tags: ["bags", "handbags", "tote", "leather", "workwear", "boardroom"],
    images: [
      {
        url: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=900&q=80",
        altText: "The Ngozi Structured Artisan Leather Tote in Caramel Tan",
        isPrimary: true,
        sortOrder: 0,
      },
    ],
    variants: [
      { sku: "ARU-BAG-NGO-TAN-OS", colorName: "Caramel Tan", colorHex: "#B45309", size: "One Size", priceKobo: 4800000, stockQuantity: 4, lowStockThreshold: 1, isActive: true },
      { sku: "ARU-BAG-NGO-BLK-OS", colorName: "Midnight Black", colorHex: "#181514", size: "One Size", priceKobo: 4800000, stockQuantity: 5, lowStockThreshold: 1, isActive: true },
    ],
  },
  {
    name: "The Adaeze 18k Gold Chunky Collar Necklace",
    slug: "adaeze-18k-gold-chunky-collar-necklace",
    tagline: "Architectural Nigerian Handcrafted Statement Collar in Polished Brass & 18k Plating",
    description: "Command the room with this high-polish sculptured statement collar. Inspired by traditional Igbo royal ceremonial torque adornments, modernized with an ergonomic hinged rear clasp.",
    categorySlug: "accessories",
    subCategorySlug: "jewellery",
    collectionSlugs: ["occasion-wear", "new-arrivals"],
    fabricAndCare: [
      "Recycled solid brass with heavy 18k gold vermeil dip",
      "Hypoallergenic & tarnish-resistant protective coating",
      "Clean with soft microfibre cloth; store in protective pouch",
    ],
    isPublished: true,
    isArchived: false,
    isFeatured: true,
    tags: ["accessories", "jewellery", "necklace", "gold", "statement-piece"],
    images: [
      {
        url: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=900&q=80",
        altText: "The Adaeze 18k Gold Chunky Collar Necklace",
        isPrimary: true,
        sortOrder: 0,
      },
    ],
    variants: [
      { sku: "ARU-ACC-ADA-GLD-OS", colorName: "18k Polished Gold", colorHex: "#D4AF37", size: "One Size", priceKobo: 2200000, stockQuantity: 8, lowStockThreshold: 2, isActive: true },
    ],
  },
];

async function seed() {
  console.log("1. Fetching Categories and Subcategories from Supabase...");
  const { data: cats, error: cErr } = await supabase.from('categories').select('*');
  const { data: subcats, error: sErr } = await supabase.from('subcategories').select('*');

  if (cErr || sErr) {
    console.error("Failed to fetch taxonomy:", cErr || sErr);
    process.exit(1);
  }

  const categoryMap = {}; // slug -> id
  cats.forEach(c => categoryMap[c.slug] = c.id);

  const subcategoryMap = {}; // slug -> id
  subcats.forEach(s => subcategoryMap[s.slug] = s.id);

  console.log("Taxonomy map ready:");
  console.log("Categories:", categoryMap);

  // Combine customProducts + additionalProducts (deduplicating by slug)
  const allMasterProducts = [...customProducts];
  const existingSlugs = new Set(allMasterProducts.map(p => p.slug));

  for (const extra of additionalProducts) {
    if (!existingSlugs.has(extra.slug)) {
      allMasterProducts.push({
        id: `prod_${extra.slug.replace(/-/g, '_')}`,
        ...extra,
        hasVariants: extra.variants.length > 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      existingSlugs.add(extra.slug);
    }
  }

  console.log(`\n2. Starting Seed for ${allMasterProducts.length} total products into Supabase...`);

  let insertedCount = 0;
  let updatedCount = 0;

  for (const prod of allMasterProducts) {
    const categoryId = categoryMap[prod.categorySlug] || categoryMap['clothing'];
    const subcategoryId = subcategoryMap[prod.subCategorySlug] || null;

    // Check if product already exists by slug
    const { data: existingProd } = await supabase
      .from('products')
      .select('id')
      .eq('slug', prod.slug)
      .maybeSingle();

    let productId = existingProd ? existingProd.id : null;

    if (productId) {
      // Update product
      await supabase.from('products').update({
        name: prod.name,
        tagline: prod.tagline,
        description: prod.description,
        category_id: categoryId,
        subcategory_id: subcategoryId,
        fabric_and_care: prod.fabricAndCare || [],
        is_published: prod.isPublished ?? true,
        is_archived: prod.isArchived ?? false,
        is_featured: prod.isFeatured ?? true,
        tags: prod.tags || [],
        updated_at: new Date().toISOString(),
      }).eq('id', productId);
      updatedCount++;
    } else {
      // Insert product
      const { data: newProd, error: insertErr } = await supabase.from('products').insert({
        name: prod.name,
        slug: prod.slug,
        tagline: prod.tagline,
        description: prod.description,
        category_id: categoryId,
        subcategory_id: subcategoryId,
        fabric_and_care: prod.fabricAndCare || [],
        is_published: prod.isPublished ?? true,
        is_archived: prod.isArchived ?? false,
        is_featured: prod.isFeatured ?? true,
        tags: prod.tags || [],
      }).select().single();

      if (insertErr || !newProd) {
        console.error(`Failed to insert ${prod.name}:`, insertErr);
        continue;
      }
      productId = newProd.id;
      insertedCount++;
    }

    // Refresh variants for this product
    await supabase.from('product_variants').delete().eq('product_id', productId);
    if (prod.variants && prod.variants.length > 0) {
      const variantRows = prod.variants.map((v) => ({
        product_id: productId,
        sku: v.sku,
        color_name: v.colorName || 'Standard',
        color_hex: v.colorHex || '#54121B',
        size: v.size,
        price_kobo: v.priceKobo,
        sale_price_kobo: v.salePriceKobo || null,
        stock_quantity: v.stockQuantity ?? 5,
        low_stock_threshold: v.lowStockThreshold ?? 2,
        is_active: v.isActive ?? true,
      }));
      await supabase.from('product_variants').insert(variantRows);
    }

    // Refresh images for this product
    await supabase.from('product_images').delete().eq('product_id', productId);
    if (prod.images && prod.images.length > 0) {
      const imageRows = prod.images.map((img, idx) => ({
        product_id: productId,
        url: img.url,
        alt_text: img.altText || prod.name,
        is_primary: !!img.isPrimary,
        sort_order: idx,
      }));
      await supabase.from('product_images').insert(imageRows);
    }

    console.log(`✓ [${prod.categorySlug}] ${prod.name} (${prod.slug}) -> UUID: ${productId}`);
  }

  console.log(`\n=== Supabase Seed Complete! ===`);
  console.log(`Inserted: ${insertedCount}, Updated: ${updatedCount}, Total: ${allMasterProducts.length}`);

  // Write updated master array back to customProducts.json so local disk cache is 100% in parity
  fs.writeFileSync('src/data/customProducts.json', JSON.stringify(allMasterProducts, null, 2), 'utf8');
  console.log(`✓ Updated src/data/customProducts.json with all ${allMasterProducts.length} synchronized products!`);
}

seed();
