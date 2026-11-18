'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  Save, 
  Trash2, 
  ExternalLink, 
  AlertCircle, 
  Check, 
  Layers,
  Sparkles,
  Camera,
  UploadCloud,
  Loader2,
  Plus,
  Palette,
  X,
  Minus,
  CheckCircle2,
  AlertTriangle,
  RotateCcw
} from 'lucide-react';
import { formatKoboToNaira, parseNairaToKobo } from '@/lib/utils';
import { Product, ProductVariant } from '@/types';
import { ConfirmDialog, DialogVariant } from '@/components/ui/ConfirmDialog';

// Fallback color hex mapping for popular fashion shades
const COLOR_SWATCH_MAP: Record<string, string> = {
  'imperial oxblood': '#54121B',
  'oxblood': '#54121B',
  'wine': '#54121B',
  'burgundy': '#4A0404',
  'obsidian black': '#141312',
  'black': '#141312',
  'ivory sand': '#FAF8F5',
  'ivory': '#FAF8F5',
  'cream': '#F7F2EA',
  'white': '#FFFFFF',
  'emerald jewel': '#064E3B',
  'emerald green': '#064E3B',
  'emerald': '#064E3B',
  'green': '#15803D',
  'royal sapphire': '#1E3A8A',
  'blue': '#1D4ED8',
  'navy': '#0F172A',
  'burnt terracotta': '#9A3412',
  'terracotta': '#B4533C',
  'rust': '#9A3412',
  'warm mustard gold': '#B45309',
  'mustard gold': '#B45309',
  'gold': '#D4AF37',
  'champagne gold': '#D4AF37',
  'champagne': '#F7E7CE',
  'dusty rose': '#BE7B72',
  'rose': '#BE7B72',
  'pink': '#F472B6',
  'lilac pearl': '#9370DB',
  'lilac': '#C084FC',
  'purple': '#7E22CE',
  'olive green': '#4D5D38',
  'olive': '#4D5D38',
};

const PRESET_COLORS = [
  { name: 'Imperial Oxblood', hex: '#54121B' },
  { name: 'Obsidian Black', hex: '#141312' },
  { name: 'Ivory Sand', hex: '#FAF8F5' },
  { name: 'Emerald Jewel', hex: '#064E3B' },
  { name: 'Royal Sapphire', hex: '#1E3A8A' },
  { name: 'Burnt Terracotta', hex: '#9A3412' },
  { name: 'Warm Mustard Gold', hex: '#B45309' },
  { name: 'Dusty Rose', hex: '#BE7B72' },
  { name: 'Champagne Gold', hex: '#D4AF37' },
  { name: 'Olive Green', hex: '#4D5D38' },
  { name: 'Lilac Pearl', hex: '#9370DB' },
];

