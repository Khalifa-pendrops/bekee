'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Layers, 
  Search, 
  AlertTriangle, 
  CheckCircle2, 
  RotateCcw, 
  History, 
  Plus, 
  Minus,
  Edit2,
  X
} from 'lucide-react';
import { formatKoboToNaira } from '@/lib/utils';
import { Product, ProductVariant, InventoryMovement } from '@/types';

export default function AdminStockPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Adjustment Modal
  const [selectedVariant, setSelectedVariant] = useState<{
    variant: ProductVariant;
    productName: string;
  } | null>(null);
  const [newStockInput, setNewStockInput] = useState<number>(0);
  const [adjustmentReason, setAdjustmentReason] = useState<
    'restock' | 'damaged_writeoff' | 'customer_return_restock' | 'inventory_audit'
  >('restock');
  const [staffName, setStaffName] = useState('Store Manager');
  const [adjustmentNotes, setAdjustmentNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products');
      const data = await res.json();
      if (Array.isArray(data)) setProducts(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleOpenAdjustment = (product: Product, variant: ProductVariant) => {
    setSelectedVariant({ variant, productName: product.name });
    setNewStockInput(variant.stockQuantity);
    setAdjustmentNotes('');
    setFeedback(null);
  };

  const handleSaveAdjustment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVariant) return;

    setIsSubmitting(true);
    setFeedback(null);

    try {
      const res = await fetch('/api/admin/stock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          variantId: selectedVariant.variant.id,
          newQuantity: newStockInput,
          reason: adjustmentReason,
          staffName,
          notes: adjustmentNotes,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to adjust stock');

      // Update local state
      setProducts((prev) =>
        prev.map((p) => ({
          ...p,
          variants: p.variants.map((v) =>
            v.id === selectedVariant.variant.id ? { ...v, stockQuantity: newStockInput } : v
          ),
        }))
      );

      setSelectedVariant(null);
      setFeedback('Inventory updated successfully!');
      setTimeout(() => setFeedback(null), 3000);
    } catch (err: any) {
      console.error(err);
      setFeedback(`Error: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Flattened list of all variants
  const allVariantRows: { product: Product; variant: ProductVariant }[] = [];
  products.forEach((p) => {
    p.variants.forEach((v) => {
      if (
        !search ||
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        v.sku.toLowerCase().includes(search.toLowerCase()) ||
        v.colorName.toLowerCase().includes(search.toLowerCase())
      ) {
        allVariantRows.push({ product: p, variant: v });
      }
    });
  });

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200">
        <div>
          <h1 className="font-serif text-2xl md:text-3xl font-bold text-stone-900 flex items-center gap-2">
            <Layers className="w-6 h-6 text-oxblood-700" />
            Stock & Inventory Audits
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            Real-time stock balance across Aba workshop, boutique showroom, and online reservations.
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-stone-400" />
          <input
            type="text"
            placeholder="Search SKU or name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-2 text-xs bg-white border border-stone-300 rounded-lg focus:outline-none focus:border-stone-900"
          />
        </div>
      </div>

      {feedback && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 font-medium">
          {feedback}
        </div>
      )}

      {/* Stock Table Card */}
      <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
        <div className="p-4 bg-stone-50 border-b border-stone-200 text-xs font-semibold text-stone-700 flex justify-between">
          <span>Tracked Variant Units ({allVariantRows.length})</span>
          <span className="text-[11px] text-stone-500 font-normal">Tap "Adjust" to record physical restock or audit</span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-xs text-stone-500 font-medium uppercase tracking-wider">
            Loading Stock Inventory...
          </div>
        ) : allVariantRows.length === 0 ? (
          <div className="p-12 text-center text-xs text-stone-500">
            No variants match your search filter.
          </div>
        ) : (
          <div className="divide-y divide-stone-100">
            {allVariantRows.map(({ product, variant }) => {
              const isLow = variant.stockQuantity <= variant.lowStockThreshold;
              return (
                <div
                  key={variant.id}
                  className="p-4 hover:bg-stone-50/80 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="min-w-0">
                    <div className="font-semibold text-stone-900 truncate">
                      {product.name}
                    </div>
                    <div className="text-stone-500 font-mono text-[11px] mt-0.5">
                      {variant.sku}
                    </div>
                    <div className="text-stone-700 mt-1 flex items-center gap-2">
                      <span className="px-2 py-0.5 bg-sand-100 rounded text-[11px] font-medium">
                        {variant.colorName}
                      </span>
                      <span className="px-2 py-0.5 bg-stone-200 rounded text-[11px] font-bold">
                        {variant.size}
                      </span>
                      <span className="text-stone-500">
                        {formatKoboToNaira(variant.salePriceKobo || variant.priceKobo)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 shrink-0">
                    <div className="text-right">
                      <div className={`font-serif text-base font-bold ${isLow ? 'text-red-700' : 'text-stone-900'}`}>
                        {variant.stockQuantity} <span className="text-xs font-sans font-normal text-stone-500">units</span>
                      </div>
                      {isLow && (
                        <div className="text-[10px] text-red-600 font-semibold uppercase flex items-center gap-1 justify-end">
                          <AlertTriangle className="w-3 h-3" /> Low Stock
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => handleOpenAdjustment(product, variant)}
                      className="px-3 py-1.5 bg-stone-900 hover:bg-oxblood-700 text-white rounded text-xs font-semibold uppercase tracking-wider transition-colors flex items-center gap-1"
                    >
                      <Edit2 className="w-3 h-3" />
                      <span>Adjust</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ADJUSTMENT MODAL */}
      {selectedVariant && (
        <div className="fixed inset-0 z-50 bg-stone-900/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-stone-200 max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <div>
                <h3 className="font-serif text-lg font-bold text-stone-900">
                  Stock Balance Adjustment
                </h3>
                <p className="text-xs text-stone-500">{selectedVariant.productName}</p>
              </div>
              <button
                onClick={() => setSelectedVariant(null)}
                className="p-1 text-stone-400 hover:text-stone-900"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAdjustment} className="space-y-4 text-xs">
              <div className="p-3 bg-sand-50 rounded-lg border border-sand-200">
                <div className="font-mono text-[11px] text-stone-500">{selectedVariant.variant.sku}</div>
                <div className="font-semibold text-stone-900 mt-0.5">
                  {selectedVariant.variant.colorName} • {selectedVariant.variant.size}
                </div>
                <div className="text-stone-600 mt-1">
                  Current Physical Stock: <strong className="text-stone-900 font-bold">{selectedVariant.variant.stockQuantity}</strong>
                </div>
              </div>

              <div>
                <label className="block font-semibold uppercase tracking-wider text-stone-700 mb-1">
                  New Physical Stock Count: <span className="text-oxblood-700">*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  value={newStockInput}
                  onChange={(e) => setNewStockInput(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 text-sm font-bold bg-white border border-stone-300 rounded focus:outline-none focus:border-stone-900 text-stone-900"
                />
              </div>

              <div>
                <label className="block font-semibold uppercase tracking-wider text-stone-700 mb-1">
                  Mandatory Audit Reason: <span className="text-oxblood-700">*</span>
                </label>
                <select
                  value={adjustmentReason}
                  onChange={(e) => setAdjustmentReason(e.target.value as any)}
                  className="w-full px-3 py-2 bg-white border border-stone-300 rounded font-medium text-stone-900"
                >
                  <option value="restock">Aba Workshop Batch Restock (Fabric Cut & Sewn)</option>
                  <option value="damaged_writeoff">Damaged / Fabric Defect Write-off</option>
                  <option value="customer_return_restock">Customer Return Restocked to Shelf</option>
                  <option value="inventory_audit">Monthly Physical Shelf Count Discrepancy</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold uppercase tracking-wider text-stone-700 mb-1">
                  Staff Member Authorizing: <span className="text-oxblood-700">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={staffName}
                  onChange={(e) => setStaffName(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-stone-300 rounded font-medium text-stone-900"
                />
              </div>

              <div>
                <label className="block font-semibold uppercase tracking-wider text-stone-700 mb-1">
                  Internal Notes (Optional):
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Added 5 units of emerald crepe from tailoring department..."
                  value={adjustmentNotes}
                  onChange={(e) => setAdjustmentNotes(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white border border-stone-300 rounded text-stone-900"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedVariant(null)}
                  className="flex-1 py-2.5 border border-stone-300 text-stone-700 font-semibold uppercase rounded hover:bg-stone-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-2.5 bg-stone-900 hover:bg-oxblood-700 text-white font-bold uppercase rounded transition-colors"
                >
                  {isSubmitting ? 'Saving...' : 'Confirm Audit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

