'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  UploadCloud, 
  Image as ImageIcon, 
  Plus, 
  Trash2, 
  Check, 
  Sparkles, 
  ChevronRight, 
  AlertCircle,
  HelpCircle,
  Layers,
  Save,
  Eye
} from 'lucide-react';
import { slugify, generateSuggestedSku, formatKoboToNaira, parseNairaToKobo } from '@/lib/utils';
import { CategorySlug } from '@/types';

// Sizing options per category
const CLOTHING_SIZES = ['UK 6', 'UK 8', 'UK 10', 'UK 12', 'UK 14', 'UK 16', 'UK 18', 'UK 20'];
const SHOE_SIZES = ['EU 36', 'EU 37', 'EU 38', 'EU 39', 'EU 40', 'EU 41', 'EU 42'];
const STANDARD_SIZES = ['One Size'];

const POPULAR_COLORS = [
  { name: 'Imperial Oxblood', hex: '#54121B' },
  { name: 'Obsidian Black', hex: '#141312' },
  { name: 'Ivory Sand', hex: '#FAF8F5' },
  { name: 'Emerald Jewel', hex: '#064E3B' },
  { name: 'Royal Sapphire', hex: '#1E3A8A' },
  { name: 'Burnt Terracotta', hex: '#9A3412' },
  { name: 'Warm Mustard Gold', hex: '#B45309' },
];

