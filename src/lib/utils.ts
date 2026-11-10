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
 */
export function buildWhatsAppProductUrl(
  waNumber: string,
  productName: string,
  variantSummary: string,
  productUrl: string
): string {
  const cleanNumber = waNumber.replace(/[^0-9]/g, '');
  const message = `Hello ARUBEKEE Collection! 🌸\n\nI would like to enquire about:\n*${productName}*\nOption: ${variantSummary}\n\nLink: ${productUrl}\n\nPlease confirm availability and payment details. Thank you!`;
  
  return `https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`;
}

/**
 * Generates human-friendly SKU codes based on category, product name, and variant options.
 * Example: Clothing dress in Black UK 12 -> "ARU-CLO-DRS-BLK-12"
 */
export function generateSuggestedSku(
  categorySlug: string,
  productName: string,
  color: string,
  size: string
): string {
  const catCode = categorySlug.slice(0, 3).toUpperCase();
  const prodCode = productName
    .split(' ')
    .map(w => w.charAt(0))
    .join('')
    .slice(0, 3)
    .toUpperCase() || 'ITM';
  const colorCode = color.replace(/[^A-Za-z]/g, '').slice(0, 3).toUpperCase() || 'STD';
  const sizeCode = size.replace(/[^0-9A-Za-z]/g, '').toUpperCase() || 'OS';
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

