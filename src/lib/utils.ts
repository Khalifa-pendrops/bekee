import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Standard Tailwind class merger with clsx
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format integer kobo into Nigerian Naira string.
 * Example: 3500000 kobo -> ₦35,000
 * Example: 25050 kobo -> ₦250.50
 */
export function formatKoboToNaira(kobo: number, includeDecimals: boolean = false): string {
  if (kobo === undefined || kobo === null || isNaN(kobo)) {
    return "₦0";
  }
  const naira = kobo / 100;
  
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    currencyDisplay: "narrowSymbol",
    minimumFractionDigits: includeDecimals ? 2 : 0,
    maximumFractionDigits: includeDecimals ? 2 : 0,
  }).format(naira);
}

/**
 * Parse a Naira string or number into integer kobo.
 * Example: "35000" or 35000 -> 3500000 kobo
 */
export function parseNairaToKobo(nairaAmount: number | string): number {
  if (typeof nairaAmount === 'string') {
    // Strip any commas, currency symbols, and spaces
    const cleanStr = nairaAmount.replace(/[^0-9.]/g, '');
    const num = parseFloat(cleanStr);
    return isNaN(num) ? 0 : Math.round(num * 100);
  }
  return Math.round(nairaAmount * 100);
}

/**
 * Normalizes Nigerian phone numbers to standard E.164 and WhatsApp formats.
 * Handles:
 * - 08031234567 -> { e164: "+2348031234567", waNumber: "2348031234567", national: "0803 123 4567" }
 * - +2348031234567
 * - 2348031234567
 */
export function normalizeNigerianPhone(phone: string): {
  isValid: boolean;
  e164: string;
  waNumber: string;
  display: string;
} {
  const digits = phone.replace(/[^0-9]/g, '');
  let normalized = '';

  if (digits.startsWith('0') && digits.length === 11) {
    normalized = '234' + digits.slice(1);
  } else if (digits.startsWith('234') && digits.length === 13) {
    normalized = digits;
  } else if (digits.length === 10) {
    normalized = '234' + digits;
  } else {
    // Return raw fallback if invalid
    return {
      isValid: false,
      e164: phone,
      waNumber: digits,
      display: phone,
    };
  }

  const localPart = '0' + normalized.slice(3);
  const formattedDisplay = `${localPart.slice(0, 4)} ${localPart.slice(4, 7)} ${localPart.slice(7)}`;

  return {
    isValid: true,
    e164: `+${normalized}`,
    waNumber: normalized,
    display: formattedDisplay,
  };
}

/**
 * Generate a prefilled WhatsApp link for direct shopping enquiries.
 * Includes direct product image URL and price for instant visual clarity in the chat.
 */
export function buildWhatsAppProductUrl(
  waNumber: string,
  productName: string,
  variantSummary: string,
  productUrl: string,
  imageUrl?: string,
  priceFormatted?: string
): string {
  const cleanNumber = waNumber.replace(/[^0-9]/g, '');
  
  let message = `Hello ARUBEKEE COLLECTION!\n\nI would like to enquire about / order:\n- Item: *${productName}*\n- Option: ${variantSummary}`;
  
  if (priceFormatted) {
    message += `\n- Price: ${priceFormatted}`;
  }
  
  if (imageUrl) {
    const fullImg = imageUrl.startsWith('http')
      ? imageUrl
      : `https://arubekee.com${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`;
    message += `\n- Item Photo: ${fullImg}`;
  }
  
  message += `\n- Product Link: ${productUrl}\n\nPlease confirm availability and dispatch schedule. Thank you!`;
  
  return `https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`;
}

/**
 * Generate a 1-tap WhatsApp concierge inquiry URL for quick in-store boutique reservations
 * with complete item metadata (name, color, price, product link, and photo URL).
 */
export function buildWhatsAppReserveInAbaUrl(
  waNumber: string,
  productName: string,
  colorName?: string,
  priceFormatted?: string,
  productSlug?: string,
  imageUrl?: string
): string {
  const cleanNumber = (waNumber || '2349164161091').replace(/[^0-9]/g, '');
  const colorPart = colorName ? ` in ${colorName}` : '';

  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL && !process.env.NEXT_PUBLIC_SITE_URL.includes('localhost'))
    ? process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, '')
    : typeof window !== 'undefined' && window.location.origin && !window.location.origin.includes('localhost')
    ? window.location.origin
    : 'https://arubekee.com';

  let message = `Hello Arubekee, I am interested in acquiring the *${productName}*${colorPart}. Is in-store reservation available today?\n\n`;
  message += `*PRODUCT DETAILS:*\n`;
  message += `- Item: *${productName}*\n`;
  if (colorName) {
    message += `- Colour: ${colorName}\n`;
  }
  if (priceFormatted) {
    message += `- Price: ${priceFormatted}\n`;
  }
  if (productSlug) {
    message += `- Store Link: ${siteUrl}/products/${productSlug}\n`;
  }
  if (imageUrl) {
    const fullImg = imageUrl.startsWith('http')
      ? imageUrl
      : `${siteUrl}${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`;
    message += `- Photo: ${fullImg}\n`;
  }

  return `https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`;
}

/**
 * Generates human-friendly SKU codes based on category, product name, and variant options.
 * Example: Clothing dress in Black UK 12 -> "ARU-CLO-DRS-BLK-12"
 */
export function generateSuggestedSku(
  categorySlug?: string,
  productName?: string,
  color?: string,
  size?: string
): string {
  const catCode = (categorySlug || 'CLO').replace(/[^A-Za-z]/g, '').slice(0, 3).toUpperCase() || 'CLO';
  const prodCode = (productName || 'ITM')
    .split(/\s+/)
    .map(w => w.charAt(0))
    .join('')
    .replace(/[^A-Za-z0-9]/g, '')
    .slice(0, 3)
    .toUpperCase() || 'ITM';

  if (!color && !size) {
    return `ARU-${catCode}-${prodCode}`;
  }

  const colorCode = (color || 'STD').replace(/[^A-Za-z]/g, '').slice(0, 3).toUpperCase() || 'STD';
  const sizeCode = (size || 'OS').replace(/[^0-9A-Za-z]/g, '').toUpperCase() || 'OS';
  const rand = Math.floor(100 + Math.random() * 900);

  return `ARU-${catCode}-${prodCode}-${colorCode}-${sizeCode}-${rand}`;
}

/**
 * Generates URL-friendly slug
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

