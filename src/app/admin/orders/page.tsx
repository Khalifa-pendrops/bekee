import React from 'react';
import Link from 'next/link';
import { 
  Package, 
  Search, 
  MessageCircle, 
  Truck, 
  Store, 
  CheckCircle2, 
  Clock, 
  AlertTriangle,
  ArrowRight
} from 'lucide-react';
import { db } from '@/lib/db';
import { formatKoboToNaira } from '@/lib/utils';
import { Order } from '@/types';

export const dynamic = 'force-dynamic';

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: { fulfillment?: string; payment?: string; search?: string };
}) {
  const allOrders = await db.getOrders({
    fulfillmentStatus: searchParams.fulfillment,
    paymentStatus: searchParams.payment,
    search: searchParams.search,
  });

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200">
        <div>
          <h1 className="font-serif text-2xl md:text-3xl font-bold text-stone-900">
            Orders & Shipments
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            Track customer payments, prepare packaging in Aba, and issue waybill tracking numbers.
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 pb-2 border-b border-stone-200 text-xs">
        <Link
          href="/admin/orders"
          className={`px-3 py-1.5 rounded-full font-medium transition-colors ${
            !searchParams.fulfillment && !searchParams.payment
              ? 'bg-stone-900 text-white'
              : 'bg-stone-200 text-stone-700 hover:bg-stone-300'
          }`}
        >
          All Orders
        </Link>

        <Link
          href="/admin/orders?fulfillment=unfulfilled"
          className={`px-3 py-1.5 rounded-full font-medium transition-colors ${
            searchParams.fulfillment === 'unfulfilled'
              ? 'bg-oxblood-700 text-white'
              : 'bg-stone-200 text-stone-700 hover:bg-stone-300'
          }`}
        >
          Awaiting Packing
        </Link>

        <Link
          href="/admin/orders?fulfillment=dispatched"
          className={`px-3 py-1.5 rounded-full font-medium transition-colors ${
            searchParams.fulfillment === 'dispatched'
              ? 'bg-blue-700 text-white'
              : 'bg-stone-200 text-stone-700 hover:bg-stone-300'
          }`}
        >
          Dispatched / In Transit
        </Link>

        <Link
          href="/admin/orders?fulfillment=delivered"
          className={`px-3 py-1.5 rounded-full font-medium transition-colors ${
            searchParams.fulfillment === 'delivered'
              ? 'bg-emerald-700 text-white'
              : 'bg-stone-200 text-stone-700 hover:bg-stone-300'
          }`}
        >
          Completed / Delivered
        </Link>

        <Link
          href="/admin/orders?payment=inventory_conflict_quarantined"
          className={`px-3 py-1.5 rounded-full font-medium transition-colors ${
            searchParams.payment === 'inventory_conflict_quarantined'
              ? 'bg-amber-600 text-white'
              : 'bg-stone-200 text-stone-700 hover:bg-stone-300'
          }`}
        >
          Quarantined Holds
        </Link>
      </div>

      {/* Orders List Card */}
      <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
        {allOrders.length === 0 ? (
          <div className="p-12 text-center text-stone-500 text-xs">
            No orders found matching this filter criteria.
          </div>
        ) : (
          <div className="divide-y divide-stone-100">
            {allOrders.map((order) => {
              const customerWhatsApp = order.customerPhone.replace(/\D/g, '');
              const waUrl = `https://wa.me/${customerWhatsApp}?text=${encodeURIComponent(
                `Hello ${order.customerName}, this is ARUBEKEE COLLECTION regarding your order ${order.orderNumber}...`
              )}`;

              return (
                <div
                  key={order.id}
                  className="p-4 sm:p-5 hover:bg-stone-50/80 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
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
                      <span className="text-[10px] text-stone-400 font-mono">
                        {new Date(order.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <div className="text-xs text-stone-900 font-medium">
                      {order.customerName} • <span className="text-stone-500">{order.customerPhone}</span>
                    </div>

                    <div className="text-xs text-stone-600">
                      {order.items.length} item(s): {order.items.map((i) => `${i.productName} (${i.size})`).join(', ')}
                    </div>

                    <div className="text-[11px] text-stone-500">
                      Fulfilment: <strong className="text-stone-800">{order.deliveryType === 'aba_pickup' ? 'Aba Boutique Pickup' : `Waybill to ${order.shippingAddress?.city || ''}, ${order.shippingAddress?.state || ''}`}</strong> • Total: <strong className="text-stone-900">{formatKoboToNaira(order.totalKobo)}</strong>
                    </div>

                    {order.trackingNumber && (
                      <div className="text-[11px] font-mono text-blue-700 bg-blue-50 px-2 py-0.5 rounded inline-block">
                        Waybill: {order.carrierName} - {order.trackingNumber}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                    {order.customerPhone && order.customerPhone !== 'N/A' && (
                      <a
                        href={waUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
                        title="Chat with Customer on WhatsApp"
                      >
                        <MessageCircle className="w-4 h-4" />
                        <span className="hidden sm:inline">WhatsApp</span>
                      </a>
                    )}

                    <Link
                      href={`/admin/orders/${order.id}`}
                      className="px-4 py-2 bg-stone-900 hover:bg-oxblood-700 text-white rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors flex items-center gap-1"
                    >
                      <span>Fulfill</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}

