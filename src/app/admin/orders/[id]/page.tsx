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

const PRESET_COURIERS = [
  'GIG Logistics',
  'DHL Express',
  'Peace Mass Waybill',
  'Aba Local Dispatch Rider',
  'God is Good Motors (GIGM)',
  'Direct Boutique Handover',
];

export default function AdminOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  // Dispatch Form
  const [selectedCourier, setSelectedCourier] = useState('GIG Logistics');
  const [customCourier, setCustomCourier] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [trackingUrl, setTrackingUrl] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [copiedSlip, setCopiedSlip] = useState(false);
  const [copiedDispatchNotice, setCopiedDispatchNotice] = useState(false);
  const [showDispatchBanner, setShowDispatchBanner] = useState(false);

  useEffect(() => {
    fetch(`/api/admin/orders/${orderId}`)
      .then((r) => r.json())
      .then((data) => {
        const found: Order | null = data.order || (data.id ? data : null);
        if (found) {
          setOrder(found);
          if (found.carrierName) {
            if (PRESET_COURIERS.includes(found.carrierName)) {
              setSelectedCourier(found.carrierName);
              setCustomCourier('');
            } else {
              setSelectedCourier('Other');
              setCustomCourier(found.carrierName);
            }
          }
          if (found.trackingNumber) setTrackingNumber(found.trackingNumber);
          if (found.trackingUrl) setTrackingUrl(found.trackingUrl);
          setLoading(false);
        } else {
          // Fallback to searching orders list
          return fetch('/api/admin/orders')
            .then((r) => r.json())
            .then((orders) => {
              if (Array.isArray(orders)) {
                const f = orders.find((o: Order) => o.id === orderId || o.orderNumber === orderId);
                if (f) setOrder(f);
              }
            })
            .finally(() => setLoading(false));
        }
      })
      .catch(() => {
        setLoading(false);
      });
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
  const cleanPhone = customerWhatsApp.startsWith('0') ? '234' + customerWhatsApp.slice(1) : customerWhatsApp;
  
  const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
    `Hello ${order.customerName}, this is ARUBEKEE COLLECTION, Aba. Regarding your order ${order.orderNumber}...`
  )}`;

  // Generate Dispatch WhatsApp Notice
  const getDispatchWhatsAppMessage = () => {
    const finalCarrier = selectedCourier === 'Other'
      ? (customCourier.trim() || 'Custom Courier')
      : selectedCourier;

    const destination = order.shippingAddress
      ? `${order.shippingAddress.streetAddress || ''}, ${order.shippingAddress.city || ''}, ${order.shippingAddress.state || ''}`.replace(/^,\s*|,\s*$/g, '')
      : 'Aba Boutique Pickup';

    const itemsSummary = order.items && order.items.length > 0
      ? order.items.map(i => `• ${i.productName} (${i.colorName || 'Default'} • Size ${i.size}) - Qty: ${i.quantity}`).join('\n')
      : '• Garments in packaging';

    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://bekee.com';
    const liveTrackingUrl = `${origin}/track-order?ref=${order.orderNumber}&phone=${order.customerPhone.replace(/\D/g, '')}`;

    return `✨ *ARUBEKEE COLLECTION • PARCEL DISPATCHED* 📦✨

Dear ${order.customerName},
Your parcel of handpicked pieces from ARUBEKEE COLLECTION, Aba, has been carefully inspected, packaged, and dispatched!

📋 *SHIPMENT DETAILS:*
• *Order Ref:* ${order.orderNumber}
• *Courier / Waybill:* ${finalCarrier}
• *Waybill Tracking No:* ${trackingNumber || 'En-route to dispatch hub'}
• *Destination:* ${destination}
${trackingUrl ? `• *Carrier Online Portal:* ${trackingUrl}` : ''}

📍 *LIVE DISPATCH TRACKING:*
Track your delivery progress and carrier handoff live:
${liveTrackingUrl}

👗 *Items in this delivery:*
${itemsSummary}

Our Aba concierge is monitoring your parcel until it reaches you safely. If you have any urgent delivery instructions, simply reply directly to this message.

