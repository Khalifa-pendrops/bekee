'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  Package, 
  Truck, 
  CheckCircle2, 
  MapPin, 
  MessageCircle, 
  Clock, 
  AlertTriangle,
  Send,
  Printer,
  Copy,
  Check
} from 'lucide-react';
import { formatKoboToNaira } from '@/lib/utils';
import { Order } from '@/types';

export default function AdminOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  // Dispatch Form
  const [carrierName, setCarrierName] = useState('GIG Logistics');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [trackingUrl, setTrackingUrl] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [copiedSlip, setCopiedSlip] = useState(false);

  useEffect(() => {
    fetch('/api/admin/orders')
      .then((r) => r.json())
      .then((orders) => {
        const found = orders.find((o: Order) => o.id === orderId || o.orderNumber === orderId);
        if (found) {
          setOrder(found);
          if (found.carrierName) setCarrierName(found.carrierName);
          if (found.trackingNumber) setTrackingNumber(found.trackingNumber);
          if (found.trackingUrl) setTrackingUrl(found.trackingUrl);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [orderId]);

  if (loading) {
    return (
      <div className="p-12 text-center text-xs uppercase tracking-widest text-stone-500 font-semibold">
        Loading Order Details...
      </div>
    );
  }

  if (!order) {
    return (
      <div className="bg-white p-8 rounded-xl border border-stone-200 text-center space-y-4">
        <h2 className="font-serif text-xl font-bold text-stone-900">Order Not Found</h2>
        <p className="text-xs text-stone-500">The requested order reference could not be located.</p>
        <Link
          href="/admin/orders"
          className="inline-block px-4 py-2 bg-stone-900 text-white text-xs font-semibold rounded uppercase"
        >
          Return to Orders
        </Link>
      </div>
    );
  }

  const customerWhatsApp = order.customerPhone.replace(/\D/g, '');
  const waUrl = `https://wa.me/${customerWhatsApp}?text=${encodeURIComponent(
    `Hello ${order.customerName}, this is ARUBEKEE COLLECTION. Regarding your order ${order.orderNumber}...`
  )}`;

  // Handle Dispatch
  const handleMarkDispatched = async () => {
    setIsUpdating(true);
    try {
      const res = await fetch(`/api/admin/orders/${order.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'dispatch',
          carrierName,
          trackingNumber,
          trackingUrl,
          staffName: 'Store Manager',
        }),
      });
      const data = await res.json();
      if (data.success) {
        setOrder(data.order);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsUpdating(false);
    }
  };

  // Handle Deliver
  const handleMarkDelivered = async () => {
    setIsUpdating(true);
    try {
      const res = await fetch(`/api/admin/orders/${order.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'deliver',
          staffName: 'Store Manager',
        }),
      });
      const data = await res.json();
      if (data.success) {
        setOrder(data.order);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsUpdating(false);
    }
  };

  // Copy Packing Slip Text
  const handleCopyPackingSlip = () => {
    const text = `ARUBEKEE COLLECTION PACKING SLIP
Order: ${order.orderNumber}
Customer: ${order.customerName} (${order.customerPhone})
Destination: ${order.shippingAddress?.streetAddress || ''}, ${order.shippingAddress?.city || ''}, ${order.shippingAddress?.state || ''}
Landmark: ${order.shippingAddress?.landmark || 'None'}
Items:
${order.items.map((i) => `- ${i.productName} | ${i.colorName} | ${i.size} | Qty: ${i.quantity}`).join('\n')}
Total: ${formatKoboToNaira(order.totalKobo)}`;

    navigator.clipboard.writeText(text);
    setCopiedSlip(true);
    setTimeout(() => setCopiedSlip(false), 2500);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200">
        <div>
          <Link
            href="/admin/orders"
            className="inline-flex items-center text-xs font-semibold uppercase tracking-wider text-stone-500 hover:text-stone-900 transition-colors mb-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Back to Orders
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="font-serif text-2xl font-bold text-stone-900">
              Order {order.orderNumber}
            </h1>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase ${
              order.paymentStatus === 'paid'
                ? 'bg-emerald-100 text-emerald-800'
                : 'bg-amber-100 text-amber-800'
            }`}>
              {order.paymentStatus}
            </span>
          </div>
        </div>

        {/* Packing Slip Copy / Print */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyPackingSlip}
            className="px-3.5 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5"
          >
            {copiedSlip ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedSlip ? 'Slip Copied!' : 'Copy Packing Slip'}</span>
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: Items & Logistics (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Order Items Table */}
          <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
            <div className="p-4 bg-stone-50 border-b border-stone-200 font-semibold text-xs text-stone-800">
              Garments & Accessories to Pack ({order.items.length})
            </div>

            <div className="divide-y divide-stone-100">
              {order.items.map((item) => (
                <div key={item.id} className="p-4 flex items-center gap-4">
                  <div className="relative w-16 h-20 rounded bg-stone-100 shrink-0 overflow-hidden border border-stone-200">
                    {item.imageUrl && (
                      <Image
                        src={item.imageUrl}
                        alt={item.productName}
                        fill
                        className="object-cover"
                      />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-stone-900">{item.productName}</h3>
                    <div className="text-xs text-stone-500 font-mono mt-0.5">{item.sku}</div>
                    <div className="text-xs text-stone-700 mt-1">
                      Colour: <strong className="font-semibold">{item.colorName}</strong> • Size: <strong className="font-semibold">{item.size}</strong>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-xs text-stone-500">Qty: <strong className="text-stone-900">{item.quantity}</strong></div>
                    <div className="text-sm font-bold text-stone-900 mt-0.5">{formatKoboToNaira(item.totalKobo)}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Financial Summary */}
            <div className="p-4 bg-stone-50 border-t border-stone-200 space-y-1.5 text-xs text-stone-600">
              <div className="flex justify-between">
                <span>Items Subtotal:</span>
                <span className="font-medium text-stone-900">{formatKoboToNaira(order.subtotalKobo)}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery Charge:</span>
                <span className="font-medium text-stone-900">{formatKoboToNaira(order.deliveryFeeKobo)}</span>
              </div>
              {order.discountKobo > 0 && (
                <div className="flex justify-between text-emerald-700 font-medium">
                  <span>Discount Code ({order.discountCode}):</span>
                  <span>- {formatKoboToNaira(order.discountKobo)}</span>
                </div>
              )}
              <div className="pt-2 border-t border-stone-200 flex justify-between font-bold text-sm text-stone-900">
                <span>Total Settled:</span>
                <span className="text-oxblood-800">{formatKoboToNaira(order.totalKobo)}</span>
              </div>
            </div>
          </div>

          {/* Fulfillment & Waybill Dispatch Form */}
          <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-6 space-y-4">
            <h3 className="font-serif text-base font-bold text-stone-900 flex items-center gap-2">
              <Truck className="w-5 h-5 text-oxblood-700" />
              Fulfillment & Waybill Tracking
            </h3>

            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1">
                    Courier / Carrier:
                  </label>
                  <select
                    value={carrierName}
                    onChange={(e) => setCarrierName(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-sand-50 border border-stone-300 rounded font-medium text-stone-900"
                  >
                    <option value="GIG Logistics">GIG Logistics</option>
                    <option value="DHL Express">DHL Express</option>
                    <option value="Peace Mass Waybill">Peace Mass Waybill (South-East)</option>
                    <option value="Aba Local Dispatch Rider">Aba Local Dispatch Rider</option>
                    <option value="God is Good Motors (GIGM)">God is Good Motors (GIGM)</option>
                    <option value="Direct Boutique Handover">Direct Boutique Handover</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1">
                    Waybill / Tracking Reference:
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. GIG-ABA-98412"
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-sand-50 border border-stone-300 rounded font-mono font-medium text-stone-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1">
                  Online Tracking Link <span className="text-stone-400 font-normal">(Optional)</span>:
                </label>
                <input
                  type="url"
                  placeholder="https://giglogistics.com/track/..."
                  value={trackingUrl}
                  onChange={(e) => setTrackingUrl(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-sand-50 border border-stone-300 rounded text-stone-900"
                />
              </div>

              <div className="pt-2 flex flex-wrap gap-2">
                {order.fulfillmentStatus !== 'dispatched' && order.fulfillmentStatus !== 'delivered' && (
                  <button
                    type="button"
                    disabled={isUpdating}
                    onClick={handleMarkDispatched}
                    className="px-5 py-2.5 bg-oxblood-700 hover:bg-oxblood-800 text-white rounded-lg text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-1.5 shadow-sm"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Confirm Dispatch & Consign Waybill</span>
                  </button>
                )}

                {order.fulfillmentStatus === 'dispatched' && (
                  <button
                    type="button"
                    disabled={isUpdating}
                    onClick={handleMarkDelivered}
                    className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-1.5 shadow-sm"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Mark as Successfully Delivered</span>
                  </button>
                )}
              </div>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: Customer & Timeline (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Customer & Destination Card */}
          <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-5 space-y-4">
            <h3 className="font-serif text-base font-bold text-stone-900">
              Customer & Destination
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <div className="text-stone-500 uppercase tracking-wider text-[10px] font-semibold">Customer:</div>
                <div className="font-bold text-stone-900 text-sm">{order.customerName}</div>
                <div className="text-stone-600">{order.customerPhone}</div>
                <div className="text-stone-500">{order.customerEmail}</div>
              </div>

              {order.customerPhone && order.customerPhone !== 'N/A' && (
                <a
                  href={waUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-lg font-semibold flex items-center justify-center gap-1.5 transition-colors border border-emerald-200"
                >
                  <MessageCircle className="w-4 h-4 text-emerald-600" />
                  <span>Chat on WhatsApp</span>
                </a>
              )}

              <div className="pt-2 border-t border-stone-100">
                <div className="text-stone-500 uppercase tracking-wider text-[10px] font-semibold mb-1">
                  Fulfilment Destination:
                </div>
                {order.deliveryType === 'aba_pickup' ? (
                  <div className="p-3 bg-sand-100 rounded text-stone-800">
                    <strong>Aba Boutique Showroom Pickup</strong>
                    <p className="text-[11px] text-stone-600 mt-0.5">Ehi Road Fashion District, Aba, Abia State.</p>
                  </div>
                ) : (
                  <div className="space-y-1 text-stone-800">
                    <p className="font-medium">{order.shippingAddress?.streetAddress}</p>
                    <p>{order.shippingAddress?.city}, {order.shippingAddress?.state}</p>
                    {order.shippingAddress?.landmark && (
                      <p className="text-oxblood-800 font-medium">
                        Landmark: {order.shippingAddress.landmark}
                      </p>
                    )}
                    {order.shippingAddress?.deliveryInstructions && (
                      <p className="text-stone-500 italic mt-1">
                        Note: "{order.shippingAddress.deliveryInstructions}"
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Timeline Audit History */}
          <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-5 space-y-4">
            <h3 className="font-serif text-base font-bold text-stone-900">
              Audit Timeline
            </h3>

            <div className="space-y-4 relative before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-stone-200 text-xs">
              {order.timeline.map((event) => (
                <div key={event.id} className="relative pl-6">
                  <span className="absolute left-0 top-1 w-4 h-4 rounded-full bg-stone-900 border-2 border-white ring-1 ring-stone-300" />
                  <div className="font-semibold text-stone-900">{event.title}</div>
                  <div className="text-stone-600 text-[11px] leading-normal">{event.description}</div>
                  <div className="text-stone-400 text-[10px] mt-0.5 font-mono">
                    {new Date(event.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })} • By {event.actor}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}

