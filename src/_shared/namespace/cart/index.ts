// What gets stored in localStorage and state
export interface CartEntry {
  id: string | number;
  quantity: number;
}

// Full resolved item for display (derived from CartEntry + mockMarketItems)
export interface CartItem {
  id: string | number;
  itemName: string;
  description: string;
  price: number; // in kobo
  quantity: number;
  maxQuantity?: number;
  image: string;
  condition: string;
  negotiable: boolean;
  sellerName: string;
}

export interface CartContextType {
  cartItems: CartItem[];
  addToCart: (id: string | number) => void;
  removeFromCart: (id: string | number) => void;
  updateQuantity: (id: string | number, quantity: number) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  getCartCount: () => number;
  isInCart: (id: string | number) => boolean;
}
