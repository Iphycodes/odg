'use client';
import { createContext, Dispatch, ReactNode, SetStateAction, useEffect, useState } from 'react';
import { useAppDispatch } from '@grc/redux/store';
import { logout } from '@grc/redux/slices/auth';
import { AuthDataType } from '@grc/_shared/namespace/auth';
import { AccountNamespace } from '@grc/_shared/namespace/account';
import { mediaSize, useMediaQuery } from '@grc/_shared/components/responsiveness';
import { mockMarketItems } from '@grc/_shared/constant';
import { mockMarketItemType } from '@grc/_shared/namespace';

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
});

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
  };

  return <AppContext.Provider value={values}>{children}</AppContext.Provider>;
};