With warm regards,
*ARUBEKEE COLLECTION*
Aba Boutique Showroom • Nationwide Express Dispatch • +234 916 416 1091`;
  };

  const handleSendDispatchWhatsApp = () => {
    const text = getDispatchWhatsAppMessage();
    const url = cleanPhone
      ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`
      : `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const handleCopyDispatchNotice = () => {
    const text = getDispatchWhatsAppMessage();
    navigator.clipboard.writeText(text);
    setCopiedDispatchNotice(true);
    setTimeout(() => setCopiedDispatchNotice(false), 2500);
  };

  // Handle Dispatch
  const handleMarkDispatched = async () => {
    setIsUpdating(true);
    const finalCarrierName = selectedCourier === 'Other'
      ? (customCourier.trim() || 'Custom Courier')
      : selectedCourier;

    try {
      const res = await fetch(`/api/admin/orders/${order.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'dispatch',
          carrierName: finalCarrierName,
          trackingNumber,
          trackingUrl,
          staffName: 'Store Manager',
        }),
      });
      const data = await res.json();
      if (data.success) {
        setOrder(data.order);
        setShowDispatchBanner(true);
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
    const itemsList =
      order.items && order.items.length > 0
        ? order.items
            .map(
              (i) =>
                `- ${i.productName} | ${i.colorName || 'Default'} | Size: ${i.size} | Qty: ${i.quantity} (${formatKoboToNaira(i.totalKobo)})`
            )
            .join('\n')
        : 'No garments recorded in order snapshot';

    const text = `ARUBEKEE COLLECTION PACKING SLIP
Order: ${order.orderNumber}
Customer: ${order.customerName} (${order.customerPhone})
Destination: ${order.shippingAddress?.streetAddress || ''}, ${order.shippingAddress?.city || ''}, ${order.shippingAddress?.state || ''}
Landmark: ${order.shippingAddress?.landmark || 'None'}
Items:
${itemsList}
Total: ${formatKoboToNaira(order.totalKobo)}`;

    navigator.clipboard.writeText(text);
    setCopiedSlip(true);
    setTimeout(() => setCopiedSlip(false), 2500);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <Link
            href="/admin/orders"
            className="inline-flex items-center text-xs font-semibold uppercase tracking-wider text-stone-400 hover:text-white transition-colors mb-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Back to Orders
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="font-serif text-2xl font-bold text-white">
              Order {order.orderNumber}
            </h1>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase ${
              order.paymentStatus === 'paid'
                ? 'bg-emerald-400/20 text-emerald-300 border border-emerald-400/30'
                : 'bg-amber-400/20 text-amber-300 border border-amber-400/30'
            }`}>
              {order.paymentStatus}
            </span>
          </div>
        </div>

        {/* Packing Slip Copy / Print */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyPackingSlip}
            className="px-3.5 py-2 bg-white/10 hover:bg-white/20 text-stone-200 border border-white/15 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5"
          >
            {copiedSlip ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
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
            
            {showDispatchBanner && (
              <div className="p-4 bg-emerald-50 border-2 border-emerald-300 rounded-xl space-y-2.5 animate-fade-in">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-emerald-950 font-bold text-xs">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Waybill Consigned & Dispatched!</span>
                  </div>
                  <button onClick={() => setShowDispatchBanner(false)} className="text-emerald-700 hover:text-emerald-900 text-xs font-semibold">✕</button>
                </div>
                <p className="text-xs text-emerald-800">
                  Notify {order.customerName} with the official waybill tracking details on WhatsApp with 1 tap.
                </p>
                <div className="flex flex-wrap gap-2 pt-1">
                  <button
                    type="button"
                    onClick={handleSendDispatchWhatsApp}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg transition-all shadow-sm flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send WhatsApp Dispatch Slip</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleCopyDispatchNotice}
                    className="px-3 py-2 bg-white hover:bg-emerald-100 text-emerald-950 font-medium text-xs border border-emerald-300 rounded-lg transition-colors flex items-center gap-1.5"
                  >
                    {copiedDispatchNotice ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-emerald-700" />}
                    <span>{copiedDispatchNotice ? 'Copied Slip!' : 'Copy Dispatch Note'}</span>
                  </button>
                </div>
              </div>
            )}

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
                    value={selectedCourier}
                    onChange={(e) => setSelectedCourier(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-sand-50 border border-stone-300 rounded font-medium text-stone-900 focus:outline-none focus:border-oxblood-700"
                  >
                    <option value="GIG Logistics">GIG Logistics</option>
                    <option value="DHL Express">DHL Express</option>
                    <option value="Peace Mass Waybill">Peace Mass Waybill (South-East)</option>
                    <option value="Aba Local Dispatch Rider">Aba Local Dispatch Rider</option>
                    <option value="God is Good Motors (GIGM)">God is Good Motors (GIGM)</option>
                    <option value="Direct Boutique Handover">Direct Boutique Handover</option>
                    <option value="Other">Other (Manual / Custom Courier)</option>
                  </select>

                  {selectedCourier === 'Other' && (
                    <div className="mt-2.5">
                      <label className="block text-[11px] font-semibold uppercase tracking-wider text-stone-700 mb-1">
                        Specify Courier / Driver Name:
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Young Shall Grow Motors, GUO Transport, ABC Transport, Bolt..."
                        value={customCourier}
                        onChange={(e) => setCustomCourier(e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-white border border-stone-300 rounded font-medium text-stone-900 focus:outline-none focus:border-oxblood-700"
                        required={selectedCourier === 'Other'}
                      />
                    </div>
                  )}
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
                <div className="pt-2 border-t border-stone-100 space-y-2">
                  <div className="text-stone-500 uppercase tracking-wider text-[10px] font-semibold">
                    1-Click WhatsApp Concierge:
                  </div>

                  {order.fulfillmentStatus === 'dispatched' && (
                    <button
                      type="button"
                      onClick={handleSendDispatchWhatsApp}
                      className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Send WhatsApp Dispatch Slip</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={handleCopyDispatchNotice}
                    className="w-full py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 rounded-lg font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors border border-emerald-200"
                  >
                    {copiedDispatchNotice ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-emerald-700" />}
                    <span>{copiedDispatchNotice ? 'Copied to Clipboard!' : 'Copy Formatted WhatsApp Slip'}</span>
                  </button>

                  <a
                    href={waUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2 bg-stone-50 hover:bg-stone-100 text-stone-700 rounded-lg font-medium text-xs flex items-center justify-center gap-1.5 transition-colors border border-stone-200"
                  >
                    <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Open Direct WhatsApp Chat</span>
                  </a>
                </div>
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