export default function NewProductGuidedPage() {
  const router = useRouter();

  // Wizard Step: 1 | 2 | 3
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);

  // Step 1: Images
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [images, setImages] = useState<{ id: string; url: string; altText: string; isPrimary: boolean }[]>([
    {
      id: 'img_initial_1',
      url: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=900&q=80',
      altText: 'Primary garment front look',
      isPrimary: true,
    },
  ]);

  // Step 2: Basic Info & Pricing
  const [name, setName] = useState('');
  const [tagline, setTagline] = useState('');
  const [categorySlug, setCategorySlug] = useState<CategorySlug>('clothing');
  const [subCategorySlug, setSubCategorySlug] = useState('dresses');
  const [description, setDescription] = useState('');
  const [priceNaira, setPriceNaira] = useState('45000');
  const [salePriceNaira, setSalePriceNaira] = useState('');
  const [fabricCareInput, setFabricCareInput] = useState('Premium breathable crepe\nHand wash cold or dry clean\nDo not bleach');

  // Step 3: Variants & Stock
  const [selectedColors, setSelectedColors] = useState<string[]>(['Imperial Oxblood']);
  const [customColorName, setCustomColorName] = useState('');
  const [selectedSizes, setSelectedSizes] = useState<string[]>(['UK 10', 'UK 12', 'UK 14']);
  const [variantMatrix, setVariantMatrix] = useState<
    {
      id: string;
      sku: string;
      colorName: string;
      size: string;
      priceKobo: number;
      salePriceKobo?: number;
      stockQuantity: number;
      lowStockThreshold: number;
    }[]
  >([]);

  // State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);
  const [lastAutosave, setLastAutosave] = useState<string | null>(null);

  // Auto-update subcategories when category changes
  useEffect(() => {
    if (categorySlug === 'clothing') {
      setSubCategorySlug('dresses');
      setSelectedSizes(['UK 10', 'UK 12', 'UK 14']);
    } else if (categorySlug === 'shoes') {
      setSubCategorySlug('heels');
      setSelectedSizes(['EU 38', 'EU 39', 'EU 40']);
    } else if (categorySlug === 'bags') {
      setSubCategorySlug('handbags');
      setSelectedSizes(['One Size']);
    } else if (categorySlug === 'accessories') {
      setSubCategorySlug('jewellery');
      setSelectedSizes(['One Size']);
    }
  }, [categorySlug]);

  // Recompute Variant Combinations Matrix
  useEffect(() => {
    const baseKobo = parseNairaToKobo(priceNaira);
    const saleKobo = salePriceNaira ? parseNairaToKobo(salePriceNaira) : undefined;
    const prefix = generateSuggestedSku(categorySlug, name || 'PIECE');

    const newMatrix: typeof variantMatrix = [];

    selectedColors.forEach((color) => {
      selectedSizes.forEach((size) => {
        const colorCode = color.replace(/[^A-Za-z]/g, '').substring(0, 3).toUpperCase();
        const sizeCode = size.replace(/\s+/g, '').toUpperCase();
        const sku = `${prefix}-${colorCode}-${sizeCode}`;

        // Preserve previous stock count if exists
        const existing = variantMatrix.find((v) => v.colorName === color && v.size === size);
        const stockQuantity = existing ? existing.stockQuantity : 4;

        newMatrix.push({
          id: `var_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          sku,
          colorName: color,
          size,
          priceKobo: baseKobo,
          salePriceKobo: saleKobo,
          stockQuantity,
          lowStockThreshold: 2,
        });
      });
    });

    setVariantMatrix(newMatrix);
  }, [selectedColors, selectedSizes, priceNaira, salePriceNaira, categorySlug, name]);

  // Add Photo
  const handleAddImage = () => {
    if (!imageUrlInput.trim()) return;
    const newImg = {
      id: `img_${Date.now()}`,
      url: imageUrlInput.trim(),
      altText: `${name || 'Product'} photo`,
      isPrimary: images.length === 0,
    };
    setImages([...images, newImg]);
    setImageUrlInput('');
  };

  const handleSetPrimaryImage = (id: string) => {
    setImages(images.map((img) => ({ ...img, isPrimary: img.id === id })));
  };

  const handleRemoveImage = (id: string) => {
    const filtered = images.filter((img) => img.id !== id);
    if (filtered.length > 0 && !filtered.some((img) => img.isPrimary)) {
      filtered[0].isPrimary = true;
    }
    setImages(filtered);
  };

  // Add Custom Color
  const handleAddCustomColor = () => {
    if (!customColorName.trim()) return;
    if (!selectedColors.includes(customColorName.trim())) {
      setSelectedColors([...selectedColors, customColorName.trim()]);
    }
    setCustomColorName('');
  };

  // Update Stock in matrix
  const handleUpdateStock = (sku: string, newStock: number) => {
    setVariantMatrix((prev) =>
      prev.map((v) => (v.sku === sku ? { ...v, stockQuantity: Math.max(0, newStock) } : v))
    );
  };

  // Publish to Store
  const handlePublish = async (isDraft: boolean = false) => {
    setErrorNotice(null);

    if (!name.trim()) {
      setErrorNotice('Please provide a product title in Step 2.');
      setCurrentStep(2);
      return;
    }

    if (images.length === 0) {
      setErrorNotice('Please add at least one product photo in Step 1.');
      setCurrentStep(1);
      return;
    }

    if (variantMatrix.length === 0) {
      setErrorNotice('Please select at least one colour and size combination in Step 3.');
      setCurrentStep(3);
      return;
    }

    setIsSubmitting(true);

    try {
      const generatedSlug = slugify(name);
      const fabricCare = fabricCareInput
        .split('\n')
        .map((l) => l.trim())
        .filter(Boolean);

      const payload = {
        name: name.trim(),
        slug: generatedSlug,
        tagline: tagline.trim() || undefined,
        description: description.trim() || `${name} handcrafted in Aba with artisan tailoring.`,
        categorySlug,
        subCategorySlug,
        collectionSlugs: ['new-arrivals'],
        fabricAndCare: fabricCare,
        images: images.map((img, idx) => ({
          id: img.id,
          url: img.url,
          altText: img.altText,
          isPrimary: img.isPrimary,
          sortOrder: idx,
        })),
        variants: variantMatrix.map((v) => ({
          ...v,
          productId: '',
          isActive: true,
        })),
        hasVariants: variantMatrix.length > 1,
        isPublished: !isDraft,
        isArchived: false,
        isFeatured: true,
        tags: [categorySlug, subCategorySlug, 'new-arrival', 'aba-fashion'],
      };

      const res = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save product.');

      router.push('/admin/products');
    } catch (err: any) {
      console.error('[New Product] Error:', err);
      setErrorNotice(err.message || 'Could not save product. Please retry.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Top Breadcrumb & Step Tracker */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200">
        <div>
          <Link
            href="/admin/products"
            className="inline-flex items-center text-xs font-semibold uppercase tracking-wider text-stone-500 hover:text-stone-900 transition-colors mb-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Back to Products List
          </Link>
          <h1 className="font-serif text-2xl md:text-3xl font-bold text-stone-900">
            Guided Product Creator
          </h1>
        </div>

        {/* 3 Steps Indicator */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentStep(1)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              currentStep === 1
                ? 'bg-oxblood-700 text-white'
                : 'bg-stone-200 text-stone-700 hover:bg-stone-300'
            }`}
          >
            <span className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center text-[10px]">1</span>
            <span>Photos</span>
          </button>

          <ChevronRight className="w-3.5 h-3.5 text-stone-400" />

          <button
            onClick={() => setCurrentStep(2)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              currentStep === 2
                ? 'bg-oxblood-700 text-white'
                : 'bg-stone-200 text-stone-700 hover:bg-stone-300'
            }`}
          >
            <span className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center text-[10px]">2</span>
            <span>Name & Price</span>
          </button>

          <ChevronRight className="w-3.5 h-3.5 text-stone-400" />

          <button
            onClick={() => setCurrentStep(3)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              currentStep === 3
                ? 'bg-oxblood-700 text-white'
                : 'bg-stone-200 text-stone-700 hover:bg-stone-300'
            }`}
          >
            <span className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center text-[10px]">3</span>
            <span>Stock & Sizes</span>
          </button>
        </div>
      </div>

      {errorNotice && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3 text-xs text-red-800">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{errorNotice}</span>
        </div>
      )}

      {/* ======================================================== */}
      {/* STEP 1: UPLOAD & ARRANGE PHOTOS */}
      {/* ======================================================== */}
      {currentStep === 1 && (
        <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-6 md:p-8 space-y-6">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-oxblood-700">Step 1 of 3</span>
            <h2 className="font-serif text-xl font-bold text-stone-900 mt-0.5">
              Product Photography & Lookbook
            </h2>
            <p className="text-xs text-stone-500 mt-1">
              Add clear, editorial images of the garment, shoe, or bag. Tap any photo to set it as the cover display.
            </p>
          </div>

          {/* Add Image by URL / Upload Simulation */}
          <div className="p-4 bg-sand-50 rounded-lg border border-sand-300 space-y-3">
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700">
              Add Image URL / Upload Link:
            </label>
            <div className="flex gap-2">
              <input
                type="url"
                placeholder="https://images.unsplash.com/... or paste image URL"
                value={imageUrlInput}
                onChange={(e) => setImageUrlInput(e.target.value)}
                className="flex-1 px-3.5 py-2.5 text-xs bg-white border border-stone-300 rounded focus:outline-none focus:border-stone-900"
              />
              <button
                type="button"
                onClick={handleAddImage}
                className="px-4 py-2.5 bg-stone-900 text-white text-xs font-semibold uppercase tracking-wider rounded hover:bg-oxblood-700 transition-colors"
              >
                + Add Image
              </button>
            </div>

            {/* Quick Demo Fashion Image Presets */}
            <div className="pt-2 flex flex-wrap items-center gap-2 text-[11px] text-stone-500">
              <span className="font-medium">Quick Presets:</span>
              <button
                type="button"
                onClick={() => setImageUrlInput('https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&fit=crop&w=900&q=80')}
                className="text-oxblood-700 underline hover:text-stone-900"
              >
                Dress Look 1
              </button>
              <span>•</span>
              <button
                type="button"
                onClick={() => setImageUrlInput('https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=900&q=80')}
                className="text-oxblood-700 underline hover:text-stone-900"
              >
                Shoe Look
              </button>
              <span>•</span>
              <button
                type="button"
                onClick={() => setImageUrlInput('https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=900&q=80')}
                className="text-oxblood-700 underline hover:text-stone-900"
              >
                Bag Look
              </button>
            </div>
          </div>

          {/* Current Images Gallery */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-700 mb-3">
              Uploaded Gallery ({images.length} photos)
            </h3>

            {images.length === 0 ? (
              <div className="p-8 text-center border-2 border-dashed border-stone-200 rounded-lg text-stone-400 text-xs">
                No images added yet. Please paste a link above.
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {images.map((img) => (
                  <div
                    key={img.id}
                    className={`relative rounded-lg overflow-hidden border-2 transition-all ${
                      img.isPrimary ? 'border-oxblood-700 ring-2 ring-oxblood-700/30' : 'border-stone-200'
                    }`}
                  >
                    <div className="aspect-[3/4] relative bg-stone-100">
                      <Image
                        src={img.url}
                        alt={img.altText}
                        fill
                        className="object-cover"
                      />
                    </div>

                    {img.isPrimary && (
                      <span className="absolute top-2 left-2 bg-oxblood-700 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow">
                        PRIMARY COVER
                      </span>
                    )}

                    <div className="p-2 bg-white flex items-center justify-between border-t border-stone-100">
                      {!img.isPrimary && (
                        <button
                          type="button"
                          onClick={() => handleSetPrimaryImage(img.id)}
                          className="text-[10px] font-semibold text-oxblood-700 hover:underline"
                        >
                          Make Cover
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(img.id)}
                        className="text-stone-400 hover:text-red-600 p-1 ml-auto"
                        title="Remove"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Continue Button */}
          <div className="pt-4 border-t border-stone-200 flex justify-end">
            <button
              type="button"
              onClick={() => setCurrentStep(2)}
              className="px-6 py-2.5 bg-stone-900 text-white text-xs font-semibold uppercase tracking-wider rounded hover:bg-oxblood-700 transition-colors flex items-center gap-2"
            >
              <span>Continue to Step 2: Name & Price</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* STEP 2: NAME, CATEGORY, DESCRIPTION & PRICE */}
      {/* ======================================================== */}
      {currentStep === 2 && (
        <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-6 md:p-8 space-y-6">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-oxblood-700">Step 2 of 3</span>
            <h2 className="font-serif text-xl font-bold text-stone-900 mt-0.5">
              Product Details & NGN Pricing
            </h2>
            <p className="text-xs text-stone-500 mt-1">
              Give your design a distinct name and set transparent Nigerian Naira pricing.
            </p>
          </div>

          <div className="space-y-4">
            
            {/* Title */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1.5">
                Product Title <span className="text-oxblood-700">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. The Adaugo Crepe Midi Dress"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm bg-sand-50 border border-stone-300 rounded focus:outline-none focus:border-stone-900 font-medium text-stone-900"
              />
              <span className="text-[11px] text-stone-400 mt-1 block">
                Store slug: <code className="text-stone-600 font-mono">/products/{slugify(name || 'product-title')}</code>
              </span>
            </div>

            {/* Tagline */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1.5">
                Editorial Tagline <span className="text-stone-400 font-normal">(Brief highlight)</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Sculpted puff sleeves with gold cinched buckle"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                className="w-full px-3.5 py-2 text-xs bg-sand-50 border border-stone-300 rounded focus:outline-none focus:border-stone-900 text-stone-900"
              />
            </div>

            {/* Category & Subcategory */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1.5">
                  Category <span className="text-oxblood-700">*</span>
                </label>
                <select
                  value={categorySlug}
                  onChange={(e) => setCategorySlug(e.target.value as CategorySlug)}
                  className="w-full px-3.5 py-2.5 text-xs bg-sand-50 border border-stone-300 rounded focus:outline-none focus:border-stone-900 font-medium text-stone-900"
                >
                  <option value="clothing">Clothing (Dresses, Sets, Tops, Jumpsuits)</option>
                  <option value="shoes">Shoes (Heels, Sandals, Slippers)</option>
                  <option value="bags">Bags (Handbags, Shoulder Bags)</option>
                  <option value="accessories">Accessories (Jewellery, Sunglasses, Belts)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1.5">
                  Subcategory
                </label>
                <input
                  type="text"
                  placeholder="e.g. dresses, heels, clutches"
                  value={subCategorySlug}
                  onChange={(e) => setSubCategorySlug(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-sand-50 border border-stone-300 rounded focus:outline-none focus:border-stone-900 text-stone-900"
                />
              </div>
            </div>

            {/* Pricing Section (In Naira, stored as Kobo) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-sand-50 rounded-lg border border-sand-300">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1.5">
                  Regular Price (₦ NGN) <span className="text-oxblood-700">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-stone-500 font-semibold text-xs">₦</span>
                  <input
                    type="number"
                    required
                    min="1000"
                    step="500"
                    placeholder="45000"
                    value={priceNaira}
                    onChange={(e) => setPriceNaira(e.target.value)}
                    className="w-full pl-8 pr-3.5 py-2 text-sm bg-white border border-stone-300 rounded focus:outline-none focus:border-stone-900 font-bold text-stone-900"
                  />
                </div>
                <span className="text-[10px] text-stone-500 mt-1 block">
                  Integer Kobo: <code className="font-mono">{parseNairaToKobo(priceNaira)} kobo</code>
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1.5">
                  Sale Price (₦ NGN) <span className="text-stone-400 font-normal">(Optional genuine discount)</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-stone-500 font-semibold text-xs">₦</span>
                  <input
                    type="number"
                    min="0"
                    step="500"
                    placeholder="e.g. 38000"
                    value={salePriceNaira}
                    onChange={(e) => setSalePriceNaira(e.target.value)}
                    className="w-full pl-8 pr-3.5 py-2 text-sm bg-white border border-stone-300 rounded focus:outline-none focus:border-stone-900 font-bold text-stone-900"
                  />
                </div>
                {salePriceNaira && (
                  <span className="text-[10px] text-emerald-700 mt-1 block font-medium">
                    Genuine sale active: {formatKoboToNaira(parseNairaToKobo(salePriceNaira))}
                  </span>
                )}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1.5">
                Garment Description & Styling
              </label>
              <textarea
                rows={3}
                placeholder="Describe the fit, silhouette, craftsmanship, and occasion styling..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs bg-sand-50 border border-stone-300 rounded focus:outline-none focus:border-stone-900 text-stone-900"
              />
            </div>

            {/* Fabric & Care */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1.5">
                Fabric Details & Care Instructions <span className="text-stone-400 font-normal">(One per line)</span>
              </label>
              <textarea
                rows={3}
                placeholder="Premium crepe silk&#10;Dry clean recommended&#10;Iron on reverse"
                value={fabricCareInput}
                onChange={(e) => setFabricCareInput(e.target.value)}
                className="w-full px-3.5 py-2 text-xs font-mono bg-sand-50 border border-stone-300 rounded focus:outline-none focus:border-stone-900 text-stone-900"
              />
            </div>

          </div>

          {/* Navigation Buttons */}
          <div className="pt-4 border-t border-stone-200 flex justify-between">
            <button
              type="button"
              onClick={() => setCurrentStep(1)}
              className="px-5 py-2 text-xs font-semibold uppercase tracking-wider text-stone-600 hover:text-stone-900 transition-colors"
            >
              ← Back to Photos
            </button>

            <button
              type="button"
              onClick={() => setCurrentStep(3)}
              className="px-6 py-2.5 bg-stone-900 text-white text-xs font-semibold uppercase tracking-wider rounded hover:bg-oxblood-700 transition-colors flex items-center gap-2"
            >
              <span>Continue to Step 3: Stock & Sizes</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* STEP 3: SIZES, COLOURS, STOCK MATRIX & PUBLISH */}
      {/* ======================================================== */}
      {currentStep === 3 && (
        <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-6 md:p-8 space-y-6">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-oxblood-700">Step 3 of 3</span>
            <h2 className="font-serif text-xl font-bold text-stone-900 mt-0.5">
              Available Sizes, Colours & Stock Units
            </h2>
            <p className="text-xs text-stone-500 mt-1">
              Select available options. We automatically generate unique SKUs and track stock for each combination.
            </p>
          </div>

          {/* 1. Colours Selector */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-2">
              Select Colours Made for this Piece:
            </label>
            <div className="flex flex-wrap gap-2 mb-3">
              {POPULAR_COLORS.map((col) => {
                const isSelected = selectedColors.includes(col.name);
                return (
                  <button
                    key={col.name}
                    type="button"
                    onClick={() => {
                      if (isSelected) {
                        if (selectedColors.length > 1) {
                          setSelectedColors(selectedColors.filter((c) => c !== col.name));
                        }
                      } else {
                        setSelectedColors([...selectedColors, col.name]);
                      }
                    }}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-2 transition-all ${
                      isSelected
                        ? 'bg-stone-900 text-white ring-2 ring-oxblood-700'
                        : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                    }`}
                  >
                    <span
                      className="w-3 h-3 rounded-full border border-stone-300"
                      style={{ backgroundColor: col.hex }}
                    />
                    <span>{col.name}</span>
                    {isSelected && <Check className="w-3 h-3" />}
                  </button>
                );
              })}
            </div>

            {/* Custom Colour Adder */}
            <div className="flex gap-2 max-w-sm">
              <input
                type="text"
                placeholder="Or add another colour name..."
                value={customColorName}
                onChange={(e) => setCustomColorName(e.target.value)}
                className="flex-1 px-3 py-1.5 text-xs bg-sand-50 border border-stone-300 rounded"
              />
              <button
                type="button"
                onClick={handleAddCustomColor}
                className="px-3 py-1.5 bg-stone-800 text-white text-xs rounded hover:bg-stone-900"
              >
                + Add
              </button>
            </div>
          </div>

          {/* 2. Sizes Selector (Category-Aware) */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-2">
              Available Sizes ({categorySlug === 'shoes' ? 'EU Shoe Sizing' : categorySlug === 'clothing' ? 'UK Dress Sizing' : 'Dimensions / Standard'}):
            </label>
            <div className="flex flex-wrap gap-2">
              {(categorySlug === 'clothing'
                ? CLOTHING_SIZES
                : categorySlug === 'shoes'
                ? SHOE_SIZES
                : STANDARD_SIZES
              ).map((size) => {
                const isSelected = selectedSizes.includes(size);
                return (
                  <button
                    key={size}
                    type="button"
                    onClick={() => {
                      if (isSelected) {
                        if (selectedSizes.length > 1) {
                          setSelectedSizes(selectedSizes.filter((s) => s !== size));
                        }
                      } else {
                        setSelectedSizes([...selectedSizes, size]);
                      }
                    }}
                    className={`px-4 py-2 rounded text-xs font-bold transition-all ${
                      isSelected
                        ? 'bg-stone-900 text-white'
                        : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                    }`}
                  >
                    {size}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Generated Stock Inventory Table */}
          <div className="border border-stone-200 rounded-lg overflow-hidden">
            <div className="p-3 bg-stone-100 border-b border-stone-200 text-xs font-semibold text-stone-700 flex items-center justify-between">
              <span>Sellable Variant Combinations ({variantMatrix.length})</span>
              <span className="text-[11px] text-stone-500 font-normal">Enter units in Aba warehouse:</span>
            </div>

            <div className="divide-y divide-stone-100 max-h-60 overflow-y-auto">
              {variantMatrix.map((v) => (
                <div key={v.sku} className="p-3 flex items-center justify-between text-xs hover:bg-sand-50">
                  <div>
                    <div className="font-semibold text-stone-900">{v.colorName} • {v.size}</div>
                    <div className="text-[11px] font-mono text-stone-400">{v.sku}</div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-stone-500 text-[11px]">In Stock:</span>
                    <input
                      type="number"
                      min="0"
                      value={v.stockQuantity}
                      onChange={(e) => handleUpdateStock(v.sku, parseInt(e.target.value) || 0)}
                      className="w-16 px-2 py-1 text-center font-bold text-xs bg-white border border-stone-300 rounded focus:outline-none focus:border-stone-900"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action CTAs */}
          <div className="pt-6 border-t border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <button
              type="button"
              onClick={() => setCurrentStep(2)}
              className="text-xs font-semibold uppercase tracking-wider text-stone-600 hover:text-stone-900 transition-colors"
            >
              ← Back to Details
            </button>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => handlePublish(true)}
                className="flex-1 sm:flex-none px-5 py-3 border border-stone-300 text-stone-800 text-xs font-semibold uppercase tracking-wider rounded hover:bg-stone-50 transition-colors"
              >
                Save as Draft
              </button>

              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => handlePublish(false)}
                className="flex-1 sm:flex-none px-8 py-3 bg-oxblood-700 text-white text-xs font-bold uppercase tracking-widest rounded hover:bg-oxblood-800 transition-colors shadow flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Publishing...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Publish to Live Store</span>
                  </>
                )}
              </button>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}

