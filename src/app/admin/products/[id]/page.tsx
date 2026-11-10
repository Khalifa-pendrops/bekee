'use client';

import React, { useState, useEffect } from 'react';
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
  Sparkles
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

