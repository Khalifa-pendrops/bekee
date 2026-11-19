import { Order } from '@/types';
import { formatKoboToNaira } from './utils';

export function getCleanPhone(phone?: string): string {
  if (!phone) return '';
  const digits = phone.replace(/\D/g, '');
  if (!digits) return '';
  if (digits.startsWith('0')) {
    return '234' + digits.slice(1);
  }
  return digits;
}

export function generateOrderWhatsAppMessage(order: Order, options?: { origin?: string }): string {
  const origin = options?.origin || (typeof window !== 'undefined' ? window.location.origin : 'https://arubekeecollection.vercel.app');
  const cleanPhone = getCleanPhone(order.customerPhone);
  const liveTrackingUrl = `${origin}/track-order?ref=${encodeURIComponent(order.orderNumber)}&phone=${cleanPhone}`;

  // Fulfillment status label & emoji
  let fulfillmentLabel = '📦 Order Confirmed • Being Packed in Aba Workshop';
  let deliveryCallToAction = '';

  if (order.fulfillmentStatus === 'delivered') {
    fulfillmentLabel = '✅ Delivered Successfully';
    deliveryCallToAction = '\n🎉 *Thank you for shopping with ARUBEKEE COLLECTION! We hope you love your new pieces.* ✨';
  } else if (order.fulfillmentStatus === 'dispatched') {
    const courier = order.carrierName || 'Courier';
    const waybill = order.trackingNumber ? ` (Waybill: *${order.trackingNumber}*)` : '';
    fulfillmentLabel = `🚚 Dispatched & In Transit with ${courier}${waybill}`;
    deliveryCallToAction = `\n👉 *Once your parcel arrives, please tap the tracking link above to confirm delivery with 1 click so our atelier knows you've received your items safely!*`;
  } else if (order.fulfillmentStatus === 'ready_for_pickup') {
    fulfillmentLabel = '🛍️ Ready for Pickup at Aba Boutique Showroom';
    deliveryCallToAction = `\n👉 *When you collect your parcel from our showroom, please tap the tracking link above to confirm collection.*`;
  } else if (order.fulfillmentStatus === 'cancelled') {
    fulfillmentLabel = '❌ Cancelled';
  }

  // Payment status label
  const paymentLabel = order.paymentStatus === 'paid'
    ? `✅ Payment Confirmed (${formatKoboToNaira(order.totalKobo)})`
    : `⏳ Payment Pending (${formatKoboToNaira(order.totalKobo)})`;

  // Formatted items list
  const itemsText = (order.items && order.items.length > 0)
    ? order.items.map((item, idx) => {
        const details = [
          item.colorName ? `Color: ${item.colorName}` : null,
          item.size ? `Size: ${item.size}` : null,
          `Qty: ${item.quantity}`,
        ].filter(Boolean).join(' • ');

        return `${idx + 1}. *${item.productName}*\n   ${details} — ${formatKoboToNaira(item.totalKobo)}`;
      }).join('\n\n')
    : '• Garments recorded in order snapshot';

  // Delivery destination
  let destinationText = 'Aba Boutique Showroom Pickup (Ehi Road Fashion District, Aba, Abia State)';
  if (order.deliveryType !== 'aba_pickup') {
    const addr = order.shippingAddress;
    const parts = [
      addr?.streetAddress,
      addr?.city,
      addr?.state ? `${addr.state} State` : null,
      addr?.landmark ? `Landmark: ${addr.landmark}` : null,
    ].filter(Boolean);

    destinationText = parts.length > 0 ? parts.join(', ') : 'Doorstep Courier Delivery';
  }

  // Logistics tracking if dispatched
  let waybillSection = '';
  if (order.carrierName || order.trackingNumber || order.trackingUrl) {
    waybillSection = `\n\n📦 *WAYBILL & COURIER LOGISTICS:*` +
      `\n• *Courier / Dispatch:* ${order.carrierName || 'Regional Courier'}` +
      (order.trackingNumber ? `\n• *Waybill Number:* ${order.trackingNumber}` : '') +
      (order.trackingUrl ? `\n• *Courier Tracking Portal:* ${order.trackingUrl}` : '');
  }

  return `✨ *ARUBEKEE COLLECTION • ORDER UPDATE* 🌸

Hello *${order.customerName}*, this is ARUBEKEE COLLECTION regarding your order *${order.orderNumber}*.

📊 *ORDER STATUS:*
• *Order Ref:* ${order.orderNumber}
• *Payment:* ${paymentLabel}
• *Fulfillment:* ${fulfillmentLabel}${waybillSection}

👗 *ITEMS ORDERED:*
${itemsText}

💰 *TOTAL AMOUNT:* ${formatKoboToNaira(order.totalKobo)}

📍 *DESTINATION:*
${destinationText}

🔗 *LIVE ORDER TRACKING & INVOICE:*
${liveTrackingUrl}
${deliveryCallToAction}

If you have any questions or additional delivery instructions, feel free to reply directly to this chat. Thank you for choosing ARUBEKEE! 💕

—
*ARUBEKEE COLLECTION*
Aba Boutique Showroom • Nationwide Express Delivery
Ehi Road Fashion District, Aba, Abia State`;
}

export function generateOrderWhatsAppUrl(order: Order, options?: { origin?: string }): string {
  const cleanPhone = getCleanPhone(order.customerPhone);
  const message = generateOrderWhatsAppMessage(order, options);
  if (!cleanPhone) {
    return `https://wa.me/?text=${encodeURIComponent(message)}`;
  }
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
}
