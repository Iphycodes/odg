'use client';
import {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useAppDispatch } from '@grc/redux/store';
import { logout } from '@grc/redux/slices/auth';
import { AuthDataType } from '@grc/_shared/namespace/auth';
import { AccountNamespace } from '@grc/_shared/namespace/account';
import { mediaSize, useMediaQuery } from '@grc/_shared/components/responsiveness';
import { mockMarketItems } from '@grc/_shared/constant';
import { mockMarketItemType } from '@grc/_shared/namespace';
import { CartEntry, CartItem } from '@grc/_shared/namespace/cart';

type AppProviderPropType = {
  children: ReactNode;
};

interface AppContextPropType {
  handleLogOut: () => void;
  authData: AuthDataType | null;
  currentAccount: AccountNamespace.Account | null;
  isLiveMode: boolean;
  accounts: Array<AccountNamespace.Account | null>;
  toggleSider: boolean;
  setToggleSider: Dispatch<SetStateAction<boolean>>;
  toggleLeftDrawer: boolean;
  setToggleLeftDrawer: Dispatch<SetStateAction<boolean>>;
  toggleFindVendorDrawer: boolean;
  setToggleFindVendorDrawer: Dispatch<SetStateAction<boolean>>;
  toggleProfileDrawer: boolean;
  setToggleProfileDrawer: Dispatch<SetStateAction<boolean>>;
  toggleNotificationsDrawer: boolean;
  setToggleNotificationsDrawer: Dispatch<SetStateAction<boolean>>;
  isCreateStoreModalOpen: boolean;
  setIsCreateStoreModalOpen: Dispatch<SetStateAction<boolean>>;
  isSellItemModalOpen: boolean;
  setIsSellItemModalOpen: Dispatch<SetStateAction<boolean>>;
  isChatsModalOpen: boolean;
  setIsChatsModalOpen: Dispatch<SetStateAction<boolean>>;
  payoutDetails: Record<string, any>;
  setPayoutdetails: Dispatch<SetStateAction<Record<string, any>>>;
  selectedDashboardTransaction: Record<string, any>;
  setSelectedDashboardTransaction: Dispatch<SetStateAction<Record<string, any>>>;
  shopItems: Partial<mockMarketItemType>[];
  setShopItems: Dispatch<SetStateAction<Partial<mockMarketItemType>[]>>;
  // Cart
  cartItems: CartItem[];
  addToCart: (id: string | number) => void;
  removeFromCart: (id: string | number) => void;
  updateQuantity: (id: string | number, quantity: number) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  getCartCount: () => number;
  isInCart: (id: string | number) => boolean;
}

export const AppContext = createContext<AppContextPropType>({
  handleLogOut: () => {},
  authData: null,
  currentAccount: null,
  isLiveMode: false,
  accounts: [],
  toggleSider: false,
  setToggleSider: () => {},
  toggleLeftDrawer: false,
  setToggleLeftDrawer: () => {},
  toggleFindVendorDrawer: true,
  setToggleFindVendorDrawer: () => {},
  toggleProfileDrawer: true,
  setToggleProfileDrawer: () => {},
  toggleNotificationsDrawer: true,
  setToggleNotificationsDrawer: () => {},
  isCreateStoreModalOpen: false,
  setIsCreateStoreModalOpen: () => {},
  isSellItemModalOpen: false,
  setIsSellItemModalOpen: () => {},
  isChatsModalOpen: false,
  setIsChatsModalOpen: () => {},
  payoutDetails: {},
  setPayoutdetails: () => {},
  selectedDashboardTransaction: {},
  setSelectedDashboardTransaction: () => {},
  shopItems: [],
  setShopItems: () => [],
  // Cart defaults
  cartItems: [],
  addToCart: () => {},
  removeFromCart: () => {},
  updateQuantity: () => {},
  clearCart: () => {},
  getCartTotal: () => 0,
  getCartCount: () => 0,
  isInCart: () => false,
});

