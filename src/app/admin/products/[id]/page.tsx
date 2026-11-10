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
  Plus
} from 'lucide-react';
import { formatKoboToNaira, parseNairaToKobo } from '@/lib/utils';
import { Product, ProductVariant } from '@/types';

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

  const [images, setImages] = useState<{ id: string; url: string; altText: string; isPrimary: boolean }[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingFiles, setIsUploadingFiles] = useState(false);

  // Status
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

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
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [productId]);

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

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return;

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
        setFeedback('Product details and inventory updated successfully!');
        setTimeout(() => setFeedback(null), 3000);
      }
    } catch (err: any) {
      setFeedback(`Error: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-12 text-center text-xs font-semibold uppercase tracking-wider text-stone-500">Loading Product Editor...</div>;
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

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200">
        <div>
          <Link
            href="/admin/products"
            className="inline-flex items-center text-xs font-semibold uppercase tracking-wider text-stone-500 hover:text-stone-900 transition-colors mb-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Back to Products List
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="font-serif text-2xl font-bold text-stone-900">
              Edit {product.name}
            </h1>
            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
              isPublished ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-200 text-stone-700'
            }`}>
              {isPublished ? 'Published' : 'Draft'}
            </span>
          </div>
        </div>

        <Link
          href={`/products/${product.slug}`}
          target="_blank"
          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold rounded-lg transition-colors"
        >
          <span>View on Store</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </Link>
      </div>

      {feedback && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-lg flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600" />
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

        {/* Variants Stock Table */}
        <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-6 space-y-4">
          <h2 className="font-serif text-base font-bold text-stone-900 flex items-center gap-2">
            <Layers className="w-4 h-4 text-oxblood-700" />
            Sellable Variant Units & Stock
          </h2>

          <div className="divide-y divide-stone-100 border border-stone-200 rounded-lg overflow-hidden">
            {variants.map((v) => (
              <div key={v.id} className="p-3.5 flex items-center justify-between hover:bg-sand-50">
                <div>
                  <div className="font-semibold text-stone-900">{v.colorName} • {v.size}</div>
                  <div className="font-mono text-[11px] text-stone-400">{v.sku}</div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-stone-500 font-medium">In Stock:</span>
                  <input
                    type="number"
                    min="0"
                    value={v.stockQuantity}
                    onChange={(e) => handleUpdateStock(v.id, parseInt(e.target.value) || 0)}
                    className="w-16 px-2.5 py-1 text-center font-bold bg-white border border-stone-300 rounded text-stone-900"
                  />
                </div>
              </div>
            ))}
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
            <span>{saving ? 'Updating...' : 'Save Changes'}</span>
          </button>
        </div>

      </form>

    </div>
  );
}

