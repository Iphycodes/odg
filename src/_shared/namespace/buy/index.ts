import { CartItem } from '@grc/_shared/namespace/cart';

const BUYNOW_STORAGE_KEY = 'odg-buynow-item';

/** Store a single item for buy-now checkout. Call before navigating to /checkout?mode=buynow */
export function setBuyNowItem(item: CartItem) {
  try {
    sessionStorage.setItem(BUYNOW_STORAGE_KEY, JSON.stringify(item));
  } catch {
    // silent — sessionStorage may be unavailable
  }
}

/** Read the buy-now item (does NOT clear it) */
export function getBuyNowItem(): CartItem | null {
  try {
    const raw = sessionStorage.getItem(BUYNOW_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as CartItem;
  } catch {
    return null;
  }
}

/** Clear the buy-now item from session storage */
export function clearBuyNowItem() {
  try {
    sessionStorage.removeItem(BUYNOW_STORAGE_KEY);
  } catch {
    // silent
  }
}