// Helper to load cart from localStorage (used in lazy initializer)
const loadCartEntries = (): CartEntry[] => {
  if (typeof window === 'undefined') return [];
  try {
    const saved = localStorage.getItem('odg-cart');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (error) {
    console.error('Error loading cart:', error);
  }
  return [];
};

export const AppProvider = (props: AppProviderPropType) => {
  const { children } = props;
  const isMobile = useMediaQuery(mediaSize.mobile);
  const dispatch = useAppDispatch();
  const handleLogOut = () => dispatch(logout());
  const [toggleSider, setToggleSider] = useState(false);
  const [toggleLeftDrawer, setToggleLeftDrawer] = useState(true);
  const [toggleFindVendorDrawer, setToggleFindVendorDrawer] = useState(true);
  const [toggleProfileDrawer, setToggleProfileDrawer] = useState(true);
  const [toggleNotificationsDrawer, setToggleNotificationsDrawer] = useState(true);
  const [payoutDetails, setPayoutdetails] = useState({});
  const [selectedDashboardTransaction, setSelectedDashboardTransaction] = useState({});
  const [isCreateStoreModalOpen, setIsCreateStoreModalOpen] = useState(false);
  const [isSellItemModalOpen, setIsSellItemModalOpen] = useState(false);
  const [isChatsModalOpen, setIsChatsModalOpen] = useState(false);
  const [shopItems, setShopItems] = useState(mockMarketItems);

  // Cart state — stores only IDs + quantities
  // Lazy initializer loads from localStorage synchronously, fixing the refresh bug
  const [cartEntries, setCartEntries] = useState<CartEntry[]>(loadCartEntries);

  // Persist cart to localStorage whenever entries change
  useEffect(() => {
    try {
      localStorage.setItem('odg-cart', JSON.stringify(cartEntries));
      window.dispatchEvent(new Event('cartUpdated'));
    } catch (error) {
      console.error('Error saving cart:', error);
    }
  }, [cartEntries]);

  // Derive full cart items by resolving IDs against mockMarketItems
  const cartItems: CartItem[] = useMemo(() => {
    return cartEntries
      .map((entry) => {
        const product = mockMarketItems.find((item) => item.id === entry.id);
        if (!product) return null;
        return {
          id: product.id!,
          itemName: product.itemName ?? '',
          description: product.description ?? '',
          price: product.askingPrice?.price ?? 0,
          quantity: entry.quantity,
          maxQuantity: product.quantity,
          image: product.postImgUrls?.[0] ?? '',
          condition: product.condition ?? '',
          negotiable: product.askingPrice?.negotiable ?? false,
          sellerName:
            product.postUserProfile?.businessName || product.postUserProfile?.userName || '',
        } as CartItem;
      })
      .filter(Boolean) as CartItem[];
  }, [cartEntries]);

  const addToCart = (id: string | number) => {
    setCartEntries((prev) => {
      const existing = prev.find((e) => e.id === id);
      if (existing) {
        const product = mockMarketItems.find((item) => item.id === id);
        const max = product?.quantity ?? Infinity;
        if (existing.quantity >= max) return prev;
        return prev.map((e) => (e.id === id ? { ...e, quantity: e.quantity + 1 } : e));
      }
      return [...prev, { id, quantity: 1 }];
    });
  };

  const removeFromCart = (id: string | number) => {
    setCartEntries((prev) => prev.filter((e) => e.id !== id));
  };

  const updateQuantity = (id: string | number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id);
      return;
    }
    setCartEntries((prev) =>
      prev.map((e) => {
        if (e.id !== id) return e;
        const product = mockMarketItems.find((item) => item.id === id);
        const max = product?.quantity ?? Infinity;
        return { ...e, quantity: Math.min(quantity, max) };
      })
    );
  };

  const clearCart = () => setCartEntries([]);

  const getCartTotal = () =>
    cartItems.reduce((total, item) => total + item.price * item.quantity, 0);

  const getCartCount = () => cartEntries.reduce((count, e) => count + e.quantity, 0);

  const isInCart = (id: string | number) => cartEntries.some((e) => e.id === id);

  useEffect(() => {
    isMobile && setToggleSider(true);
  }, [isMobile]);

  const values: any = {
    handleLogOut,
    setToggleSider,
    toggleSider,
    payoutDetails,
    setPayoutdetails,
    selectedDashboardTransaction,
    setSelectedDashboardTransaction,
    setToggleLeftDrawer,
    toggleLeftDrawer,
    toggleFindVendorDrawer,
    setToggleFindVendorDrawer,
    toggleNotificationsDrawer,
    setToggleNotificationsDrawer,
    isCreateStoreModalOpen,
    setIsCreateStoreModalOpen,
    toggleProfileDrawer,
    setToggleProfileDrawer,
    isSellItemModalOpen,
    setIsSellItemModalOpen,
    isChatsModalOpen,
    setIsChatsModalOpen,
    shopItems,
    setShopItems,
    // Cart
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartTotal,
    getCartCount,
    isInCart,
  };

  return <AppContext.Provider value={values}>{children}</AppContext.Provider>;
};
