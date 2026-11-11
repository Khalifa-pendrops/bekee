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
  ArrowRight,
  X
} from 'lucide-react';
import { db } from '@/lib/db';
import { formatKoboToNaira } from '@/lib/utils';
import { Order } from '@/types';
import { AdminPagination } from '@/components/admin/AdminPagination';

export const dynamic = 'force-dynamic';

interface AdminOrdersPageProps {
  searchParams?: {
    fulfillment?: string;
    payment?: string;
    search?: string;
    page?: string;
  };
}

export default async function AdminOrdersPage({
  searchParams = {},
}: AdminOrdersPageProps) {
  const fulfillment = searchParams.fulfillment;
  const payment = searchParams.payment;
  const search = searchParams.search;

  const allOrders = await db.getOrders({
    fulfillmentStatus: fulfillment,
    paymentStatus: payment,
    search: search,
  });

  // Pagination parameters
  const pageSize = 10;
  const totalItems = allOrders.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const requestedPage = parseInt(searchParams.page || '1', 10);
  const currentPage = Math.max(1, Math.min(requestedPage, totalPages));

  const startIndex = (currentPage - 1) * pageSize;
  const paginatedOrders = allOrders.slice(startIndex, startIndex + pageSize);

  // Helper to build URL with persistent filters
  const makeFilterUrl = (newParams: Record<string, string | undefined>) => {
    const p = new URLSearchParams();
    const merged = { ...searchParams, page: '1', ...newParams };
    Object.entries(merged).forEach(([k, v]) => {
      if (v) p.set(k, v);
    });
    const qs = p.toString();
    return `/admin/orders${qs ? `?${qs}` : ''}`;
  };

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

        <Link
          href="/admin/offline-sale"
          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-amber-500/20 text-amber-900 border border-amber-500/30 hover:bg-amber-500/30 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors self-start sm:self-auto"
        >
          <span>+ Record Walk-in / WhatsApp Sale</span>
        </Link>
      </div>

      {/* Search and Filters Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-stone-200 shadow-sm">
        
        {/* Search Input Form */}
        <form method="GET" action="/admin/orders" className="relative flex-1">
          {fulfillment && (
            <input type="hidden" name="fulfillment" value={fulfillment} />
          )}
          {payment && (
            <input type="hidden" name="payment" value={payment} />
          )}
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
          <input
            type="text"
            name="search"
            defaultValue={search || ''}
            placeholder="Search by order number (e.g. ARU-...), customer name, or phone..."
            className="w-full pl-10 pr-10 py-2 bg-stone-50 border border-stone-200 rounded-lg text-xs text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-oxblood/20 focus:border-oxblood transition-all"
          />
          {search && (
            <Link
              href={makeFilterUrl({ search: undefined })}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-stone-400 hover:text-stone-700"
              title="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </Link>
          )}
        </form>

        {/* Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <Link
            href={makeFilterUrl({ fulfillment: undefined, payment: undefined })}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              !fulfillment && !payment
                ? 'bg-stone-900 text-white shadow-xs'
                : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
            }`}
          >
            All Orders
          </Link>

          <Link
            href={makeFilterUrl({ fulfillment: 'unfulfilled', payment: undefined })}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              fulfillment === 'unfulfilled'
                ? 'bg-oxblood-700 text-white shadow-xs'
                : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
            }`}
          >
            Awaiting Packing
          </Link>

          <Link
            href={makeFilterUrl({ fulfillment: 'dispatched', payment: undefined })}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              fulfillment === 'dispatched'
                ? 'bg-blue-700 text-white shadow-xs'
                : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
            }`}
          >
            In Transit
          </Link>

          <Link
            href={makeFilterUrl({ fulfillment: 'delivered', payment: undefined })}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              fulfillment === 'delivered'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
            }`}
          >
            Delivered
          </Link>

          <Link
            href={makeFilterUrl({ fulfillment: undefined, payment: 'inventory_conflict_quarantined' })}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              payment === 'inventory_conflict_quarantined'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
            }`}
          >
            Quarantined
          </Link>
        </div>
      </div>

      {/* Orders List Card */}
      <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
        
        {/* Table Top Status Bar */}
        <div className="p-3.5 bg-stone-50 border-b border-stone-200 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="font-semibold text-stone-700">
            Total Orders: <span className="font-bold text-stone-900">{totalItems}</span>
          </div>

          <div className="text-[11px] text-stone-500 font-mono">
            Page {currentPage} of {totalPages}
          </div>
        </div>

        {paginatedOrders.length === 0 ? (
          <div className="p-12 text-center text-stone-500 space-y-3">
            <p className="text-sm font-medium text-stone-800">No orders found matching this filter criteria.</p>
            <p className="text-xs text-stone-500">Try searching with a different name, order number, or reset filters.</p>
            <Link
              href="/admin/orders"
              className="inline-block px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-lg text-xs font-semibold"
            >
              Reset Filters
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-stone-100">
            {paginatedOrders.map((order) => {
              const customerWhatsApp = (order.customerPhone || '').replace(/\D/g, '');
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
                      className="px-4 py-2 bg-stone-900 hover:bg-oxblood-700 text-white rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors flex items-center gap-1 shadow-xs"
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

        {/* Pagination Controls */}
        <AdminPagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          pageSize={pageSize}
          itemName="orders"
          baseUrl="/admin/orders"
          searchParams={searchParams}
        />

      </div>

    </div>
  );
}
