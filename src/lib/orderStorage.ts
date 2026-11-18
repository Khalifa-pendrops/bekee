// Browser Local Storage helper for customer order history and 1-tap tracking

export interface TrackedOrderRecord {
  orderNumber: string;
  phone: string;
  date: string;
  fulfillmentStatus?: string;
  totalKobo?: number;
}

const STORAGE_KEY = 'arubekee_saved_orders';
const LEGACY_REF_KEY = 'arubekee_last_order_ref';
const LEGACY_PHONE_KEY = 'arubekee_last_customer_phone';

export function getSavedOrders(includeDelivered = false): TrackedOrderRecord[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    let list: TrackedOrderRecord[] = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(list)) list = [];

    // Migrate from legacy single-order keys if present
    const legacyRef = localStorage.getItem(LEGACY_REF_KEY);
    const legacyPhone = localStorage.getItem(LEGACY_PHONE_KEY) || '';
    if (legacyRef && !list.some((o) => o.orderNumber.toUpperCase() === legacyRef.toUpperCase())) {
      list.unshift({
        orderNumber: legacyRef,
        phone: legacyPhone,
        date: 'Recent',
      });
    }

    if (!includeDelivered) {
      // Filter out parcels that have already been successfully delivered
      return list.filter((o) => o.fulfillmentStatus !== 'delivered');
    }

    return list;
  } catch {
    return [];
  }
}

export function saveOrderToHistory(
  orderNumber: string, 
  phone: string, 
  totalKobo?: number, 
  fulfillmentStatus?: string
): void {
  if (typeof window === 'undefined' || !orderNumber) return;
  try {
    const cleanRef = orderNumber.trim();
    const cleanPhone = phone ? phone.trim() : '';

    const all = getSavedOrders(true);
    let list = all.filter((o) => o.orderNumber.toUpperCase() !== cleanRef.toUpperCase());
    
    // Format friendly date (e.g. "18 Nov")
    const dateFormatted = new Date().toLocaleDateString('en-NG', { day: 'numeric', month: 'short' });

    list.unshift({
      orderNumber: cleanRef,
      phone: cleanPhone,
      date: dateFormatted,
      fulfillmentStatus,
      totalKobo,
    });

    // Retain up to the 10 most recent orders in local storage
    list = list.slice(0, 10);

    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    
    // Only set as last active reference if NOT delivered
    if (fulfillmentStatus !== 'delivered') {
      localStorage.setItem(LEGACY_REF_KEY, cleanRef);
    }
    if (cleanPhone) {
      localStorage.setItem(LEGACY_PHONE_KEY, cleanPhone);
    }
  } catch (err) {
    console.error('Failed to save order to history:', err);
  }
}

export function removeOrderFromHistory(orderNumber: string): TrackedOrderRecord[] {
  if (typeof window === 'undefined') return [];
  try {
    const all = getSavedOrders(true);
    const list = all.filter((o) => o.orderNumber.toUpperCase() !== orderNumber.toUpperCase());
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    
    const activeList = list.filter((o) => o.fulfillmentStatus !== 'delivered');
    if (activeList.length > 0) {
      localStorage.setItem(LEGACY_REF_KEY, activeList[0].orderNumber);
      if (activeList[0].phone) localStorage.setItem(LEGACY_PHONE_KEY, activeList[0].phone);
    } else {
      localStorage.removeItem(LEGACY_REF_KEY);
    }
    return activeList;
  } catch {
    return [];
  }
}

export function clearOrderHistory(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(LEGACY_REF_KEY);
    localStorage.removeItem(LEGACY_PHONE_KEY);
  } catch {}
}