export default function EditProductPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params.id as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  // Form Fields
  const [name, setName] = useState('');
  const [tagline, setTagline] = useState('');
  const [description, setDescription] = useState('');
  const [priceNaira, setPriceNaira] = useState('');
  const [salePriceNaira, setSalePriceNaira] = useState('');
  const [isPublished, setIsPublished] = useState(true);
  const [variants, setVariants] = useState<ProductVariant[]>([]);

  // Photos
  const [images, setImages] = useState<{ id: string; url: string; altText: string; isPrimary: boolean }[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingFiles, setIsUploadingFiles] = useState(false);

  // Status
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  // Color & Variant Add State
  const [isAddingNewColor, setIsAddingNewColor] = useState(false);
  const [newColorSelection, setNewColorSelection] = useState('Imperial Oxblood');
  const [customColorInput, setCustomColorInput] = useState('');
  const [newColorSelectedSizes, setNewColorSelectedSizes] = useState<string[]>(['UK 10', 'UK 12', 'UK 14']);
  const [newColorDefaultStock, setNewColorDefaultStock] = useState('3');

  // Inline Size Add for existing color
  const [addingSizeForColor, setAddingSizeForColor] = useState<string | null>(null);
  const [inlineNewSize, setInlineNewSize] = useState('UK 16');
  const [inlineNewQty, setInlineNewQty] = useState('3');

  // Custom Bespoke Dialog States (Replacing native alert & confirm)
  const [colorPendingDeletion, setColorPendingDeletion] = useState<string | null>(null);
  const [variantPendingDeletion, setVariantPendingDeletion] = useState<{ id: string; label: string } | null>(null);
  const [alertDialog, setAlertDialog] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    variant: DialogVariant;
  }>({
    isOpen: false,
    title: '',
    description: '',
    variant: 'warning',
  });

  const showAlert = (title: string, description: string, variant: DialogVariant = 'warning') => {
    setAlertDialog({ isOpen: true, title, description, variant });
  };

  useEffect(() => {
    fetch('/api/products')
      .then((r) => r.json())
      .then((data: Product[]) => {
        const found = data.find((p) => p.id === productId || p.slug === productId);
        if (found) {
          setProduct(found);
          setName(found.name);
          setTagline(found.tagline || '');
          setDescription(found.description);
          setIsPublished(found.isPublished);
          setVariants(found.variants);
          setImages(found.images || []);

          if (found.variants[0]) {
            setPriceNaira(String(Math.round(found.variants[0].priceKobo / 100)));
            if (found.variants[0].salePriceKobo) {
              setSalePriceNaira(String(Math.round(found.variants[0].salePriceKobo / 100)));
            }
          }

          // Initialize size options default based on category
          if (found.categorySlug === 'shoes') {
            setNewColorSelectedSizes(['EU 37', 'EU 38', 'EU 39', 'EU 40']);
            setInlineNewSize('EU 41');
          } else if (found.categorySlug === 'bags' || found.categorySlug === 'accessories') {
            setNewColorSelectedSizes(['One Size']);
            setInlineNewSize('One Size');
          } else {
            setNewColorSelectedSizes(['UK 10', 'UK 12', 'UK 14']);
            setInlineNewSize('UK 16');
          }
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [productId]);

  // Available Sizes palette according to category
  const getAvailableCategorySizes = () => {
    if (product?.categorySlug === 'shoes') {
      return ['EU 36', 'EU 37', 'EU 38', 'EU 39', 'EU 40', 'EU 41', 'EU 42'];
    }
    if (product?.categorySlug === 'bags' || product?.categorySlug === 'accessories') {
      return ['One Size'];
    }
    return ['UK 6', 'UK 8', 'UK 10', 'UK 12', 'UK 14', 'UK 16', 'UK 18', 'UK 20'];
  };

  // Grouped active colors from variants
  const activeColorNames = Array.from(new Set(variants.map((v) => v.colorName).filter(Boolean)));

  const handleDeviceFiles = async (files: FileList | File[]) => {
    if (!files || files.length === 0) return;
    setIsUploadingFiles(true);
    setFeedback(null);

    try {
      const formData = new FormData();
      Array.from(files).forEach((file) => {
        formData.append('files', file);
      });

      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to upload photo.');

      const newUploaded = (data.files || []).map((f: any, idx: number) => ({
        id: `img_${Date.now()}_${idx}`,
        url: f.url,
        altText: `${name || 'Product'} photo`,
        isPrimary: images.length === 0 && idx === 0,
      }));

      setImages((prev) => [...prev, ...newUploaded]);
      setFeedback('New photo(s) uploaded successfully! Remember to save changes.');
    } catch (err: any) {
      const fallbackImages = Array.from(files).map((file, idx) => ({
        id: `img_local_${Date.now()}_${idx}`,
        url: URL.createObjectURL(file),
        altText: `${name || 'Product'} photo`,
        isPrimary: images.length === 0 && idx === 0,
      }));
      setImages((prev) => [...prev, ...fallbackImages]);
    } finally {
      setIsUploadingFiles(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
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

  const handleUpdateStock = (variantId: string, newQty: number) => {
    setVariants((prev) =>
      prev.map((v) => (v.id === variantId ? { ...v, stockQuantity: Math.max(0, newQty) } : v))
    );
  };

  // 1. Remove an entire color (Trigger custom confirm modal)
  const handlePromptRemoveColor = (colorToRemove: string) => {
    if (activeColorNames.length <= 1) {
      showAlert(
        "Minimum Color Required",
        "A boutique product must keep at least one active color on record.\n\nIf all units of this color are sold out, you can set the stock quantities to 0 (Mark Sold Out) or unpublish the product from the storefront."
      );
      return;
    }

    setColorPendingDeletion(colorToRemove);
  };

  // 2. Mark an entire color as Out of Stock (0 units across all sizes)
  const handleMarkColorOutOfStock = (colorName: string) => {
    setVariants((prev) =>
      prev.map((v) => (v.colorName === colorName ? { ...v, stockQuantity: 0 } : v))
    );
    setFeedback(`Marked all units of "${colorName}" as Out of Stock (0 units).`);
  };

  // 3. Remove a single size variant (Trigger custom confirm modal)
  const handlePromptRemoveVariant = (variant: ProductVariant) => {
    if (variants.length <= 1) {
      showAlert(
        "Minimum Variant Required",
        "A product must retain at least one size variant."
      );
      return;
    }
    setVariantPendingDeletion({ id: variant.id, label: `${variant.colorName} • ${variant.size}` });
  };

  // 4. Add a brand new color with its sizes
  const handleAddNewColor = () => {
    const finalColorName = (newColorSelection === '__custom' ? customColorInput : newColorSelection).trim();

    if (!finalColorName) {
      showAlert("Color Name Required", "Please select a preset boutique swatch or enter a custom color name.");
      return;
    }

    if (activeColorNames.some((c) => c.toLowerCase() === finalColorName.toLowerCase())) {
      showAlert("Color Already Exists", `The color "${finalColorName}" is already active on this product.`);
      return;
    }

    if (newColorSelectedSizes.length === 0) {
      showAlert("Sizes Selection Needed", "Please select at least one size to stock for this new color.");
      return;
    }

    const baseKobo = parseNairaToKobo(priceNaira);
    const saleKobo = salePriceNaira ? parseNairaToKobo(salePriceNaira) : undefined;
    const initialQty = Math.max(0, parseInt(newColorDefaultStock) || 0);

    const prefix = (product?.slug || 'AB').substring(0, 6).toUpperCase();
    const colorCode = finalColorName.replace(/[^A-Za-z]/g, '').substring(0, 3).toUpperCase() || 'COL';
    const prodId = product?.id || productId;

    const newVariants: ProductVariant[] = newColorSelectedSizes.map((size) => {
      const sizeCode = size.replace(/\s+/g, '').toUpperCase();
      return {
        id: `var_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        productId: prodId,
        sku: `${prefix}-${colorCode}-${sizeCode}`,
        colorName: finalColorName,
        colorHex: COLOR_SWATCH_MAP[finalColorName.toLowerCase()] || '#6B1724',
        size,
        stockQuantity: initialQty,
        lowStockThreshold: 2,
        isActive: true,
        priceKobo: baseKobo,
        salePriceKobo: saleKobo,
      };
    });

    setVariants((prev) => [...prev, ...newVariants]);
    setIsAddingNewColor(false);
    setNewColorSelection('Imperial Oxblood');
    setCustomColorInput('');
    setFeedback(`Added "${finalColorName}" with ${newVariants.length} sizes! Remember to save changes.`);
  };

  // 5. Add a single size to an existing color
  const handleAddSizeToExistingColor = (colorName: string) => {
    const trimmedSize = inlineNewSize.trim();
    if (!trimmedSize) return;

    const alreadyExists = variants.some(
      (v) => v.colorName === colorName && v.size.toLowerCase() === trimmedSize.toLowerCase()
    );

    if (alreadyExists) {
      showAlert("Size Already Exists", `Size "${trimmedSize}" is already configured for ${colorName}.`);
      return;
    }

    const baseKobo = parseNairaToKobo(priceNaira);
    const saleKobo = salePriceNaira ? parseNairaToKobo(salePriceNaira) : undefined;
    const prefix = (product?.slug || 'AB').substring(0, 6).toUpperCase();
    const colorCode = colorName.replace(/[^A-Za-z]/g, '').substring(0, 3).toUpperCase() || 'COL';
    const sizeCode = trimmedSize.replace(/\s+/g, '').toUpperCase();
    const qty = Math.max(0, parseInt(inlineNewQty) || 0);
    const prodId = product?.id || productId;

    const newVar: ProductVariant = {
      id: `var_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      productId: prodId,
      sku: `${prefix}-${colorCode}-${sizeCode}`,
      colorName,
      colorHex: COLOR_SWATCH_MAP[colorName.toLowerCase()] || '#6B1724',
      size: trimmedSize,
      stockQuantity: qty,
      lowStockThreshold: 2,
      isActive: true,
      priceKobo: baseKobo,
      salePriceKobo: saleKobo,
    };

    setVariants((prev) => [...prev, newVar]);
    setAddingSizeForColor(null);
    setFeedback(`Added size "${trimmedSize}" to "${colorName}".`);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return;

    if (variants.length === 0) {
      showAlert("No Variants Defined", "You must have at least one sellable variant before saving.");
      return;
    }

    setSaving(true);
    setFeedback(null);

    const baseKobo = parseNairaToKobo(priceNaira);
    const saleKobo = salePriceNaira ? parseNairaToKobo(salePriceNaira) : undefined;

    const updatedVariants = variants.map((v) => ({
      ...v,
      priceKobo: baseKobo,
      salePriceKobo: saleKobo,
    }));

    try {
      const res = await fetch(`/api/admin/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...product,
          name,
          tagline,
          description,
          isPublished,
          images,
          variants: updatedVariants,
        }),
      });

      if (res.ok) {
        setFeedback('Product details, colors, and inventory updated successfully!');
        setTimeout(() => setFeedback(null), 3500);
      } else {
        const data = await res.json();
        throw new Error(data.error || 'Failed to update product');
      }
    } catch (err: any) {
      showAlert("Save Failed", err.message || 'An error occurred while saving.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-xs font-semibold uppercase tracking-wider text-stone-500">
        Loading Product Editor...
      </div>
    );
  }

  if (!product) {
    return (
      <div className="bg-white p-8 rounded-xl border border-stone-200 text-center space-y-3">
        <h2 className="font-serif text-lg font-bold text-stone-900">Product Not Found</h2>
        <Link href="/admin/products" className="inline-block text-xs text-oxblood-700 underline font-semibold">
          Return to Products
        </Link>
      </div>
    );
  }

  const totalUnits = variants.reduce((acc, v) => acc + (v.stockQuantity || 0), 0);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <Link
            href="/admin/products"
            className="inline-flex items-center text-xs font-semibold uppercase tracking-wider text-stone-400 hover:text-white transition-colors mb-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Back to Products List
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="font-serif text-2xl font-bold text-white">
              Edit {product.name}
            </h1>
            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
              isPublished ? 'bg-emerald-400/20 text-emerald-300 border border-emerald-400/30' : 'bg-white/10 text-stone-300 border border-white/15'
            }`}>
              {isPublished ? 'Published' : 'Draft'}
            </span>
          </div>
        </div>

        <Link
          href={`/products/${product.slug}`}
          target="_blank"
          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white/10 hover:bg-white/20 text-stone-200 border border-white/15 text-xs font-semibold rounded-lg transition-colors"
        >
          <span>View on Store</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </Link>
      </div>

      {feedback && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-lg flex items-center gap-2 shadow-xs">
          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6 text-xs">
        
        {/* Basic Info */}
        <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-6 space-y-4">
          <h2 className="font-serif text-base font-bold text-stone-900">
            Design Name & Narrative
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold uppercase tracking-wider text-stone-700 mb-1.5">
                Product Title:
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-sand-50 border border-stone-300 rounded font-medium text-stone-900"
              />
            </div>

            <div>
              <label className="block font-semibold uppercase tracking-wider text-stone-700 mb-1.5">
                Editorial Tagline:
              </label>
              <input
                type="text"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-sand-50 border border-stone-300 rounded text-stone-900"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold uppercase tracking-wider text-stone-700 mb-1.5">
              Description:
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2 bg-sand-50 border border-stone-300 rounded text-stone-900"
            />
          </div>

          {/* Pricing */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-sand-50 rounded-lg border border-sand-300">
            <div>
              <label className="block font-semibold uppercase tracking-wider text-stone-700 mb-1">
                Regular Price (₦ NGN):
              </label>
              <input
                type="number"
                required
                value={priceNaira}
                onChange={(e) => setPriceNaira(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-stone-300 rounded font-bold text-stone-900"
              />
            </div>

            <div>
              <label className="block font-semibold uppercase tracking-wider text-stone-700 mb-1">
                Sale Price (₦ NGN) (Optional):
              </label>
              <input
                type="number"
                value={salePriceNaira}
                onChange={(e) => setSalePriceNaira(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-stone-300 rounded font-bold text-stone-900"
              />
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isPublished}
                onChange={(e) => setIsPublished(e.target.checked)}
                className="w-4 h-4 accent-oxblood-700 rounded"
              />
              <span className="font-semibold text-stone-800">Publish item on storefront</span>
            </label>
          </div>
        </div>

        {/* Product Photography & Lookbook */}
        <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="font-serif text-base font-bold text-stone-900 flex items-center gap-2">
                <Camera className="w-4 h-4 text-oxblood-700" />
                Product Photography ({images.length} photos)
              </h2>
              <p className="text-xs text-stone-500 mt-0.5">
                Upload new photos from your phone gallery or computer. The first image marked Cover will be shown across the store.
              </p>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => e.target.files && handleDeviceFiles(e.target.files)}
            />

            <button
              type="button"
              disabled={isUploadingFiles}
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 bg-white hover:bg-stone-50 text-stone-900 border-2 border-stone-900 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all shrink-0 disabled:opacity-50 shadow-sm hover:shadow"
            >
              {isUploadingFiles ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-oxblood-700" />
                  <span>Uploading...</span>
                </>
              ) : (
                <>
                  <Camera className="w-3.5 h-3.5 text-oxblood-700" />
                  <span>Add Device Photos</span>
                </>
              )}
            </button>
          </div>

          {images.length === 0 ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="p-8 text-center border-2 border-dashed border-stone-200 hover:border-oxblood-700/50 rounded-lg text-stone-400 text-xs cursor-pointer"
            >
              No photos currently attached. Tap to pick photos from your phone or PC.
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
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
                      alt={img.altText || name}
                      fill
                      unoptimized={img.url.startsWith('blob:') || img.url.startsWith('data:') || img.url.startsWith('/uploads/')}
                      className="object-cover"
                    />
                  </div>

                  {img.isPrimary && (
                    <span className="absolute top-2 left-2 bg-oxblood-700 text-white text-[9px] font-bold px-2 py-0.5 rounded shadow">
                      COVER PHOTO
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

        {/* ======================================================== */}
        {/* COLORS & VARIANT INVENTORY MANAGEMENT */}
        {/* ======================================================== */}
        <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200">
            <div>
              <h2 className="font-serif text-base font-bold text-stone-900 flex items-center gap-2">
                <Palette className="w-4 h-4 text-oxblood-700" />
                <span>Colors & Stock Management</span>
                <span className="text-[11px] font-sans font-semibold px-2 py-0.5 bg-stone-100 text-stone-700 rounded-full">
                  {activeColorNames.length} {activeColorNames.length === 1 ? 'Color' : 'Colors'} • {totalUnits} Units Total
                </span>
              </h2>
              <p className="text-xs text-stone-500 mt-1">
                Manage which colors the boutique currently carries in stock. Remove depleted colors or add new colors that just arrived.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsAddingNewColor(!isAddingNewColor)}
              className="px-4 py-2 bg-oxblood-700 hover:bg-oxblood text-white rounded-lg text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors shrink-0 shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{isAddingNewColor ? 'Close Color Form' : 'Add New Color'}</span>
            </button>
          </div>

          {/* Active Colors Quick Bar */}
          <div className="p-3.5 bg-stone-50 border border-stone-200 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-stone-700">
                Colors Currently on Storefront:
              </span>
              <span className="text-[10px] text-stone-500">
                Tap &quot;Remove Color&quot; below if a color is depleted
              </span>
            </div>

            <div className="flex flex-wrap gap-2 pt-0.5">
              {activeColorNames.map((color) => {
                const clean = color.toLowerCase().trim();
                const hex = COLOR_SWATCH_MAP[clean] || '#6B1724';
                const colorVariants = variants.filter((v) => v.colorName === color);
                const colorUnits = colorVariants.reduce((sum, v) => sum + (v.stockQuantity || 0), 0);

                return (
                  <div
                    key={color}
                    className="inline-flex items-center gap-2 px-3 py-1.5 bg-white border border-stone-200 rounded-lg text-xs shadow-xs"
                  >
                    <span
                      className="w-3 h-3 rounded-full border border-stone-300 shrink-0"
                      style={{ backgroundColor: hex }}
                    />
                    <span className="font-semibold text-stone-900">{color}</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${
                      colorUnits > 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
                    }`}>
                      {colorUnits > 0 ? `${colorUnits} units` : 'Out of stock'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ADD NEW COLOR PANEL (Collapsible) */}
          {isAddingNewColor && (
            <div className="p-5 bg-sand-50 border-2 border-dashed border-oxblood-700/40 rounded-xl space-y-4 animate-fade-in">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Palette className="w-4 h-4 text-oxblood-700" />
                  <h3 className="font-serif font-bold text-stone-900 text-sm">
                    Add a New Color to This Product
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAddingNewColor(false)}
                  className="text-stone-400 hover:text-stone-700"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Color Preset Swatches */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-700 mb-2">
                  Choose Color:
                </label>
                <div className="flex flex-wrap gap-2">
                  {PRESET_COLORS.map((c) => {
                    const isSelected = newColorSelection === c.name;
                    return (
                      <button
                        key={c.name}
                        type="button"
                        onClick={() => setNewColorSelection(c.name)}
                        className={`px-3 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-2 transition-all ${
                          isSelected
                            ? 'border-oxblood-700 bg-oxblood-700 text-white shadow-xs'
                            : 'border-stone-200 bg-white text-stone-800 hover:border-stone-400'
                        }`}
                      >
                        <span
                          className="w-2.5 h-2.5 rounded-full border border-white/40 shrink-0"
                          style={{ backgroundColor: c.hex }}
                        />
                        <span>{c.name}</span>
                      </button>
                    );
                  })}

                  <button
                    type="button"
                    onClick={() => setNewColorSelection('__custom')}
                    className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
                      newColorSelection === '__custom'
                        ? 'border-oxblood-700 bg-oxblood-700 text-white shadow-xs'
                        : 'border-stone-200 bg-white text-stone-800 hover:border-stone-400'
                    }`}
                  >
                    + Custom Color
                  </button>
                </div>

                {newColorSelection === '__custom' && (
                  <div className="mt-3">
                    <input
                      type="text"
                      placeholder="e.g. Dusty Rose, Royal Mauve, Coral Reef"
                      value={customColorInput}
                      onChange={(e) => setCustomColorInput(e.target.value)}
                      className="w-full max-w-sm px-3.5 py-2 bg-white border border-stone-300 rounded text-stone-900"
                    />
                  </div>
                )}
              </div>

              {/* Sizes Selection for this Color */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-700 mb-2">
                  Select Sizes to Stock for this Color:
                </label>
                <div className="flex flex-wrap gap-2">
                  {getAvailableCategorySizes().map((size) => {
                    const isChecked = newColorSelectedSizes.includes(size);
                    return (
                      <button
                        key={size}
                        type="button"
                        onClick={() => {
                          if (isChecked) {
                            setNewColorSelectedSizes(newColorSelectedSizes.filter((s) => s !== size));
                          } else {
                            setNewColorSelectedSizes([...newColorSelectedSizes, size]);
                          }
                        }}
                        className={`px-3.5 py-1.5 rounded-lg border text-xs font-bold transition-all ${
                          isChecked
                            ? 'bg-stone-900 text-white border-stone-900 shadow-xs'
                            : 'bg-white text-stone-600 border-stone-200 hover:border-stone-400'
                        }`}
                      >
                        {size}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Initial stock per size */}
              <div className="flex items-center gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-700 mb-1">
                    Initial Stock per Size:
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={newColorDefaultStock}
                    onChange={(e) => setNewColorDefaultStock(e.target.value)}
                    className="w-24 px-3 py-1.5 bg-white border border-stone-300 rounded text-center font-bold text-stone-900"
                  />
                </div>

                <div className="pt-5">
                  <button
                    type="button"
                    onClick={handleAddNewColor}
                    className="px-5 py-2 bg-stone-900 hover:bg-oxblood-700 text-white font-bold rounded-lg text-xs uppercase tracking-wider transition-colors shadow-xs"
                  >
                    Add This Color
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* COLOR-GROUPED VARIANTS LIST */}
          <div className="space-y-4">
            {activeColorNames.map((colorName) => {
              const clean = colorName.toLowerCase().trim();
              const hex = COLOR_SWATCH_MAP[clean] || '#6B1724';
              const colorVariants = variants.filter((v) => v.colorName === colorName);
              const colorStock = colorVariants.reduce((sum, v) => sum + (v.stockQuantity || 0), 0);

              return (
                <div
                  key={colorName}
                  className="border border-stone-200 rounded-xl overflow-hidden bg-white shadow-xs"
                >
                  {/* Color Header */}
                  <div className="p-4 bg-sand-50/80 border-b border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span
                        className="w-4 h-4 rounded-full border border-stone-300 shadow-xs shrink-0"
                        style={{ backgroundColor: hex }}
                      />
                      <div>
                        <h4 className="font-serif font-bold text-sm text-stone-900">
                          {colorName}
                        </h4>
                        <div className="text-[11px] text-stone-500">
                          {colorVariants.length} {colorVariants.length === 1 ? 'size' : 'sizes'} •{' '}
                          <strong className={colorStock > 0 ? 'text-emerald-700' : 'text-red-700'}>
                            {colorStock} total units
                          </strong>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Quick Zero Stock */}
                      {colorStock > 0 && (
                        <button
                          type="button"
                          onClick={() => handleMarkColorOutOfStock(colorName)}
                          className="px-2.5 py-1 text-[11px] font-semibold text-stone-600 hover:text-stone-900 bg-white border border-stone-200 hover:border-stone-300 rounded-lg transition-colors"
                          title="Set stock of all sizes to 0"
                        >
                          Mark Sold Out
                        </button>
                      )}

                      {/* Add Size to this Color */}
                      <button
                        type="button"
                        onClick={() => {
                          setAddingSizeForColor(addingSizeForColor === colorName ? null : colorName);
                        }}
                        className="px-2.5 py-1 text-[11px] font-semibold text-oxblood-700 hover:text-white bg-white hover:bg-oxblood-700 border border-oxblood-700/40 rounded-lg transition-colors flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Add Size</span>
                      </button>

                      {/* Remove Color Completely */}
                      <button
                        type="button"
                        onClick={() => handlePromptRemoveColor(colorName)}
                        className="px-2.5 py-1 text-[11px] font-semibold text-red-600 hover:text-white bg-white hover:bg-red-600 border border-red-200 hover:border-red-600 rounded-lg transition-colors flex items-center gap-1"
                        title="Delete this color completely from the product"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Remove Color</span>
                      </button>
                    </div>
                  </div>

                  {/* Inline Add Size Form for this Color */}
                  {addingSizeForColor === colorName && (
                    <div className="p-3 bg-stone-50 border-b border-stone-200 flex flex-wrap items-center gap-3 animate-fade-in">
                      <span className="text-[11px] font-bold uppercase text-stone-700">
                        Add Size to {colorName}:
                      </span>
                      <select
                        value={inlineNewSize}
                        onChange={(e) => setInlineNewSize(e.target.value)}
                        className="px-2.5 py-1 bg-white border border-stone-300 rounded font-semibold text-stone-900"
                      >
                        {getAvailableCategorySizes().map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>

                      <div className="flex items-center gap-1.5">
                        <span className="text-stone-500">Qty:</span>
                        <input
                          type="number"
                          min="0"
                          value={inlineNewQty}
                          onChange={(e) => setInlineNewQty(e.target.value)}
                          className="w-14 px-2 py-1 bg-white border border-stone-300 rounded text-center font-bold"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={() => handleAddSizeToExistingColor(colorName)}
                        className="px-3 py-1 bg-stone-900 hover:bg-oxblood text-white rounded text-xs font-bold uppercase tracking-wider"
                      >
                        Save Size
                      </button>

                      <button
                        type="button"
                        onClick={() => setAddingSizeForColor(null)}
                        className="text-stone-400 hover:text-stone-700"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                  {/* Sizes Rows */}
                  <div className="divide-y divide-stone-100">
                    {colorVariants.map((v) => (
                      <div
                        key={v.id}
                        className="p-3.5 flex items-center justify-between hover:bg-sand-50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <span className="px-2.5 py-1 bg-stone-100 border border-stone-200 rounded font-bold text-xs text-stone-900">
                            {v.size}
                          </span>
                          <span className="font-mono text-[11px] text-stone-400 hidden sm:inline">
                            {v.sku}
                          </span>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleUpdateStock(v.id, (v.stockQuantity || 0) - 1)}
                              className="w-7 h-7 flex items-center justify-center bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-md font-bold"
                            >
                              <Minus className="w-3 h-3" />
                            </button>

                            <input
                              type="number"
                              min="0"
                              value={v.stockQuantity}
                              onChange={(e) => handleUpdateStock(v.id, parseInt(e.target.value) || 0)}
                              className="w-16 px-2 py-1 text-center font-bold bg-white text-stone-950 border border-stone-300 rounded"
                            />

                            <button
                              type="button"
                              onClick={() => handleUpdateStock(v.id, (v.stockQuantity || 0) + 1)}
                              className="w-7 h-7 flex items-center justify-center bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-md font-bold"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>

                          <button
                            type="button"
                            onClick={() => handlePromptRemoveVariant(v)}
                            className="p-1.5 text-stone-400 hover:text-red-600 rounded transition-colors"
                            title="Remove this size"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Save CTA */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={saving}
            className="px-8 py-3.5 bg-stone-900 hover:bg-oxblood-700 text-white font-bold uppercase tracking-widest rounded-lg transition-colors flex items-center gap-2 shadow-sm disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Updating Product...' : 'Save Changes'}</span>
          </button>
        </div>

      </form>

      {/* ======================================================== */}
      {/* BESPOKE LUXURY CONFIRMATION & ALERT MODALS */}
      {/* ======================================================== */}
      {/* 1. Remove Color Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!colorPendingDeletion}
        onClose={() => setColorPendingDeletion(null)}
        onConfirm={() => {
          if (colorPendingDeletion) {
            setVariants((prev) => prev.filter((v) => v.colorName !== colorPendingDeletion));
            setFeedback(`Removed color "${colorPendingDeletion}". Remember to click "Save Changes" to save.`);
            setColorPendingDeletion(null);
          }
        }}
        title={`Remove "${colorPendingDeletion}"?`}
        description={`Are you sure you want to remove the color "${colorPendingDeletion}" and all of its size units from this product?\n\nOnce saved, customers on the storefront will only see the remaining active colors.`}
        confirmLabel="Yes, Remove Color"
        cancelLabel="Keep Color"
        variant="danger"
      />

      {/* 2. Remove Single Variant Size Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!variantPendingDeletion}
        onClose={() => setVariantPendingDeletion(null)}
        onConfirm={() => {
          if (variantPendingDeletion) {
            setVariants((prev) => prev.filter((v) => v.id !== variantPendingDeletion.id));
            setFeedback(`Removed size unit "${variantPendingDeletion.label}".`);
            setVariantPendingDeletion(null);
          }
        }}
        title="Remove Size Unit?"
        description={`Are you sure you want to remove ${variantPendingDeletion?.label || 'this size unit'} from inventory?`}
        confirmLabel="Remove Size"
        cancelLabel="Keep Size"
        variant="danger"
      />

      {/* 3. General Alert & Validation Dialog */}
      <ConfirmDialog
        isOpen={alertDialog.isOpen}
        onClose={() => setAlertDialog((prev) => ({ ...prev, isOpen: false }))}
        title={alertDialog.title}
        description={alertDialog.description}
        confirmLabel="Got It"
        variant={alertDialog.variant}
      />

    </div>
  );
}
