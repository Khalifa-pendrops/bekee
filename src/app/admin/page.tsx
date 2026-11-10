import React from 'react';
import Link from 'next/link';
import { 
  Package, 
  AlertTriangle, 
  TrendingUp, 
  PlusCircle, 
  Zap, 
  Clock, 
  CheckCircle2, 
  ArrowRight, 
  MessageCircle, 
  HelpCircle,
  Truck,
  Layers,
  Store,
  Sparkles
} from 'lucide-react';
import { db } from '@/lib/db';
import { formatKoboToNaira } from '@/lib/utils';
import { Order, Product } from '@/types';

export const dynamic = 'force-dynamic';

export default async function AdminHomePage() {
  const [allOrders, allProducts, quoteRequests, storeSettings] = await Promise.all([
    db.getOrders(),
    db.getProducts(),
    db.getDeliveryQuoteRequests(),
    db.getStoreSettings(),
  ]);

  // Operational metrics
  const pendingFulfillmentOrders = allOrders.filter(
    (o) => o.paymentStatus === 'paid' && o.fulfillmentStatus === 'unfulfilled'
  );

  const readyToDispatchOrders = allOrders.filter(
    (o) => o.fulfillmentStatus === 'ready_for_pickup' || o.fulfillmentStatus === 'dispatched'
  );

  const quarantinedOrders = allOrders.filter(
    (o) => o.paymentStatus === 'inventory_conflict_quarantined'
  );

  // Low stock variants calculation
  const lowStockItems: { product: Product; variantName: string; stock: number; sku: string }[] = [];
  allProducts.forEach((p) => {
    p.variants.forEach((v) => {
      if (v.stockQuantity <= v.lowStockThreshold) {
        lowStockItems.push({
          product: p,
          variantName: `${v.colorName} • ${v.size}`,
          stock: v.stockQuantity,
          sku: v.sku,
        });
      }
    });
  });

  // Calculate gross revenue (paid orders)
  const paidOrders = allOrders.filter((o) => o.paymentStatus === 'paid');
  const totalRevenueKobo = paidOrders.reduce((sum, o) => sum + o.totalKobo, 0);

  // Today's sales
  const todayStr = new Date().toISOString().split('T')[0];
  const todayPaidOrders = paidOrders.filter((o) => o.paidAt && o.paidAt.startsWith(todayStr));
  const todayRevenueKobo = todayPaidOrders.reduce((sum, o) => sum + o.totalKobo, 0);

  return (
    <div className="space-y-6 md:space-y-8">
      
      {/* Welcome Banner for the Owner */}
      <div className="bg-stone-900 text-white rounded-xl p-5 md:p-8 shadow-sm border border-stone-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-sand-200/20 text-sand-300 text-[11px] font-medium tracking-wide uppercase mb-2">
              <Store className="w-3.5 h-3.5 text-amber-400" />
              {storeSettings.storeName} • Aba, Abia State
            </div>
            <h1 className="font-serif text-2xl md:text-3xl font-bold tracking-tight text-white">
              Welcome back, Store Manager
            </h1>
            <p className="text-stone-300 text-xs md:text-sm mt-1">
              Here is your daily operational briefing for your Aba boutique and nationwide dispatch orders.
            </p>
          </div>

          {/* Top Quick Action Buttons */}
          <div className="flex items-center gap-2.5 shrink-0">
            <Link
              href="/admin/offline-sale"
              className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-stone-950 text-xs font-bold uppercase tracking-wider rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <Zap className="w-4 h-4" />
              <span>Record Walk-in / WhatsApp</span>
            </Link>

            <Link
              href="/admin/products/new"
              className="px-4 py-2.5 bg-oxblood-700 hover:bg-oxblood-800 text-white text-xs font-bold uppercase tracking-wider rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <PlusCircle className="w-4 h-4" />
              <span>+ Add Product</span>
            </Link>
          </div>
        </div>
      </div>

      {/* URGENT OPERATIONAL METRICS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        
        {/* Metric 1: Orders Awaiting Packaging */}
        <Link
          href="/admin/orders?fulfillment=unfulfilled"
          className="bg-white p-4 md:p-5 rounded-xl border border-stone-200 hover:border-oxblood-700 transition-all shadow-sm group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-500">
              Awaiting Packing
            </span>
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
              pendingFulfillmentOrders.length > 0 ? 'bg-amber-100 text-amber-700' : 'bg-stone-100 text-stone-400'
            }`}>
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl md:text-3xl font-bold font-serif text-stone-900 group-hover:text-oxblood-700">
            {pendingFulfillmentOrders.length}
          </div>
          <p className="text-[11px] text-stone-500 mt-1">
            Paid orders ready to be packaged in Aba
          </p>
        </Link>

        {/* Metric 2: Ready to Dispatch */}
        <Link
          href="/admin/orders?fulfillment=dispatched"
          className="bg-white p-4 md:p-5 rounded-xl border border-stone-200 hover:border-oxblood-700 transition-all shadow-sm group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-500">
              Dispatched / In Transit
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
              <Truck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl md:text-3xl font-bold font-serif text-stone-900 group-hover:text-oxblood-700">
            {readyToDispatchOrders.length}
          </div>
          <p className="text-[11px] text-stone-500 mt-1">
            Waybill parcels currently with couriers
          </p>
        </Link>

        {/* Metric 3: Low Stock Warnings */}
        <Link
          href="/admin/stock"
          className="bg-white p-4 md:p-5 rounded-xl border border-stone-200 hover:border-oxblood-700 transition-all shadow-sm group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-500">
              Low Stock Alerts
            </span>
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
              lowStockItems.length > 0 ? 'bg-red-100 text-red-700 animate-pulse' : 'bg-stone-100 text-stone-400'
            }`}>
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl md:text-3xl font-bold font-serif text-stone-900 group-hover:text-oxblood-700">
            {lowStockItems.length}
          </div>
          <p className="text-[11px] text-stone-500 mt-1">
            Variants at or below restock threshold
          </p>
        </Link>

        {/* Metric 4: Today's Revenue */}
        <div className="bg-white p-4 md:p-5 rounded-xl border border-stone-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-500">
              Today's Confirmed Sales
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl md:text-2xl font-bold font-serif text-emerald-800">
            {formatKoboToNaira(todayRevenueKobo)}
          </div>
          <p className="text-[11px] text-stone-500 mt-1">
            All-time: <strong className="text-stone-800">{formatKoboToNaira(totalRevenueKobo)}</strong>
          </p>
        </div>

      </div>

      {/* Quarantined Conflict Notice (if any late payments happened) */}
      {quarantinedOrders.length > 0 && (
        <div className="bg-amber-50 border border-amber-300 rounded-xl p-4 md:p-5 flex items-start gap-3 shadow-sm">
          <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
          <div className="flex-1 text-xs text-amber-900 leading-normal">
            <strong className="text-amber-950 font-semibold block text-sm mb-0.5">
              Attention Required: {quarantinedOrders.length} Quarantined Late Payment(s)
            </strong>
            A customer paid after their 15-minute reservation expired, and one or more items may need restocking or an owner-approved refund.
            <div className="mt-2">
              <Link
                href="/admin/orders?payment=inventory_conflict_quarantined"
                className="inline-flex items-center gap-1 font-semibold text-oxblood-800 underline hover:text-stone-950"
              >
                Review Quarantined Orders <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* MAIN TWO-COLUMN DASHBOARD CONTENT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN (8 cols): Orders Awaiting Packaging / Recent Orders */}
        <div className="lg:col-span-8 space-y-6">
          
          <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
            <div className="p-4 md:p-5 border-b border-stone-200 flex items-center justify-between">
              <div>
                <h2 className="font-serif text-lg text-stone-900 font-bold">
                  Recent Orders
                </h2>
                <p className="text-xs text-stone-500">Live feed of online checkout & offline Aba boutique sales</p>
              </div>

              <Link
                href="/admin/orders"
                className="text-xs font-semibold text-oxblood-700 hover:text-stone-900 flex items-center gap-1"
              >
                <span>View All</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {allOrders.length === 0 ? (
              <div className="p-8 text-center text-stone-500 text-xs">
                No orders recorded yet. Walk-in sales or online checkouts will appear here.
              </div>
            ) : (
              <div className="divide-y divide-stone-100">
                {allOrders.slice(0, 5).map((order) => {
                  const customerWhatsApp = order.customerPhone.replace(/\D/g, '');
                  const waUrl = `https://wa.me/${customerWhatsApp}?text=${encodeURIComponent(
                    `Hello ${order.customerName}, regarding your ARUBEKEE COLLECTION order ${order.orderNumber}...`
                  )}`;

                  return (
                    <div key={order.id} className="p-4 hover:bg-stone-50/80 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-mono text-xs font-bold text-stone-900">
                            {order.orderNumber}
                          </span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                            order.paymentStatus === 'paid'
                              ? 'bg-emerald-100 text-emerald-800'
                              : order.paymentStatus === 'pending'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {order.paymentStatus}
                          </span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                            order.fulfillmentStatus === 'delivered'
                              ? 'bg-emerald-100 text-emerald-800'
                              : order.fulfillmentStatus === 'dispatched'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-stone-100 text-stone-700'
                          }`}>
                            {order.fulfillmentStatus}
                          </span>
                        </div>

                        <div className="text-xs text-stone-700 font-medium">
                          {order.customerName} • <span className="text-stone-500">{order.customerPhone}</span>
                        </div>

                        <div className="text-[11px] text-stone-500 mt-0.5">
                          {order.items.length} item(s) • Total: <strong className="text-stone-900">{formatKoboToNaira(order.totalKobo)}</strong> • {order.deliveryType === 'aba_pickup' ? 'Aba Boutique Pickup' : `Waybill to ${order.shippingAddress?.state || 'Nigeria'}`}
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-2 shrink-0">
                        {order.customerPhone && order.customerPhone !== 'N/A' && (
                          <a
                            href={waUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg text-xs font-medium flex items-center gap-1 transition-colors"
                            title="Chat with Customer on WhatsApp"
                          >
                            <MessageCircle className="w-4 h-4" />
                            <span className="hidden sm:inline text-[11px]">WhatsApp</span>
                          </a>
                        )}

                        <Link
                          href={`/admin/orders/${order.id}`}
                          className="px-3 py-1.5 bg-stone-900 hover:bg-oxblood-700 text-white rounded-lg text-xs font-semibold tracking-wide transition-colors"
                        >
                          Manage
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Delivery Quote Requests Table */}
          {quoteRequests.length > 0 && (
            <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
              <div className="p-4 md:p-5 border-b border-stone-200 flex items-center justify-between">
                <div>
                  <h3 className="font-serif text-base text-stone-900 font-bold flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-oxblood-700" />
                    Delivery Quotes Awaiting Price ({quoteRequests.length})
                  </h3>
                  <p className="text-xs text-stone-500">Shoppers requesting custom logistics outside standard corridors</p>
                </div>
              </div>

              <div className="divide-y divide-stone-100">
                {quoteRequests.slice(0, 3).map((q) => (
                  <div key={q.id} className="p-4 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-semibold text-stone-900">{q.customerName} ({q.phone})</div>
                      <div className="text-stone-500">Destination: {q.city}, {q.state} • Landmark: {q.landmark || 'None'}</div>
                      <div className="text-stone-700 font-medium mt-0.5">Subtotal: {formatKoboToNaira(q.subtotalKobo)}</div>
                    </div>

                    <a
                      href={`https://wa.me/${q.phone.replace(/\D/g, '')}?text=${encodeURIComponent(
                        `Hello ${q.customerName}, regarding your delivery quote request to ${q.city}, ${q.state}...`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-semibold flex items-center gap-1"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>Send Quote</span>
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* RIGHT COLUMN (4 cols): Low-Stock Warnings & Owner Fast Guide */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Low Stock Watchlist */}
          <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-5">
            <h3 className="font-serif text-base text-stone-900 font-bold mb-1 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-600" />
              Low Stock Alert
            </h3>
            <p className="text-xs text-stone-500 mb-4">Items requiring replenishment in Aba workshop</p>

            {lowStockItems.length === 0 ? (
              <div className="p-4 bg-emerald-50 text-emerald-800 rounded-lg text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                All variants are currently well stocked!
              </div>
            ) : (
              <div className="space-y-3">
                {lowStockItems.slice(0, 4).map((item, idx) => (
                  <div key={idx} className="p-3 bg-red-50/60 rounded-lg border border-red-100 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-medium text-stone-900 truncate max-w-[170px]">
                        {item.product.name}
                      </div>
                      <div className="text-stone-500 text-[11px]">
                        {item.variantName}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-red-700 text-sm">
                        {item.stock} left
                      </span>
                    </div>
                  </div>
                ))}

                <Link
                  href="/admin/stock"
                  className="block text-center text-xs font-semibold text-oxblood-700 hover:underline pt-2"
                >
                  Manage All Stock Levels →
                </Link>
              </div>
            )}
          </div>

          {/* Quick Owner Guide */}
          <div className="bg-sand-100/70 rounded-xl border border-sand-300 p-5">
            <h3 className="font-serif text-base text-stone-900 font-bold mb-2 flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-oxblood-700" />
              How to Run Store from Phone
            </h3>
            <div className="space-y-2.5 text-xs text-stone-700 leading-relaxed">
              <div className="flex items-start gap-2">
                <span className="w-4 h-4 rounded-full bg-stone-900 text-white text-[10px] flex items-center justify-center shrink-0 mt-0.5">1</span>
                <span><strong>Add New Dress or Shoe:</strong> Tap "+ Add Product" at top right. Upload photos, enter price, pick sizes, publish.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-4 h-4 rounded-full bg-stone-900 text-white text-[10px] flex items-center justify-center shrink-0 mt-0.5">2</span>
                <span><strong>Aba Boutique Walk-in:</strong> Tap the gold "Record Walk-in / WhatsApp" button to deduct stock immediately without faking an online charge.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-4 h-4 rounded-full bg-stone-900 text-white text-[10px] flex items-center justify-center shrink-0 mt-0.5">3</span>
                <span><strong>Fulfill an Order:</strong> Open the order, pack the dress, enter the waybill tracking number, and tap "Mark Dispatched".</span>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}

