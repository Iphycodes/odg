'use client';
import React, { useContext, useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  ShieldCheck,
  Lock,
  CheckCircle,
  ShoppingCart,
  CreditCard,
  User,
  Mail,
  Phone,
  MapPin,
  MessageCircle,
  ChevronDown,
  Truck,
  Search,
} from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { AppContext } from '@grc/app-context';
import { fetchData, numberFormat } from '@grc/_shared/helpers';
import { Currencies } from '@grc/_shared/constant';
import { mediaSize, useMediaQuery } from '@grc/_shared/components/responsiveness';
import { usePaystackPayment } from 'react-paystack';
import { message } from 'antd';
import { CartItem } from '@grc/_shared/namespace/cart';
import { clearBuyNowItem, getBuyNowItem } from '@grc/_shared/namespace/buy';
import { getDeliveryFee, getDeliveryZone } from '@grc/_shared/namespace/delivery-fee';

// ─── Constants ───────────────────────────────────────────────────────
const NIGERIA_ISO2 = 'NG';

// ─── Types ───────────────────────────────────────────────────────────
interface CustomerInfo {
  fullName: string;
  email: string;
  phone: string;
  whatsapp: string;
  address: string;
  city: string;
  state: string;
}

type StepType = 'success' | 'review' | 'info';

interface LocationOption {
  name: string;
  iso2?: string;
}

// ─── Searchable Select Component ─────────────────────────────────────
const SearchableSelect = ({
  options,
  value,
  onChange,
  placeholder,
  searchPlaceholder,
  loading,
  icon: Icon,
}: {
  options: LocationOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  searchPlaceholder: string;
  loading?: boolean;
  icon?: React.ElementType;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');

  const filteredOptions = options.filter((opt) =>
    opt.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full pl-10 pr-10 py-3 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-white text-left text-sm flex items-center transition-all focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
      >
        {Icon && (
          <Icon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        )}
        <span className={value ? 'text-gray-900 dark:text-white' : 'text-gray-400'}>
          {value || placeholder}
        </span>
        <ChevronDown
          size={16}
          className={`absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg shadow-xl overflow-hidden"
          >
            {/* Search input */}
            <div className="p-2 border-b border-gray-100 dark:border-gray-600">
              <div className="relative">
                <Search
                  size={14}
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={searchPlaceholder}
                  className="w-full pl-8 pr-3 py-2 text-sm rounded-md border border-gray-100 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 dark:text-white outline-none focus:ring-1 focus:ring-indigo-500"
                  autoFocus
                />
              </div>
            </div>

            {/* Options list */}
            <div className="max-h-48 overflow-y-auto">
              {loading ? (
                <div className="p-4 text-center text-sm text-gray-400">Loading...</div>
              ) : filteredOptions.length === 0 ? (
                <div className="p-4 text-center text-sm text-gray-400">No results found</div>
              ) : (
                filteredOptions.map((opt) => (
                  <button
                    key={opt.name}
                    type="button"
                    onClick={() => {
                      onChange(opt.name);
                      setIsOpen(false);
                      setSearch('');
                    }}
                    className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                      value === opt.name
                        ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 font-medium'
                        : 'text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600'
                    }`}
                  >
                    {opt.name}
                  </button>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Backdrop to close */}
      {isOpen && <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />}
    </div>
  );
};

// ─── Paystack button sub-component ──────────────────────────────────
const PaystackButton = ({
  customerInfo,
  checkoutItems,
  totalWithDelivery,
  onPaymentSuccess,
}: {
  customerInfo: CustomerInfo;
  checkoutItems: CartItem[];
  totalWithDelivery: number;
  onPaymentSuccess: (reference: any) => void;
}) => {
  const config = {
    reference: `ODG-${new Date().getTime().toString()}`,
    email: customerInfo.email,
    amount: totalWithDelivery,
    publicKey: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || '',
    metadata: {
      custom_fields: [
        {
          display_name: 'Customer Name',
          variable_name: 'customer_name',
          value: customerInfo.fullName,
        },
        {
          display_name: 'Phone Number',
          variable_name: 'phone_number',
          value: customerInfo.phone,
        },
        {
          display_name: 'WhatsApp Number',
          variable_name: 'whatsapp_number',
          value: customerInfo.whatsapp,
        },
        {
          display_name: 'Delivery Address',
          variable_name: 'delivery_address',
          value: `${customerInfo.address}, ${customerInfo.city}, ${customerInfo.state}`,
        },
        {
          display_name: 'Items',
          variable_name: 'items',
          value: checkoutItems
            .map((item) => `${item.itemName} x${item.quantity} - ID: ${item.id}`)
            .join(', '),
        },
      ],
    },
  };

  const initializePayment = usePaystackPayment(config);

  const onClose = () => {
    message.info('Payment cancelled. You can try again.');
  };

  const handlePay = () => {
    initializePayment({ onSuccess: onPaymentSuccess, onClose });
  };

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={handlePay}
      className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white py-4 rounded-xl font-semibold flex items-center justify-center gap-2 shadow-lg transition-all text-base"
    >
      <Lock size={18} />
      Pay {numberFormat(totalWithDelivery / 100, Currencies.NGN)}
    </motion.button>
  );
};

// ─── Main Checkout ───────────────────────────────────────────────────
const Checkout = () => {
  const router = useRouter();
  // const searchParams = useSearchParams();
  const isMobile = useMediaQuery(mediaSize.mobile);
  const { cartItems, clearCart } = useContext(AppContext);

  // const isBuyNow = searchParams?.get('mode') === 'buynow';

  // Replace with this:
  const [isBuyNow, setIsBuyNow] = useState(false);
  const params = new URLSearchParams(window.location.search);

  useEffect(() => {
    setIsBuyNow(params.get('mode') === 'buynow');
  }, [params]);

  // Buy-now item
  const [buyNowItem, setBuyNowItemState] = useState<CartItem | null>(null);

  useEffect(() => {
    if (isBuyNow) {
      const item = getBuyNowItem();
      setBuyNowItemState(item);
    }
  }, [isBuyNow]);

  // Checkout items (buy-now single item or full cart)
  const checkoutItems: CartItem[] = useMemo(() => {
    if (isBuyNow && buyNowItem) return [buyNowItem];
    return cartItems;
  }, [isBuyNow, buyNowItem, cartItems]);

  const checkoutSubtotal = useMemo(() => {
    return checkoutItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [checkoutItems]);

  const checkoutCount = useMemo(() => {
    return checkoutItems.reduce((count, item) => count + item.quantity, 0);
  }, [checkoutItems]);

  // Steps & form
  const [step, setStep] = useState<StepType>('info');
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    fullName: '',
    email: '',
    phone: '',
    whatsapp: '',
    address: '',
    city: '',
    state: '',
  });
  const [paymentReference, setPaymentReference] = useState('');

  // Location data
  const [states, setStates] = useState<LocationOption[]>([]);
  const [cities, setCities] = useState<LocationOption[]>([]);
  const [loadingStates, setLoadingStates] = useState(false);
  const [loadingCities, setLoadingCities] = useState(false);

  // Delivery fee (recalculated whenever state changes)
  const deliveryFee = useMemo(() => {
    return getDeliveryFee(customerInfo.state);
  }, [customerInfo.state]);

  const deliveryZone = useMemo(() => {
    return getDeliveryZone(customerInfo.state);
  }, [customerInfo.state]);

  const totalWithDelivery = checkoutSubtotal + deliveryFee;

  // Fetch Nigerian states on mount
  useEffect(() => {
    const loadStates = async () => {
      setLoadingStates(true);
      try {
        const data = await fetchData(
          `${process.env.NEXT_PUBLIC_COUNTRY_API_BASE_URL}/countries/${NIGERIA_ISO2}/states`
        );
        setStates(
          (data || []).map((s: Record<string, any>) => ({
            name: s.name,
            iso2: s.iso2,
          }))
        );
      } catch (error) {
        console.error('Error fetching states:', error);
      } finally {
        setLoadingStates(false);
      }
    };
    loadStates();
  }, []);

  // Fetch cities when state changes
  useEffect(() => {
    if (!customerInfo.state) {
      setCities([]);
      return;
    }

    const selectedState = states.find(
      (s) => s.name.toLowerCase() === customerInfo.state.toLowerCase()
    );

    if (!selectedState?.iso2) return;

    const loadCities = async () => {
      setLoadingCities(true);
      try {
        const data = await fetchData(
          `${process.env.NEXT_PUBLIC_COUNTRY_API_BASE_URL}/countries/${NIGERIA_ISO2}/states/${selectedState.iso2}/cities`
        );
        setCities(
          (data || []).map((c: Record<string, any>) => ({
            name: c.name,
          }))
        );
      } catch (error) {
        console.error('Error fetching cities:', error);
        setCities([]);
      } finally {
        setLoadingCities(false);
      }
    };
    loadCities();
  }, [customerInfo.state, states]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCustomerInfo((prev) => ({ ...prev, [name]: value }));
  };

  const handleStateChange = (state: string) => {
    setCustomerInfo((prev) => ({ ...prev, state, city: '' }));
  };

  const handleCityChange = (city: string) => {
    setCustomerInfo((prev) => ({ ...prev, city }));
  };

  const isInfoValid = () => {
    return (
      customerInfo.fullName.trim() !== '' &&
      customerInfo.email.trim() !== '' &&
      customerInfo.phone.trim() !== '' &&
      customerInfo.whatsapp.trim() !== '' &&
      customerInfo.address.trim() !== '' &&
      customerInfo.city.trim() !== '' &&
      customerInfo.state.trim() !== ''
    );
  };

  const handlePaymentSuccess = (reference: any) => {
    setPaymentReference(reference?.reference || reference?.trxref || '');
    setStep('success');
    if (!isBuyNow) clearCart();
    clearBuyNowItem();
    message.success('Payment successful!');
  };

  const handleBack = () => {
    if (step === 'review') {
      setStep('info');
    } else {
      clearBuyNowItem();
      if (isBuyNow) {
        router.back();
      } else {
        router.push('/cart');
      }
    }
  };

  // ─── Empty state ──────────────────────────────────────────────────
  const isCheckoutEmpty = checkoutItems.length === 0 && step !== 'success';

  if (isCheckoutEmpty) {
    return (
      <div
        className={`min-h-[80vh] flex flex-col items-center justify-center ${
          isMobile ? 'px-4' : ''
        }`}
      >
        <ShoppingCart size={80} className="text-gray-300 dark:text-gray-600 mb-4" strokeWidth={1} />
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
          {isBuyNow ? 'No item selected' : 'Your cart is empty'}
        </h3>
        <p className="text-gray-500 dark:text-gray-400 mb-6">
          {isBuyNow
            ? 'The item you tried to buy is no longer available.'
            : 'Add items to your cart first'}
        </p>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => router.push('/')}
          className="bg-gradient-to-r from-blue to-indigo-600 text-white px-6 py-3 rounded-lg font-medium"
        >
          Browse Shop
        </motion.button>
      </div>
    );
  }

  // ─── Success ──────────────────────────────────────────────────────
  if (step === 'success') {
    return (
      <div
        className={`min-h-[80vh] flex flex-col items-center justify-center ${
          isMobile ? 'px-4' : ''
        }`}
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          className="mb-6"
        >
          <div className="w-24 h-24 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
            <CheckCircle size={48} className="text-green-500" />
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-center"
        >
          <h2 className="text-2xl font-bold dark:text-white mb-2">Payment Successful!</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-2">
            Your order has been placed successfully.
          </p>
          {paymentReference && (
            <p className="text-sm text-gray-400 dark:text-gray-500 mb-6">
              Reference: <span className="font-mono font-medium">{paymentReference}</span>
            </p>
          )}
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-8 max-w-md">
            Thank you for trusting Odogwu Laptops. A confirmation will be sent to{' '}
            <strong>{customerInfo.email}</strong>. We will reach out to you through your email,
            WhatsApp or phone number regarding delivery.
          </p>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => router.push('/')}
            className="bg-gradient-to-r from-blue to-indigo-600 text-white px-8 py-3 rounded-lg font-medium"
          >
            Continue Shopping
          </motion.button>
        </motion.div>
      </div>
    );
  }

  // ─── Checkout form ────────────────────────────────────────────────
  return (
    <div className={`min-h-screen ${isMobile ? 'px-3 pt-4 pb-24' : 'py-6'}`}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={handleBack}
          className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          <ArrowLeft size={20} />
        </motion.button>
        <div>
          <h1 className="text-2xl font-bold dark:text-white">Checkout</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {step === 'info' ? 'Step 1: Your Information' : 'Step 2: Review & Pay'}
          </p>
        </div>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-8">
        <div
          className={`flex-1 h-1.5 rounded-full transition-colors ${
            step === 'info' || step === 'review' ? 'bg-indigo-500' : 'bg-gray-200 dark:bg-gray-700'
          }`}
        />
        <div
          className={`flex-1 h-1.5 rounded-full transition-colors ${
            step === 'review' ? 'bg-indigo-500' : 'bg-gray-200 dark:bg-gray-700'
          }`}
        />
      </div>

      <div className={`flex ${isMobile ? 'flex-col' : 'gap-8'}`}>
        {/* ───── Main Content ───── */}
        <div className={`${isMobile ? 'w-full' : 'w-2/3'}`}>
          {/* ── Step 1: Customer Info ── */}
          {step === 'info' && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-5"
            >
              <h3 className="font-semibold text-lg mb-4 dark:text-white flex items-center gap-2">
                <User size={20} />
                Customer Information
              </h3>

              <div className="space-y-4">
                {/* Full Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Full Name *
                  </label>
                  <div className="relative">
                    <User
                      size={16}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                    <input
                      type="text"
                      name="fullName"
                      value={customerInfo.fullName}
                      onChange={handleInputChange}
                      placeholder="Enter your full name"
                      className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-sm"
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Email Address *
                  </label>
                  <div className="relative">
                    <Mail
                      size={16}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                    <input
                      type="email"
                      name="email"
                      value={customerInfo.email}
                      onChange={handleInputChange}
                      placeholder="you@example.com"
                      className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-sm"
                    />
                  </div>
                </div>

                {/* Phone Number */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Phone Number *
                  </label>
                  <div className="relative">
                    <Phone
                      size={16}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                    <input
                      type="tel"
                      name="phone"
                      value={customerInfo.phone}
                      onChange={handleInputChange}
                      placeholder="08012345678"
                      className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-sm"
                    />
                  </div>
                </div>

                {/* WhatsApp */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    WhatsApp Number *
                  </label>
                  <div className="relative">
                    <MessageCircle
                      size={16}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                    <input
                      type="tel"
                      name="whatsapp"
                      value={customerInfo.whatsapp}
                      onChange={handleInputChange}
                      placeholder="08012345678"
                      className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-sm"
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    We&apos;ll use this to send order updates via WhatsApp
                  </p>
                </div>

                {/* State (dynamic) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    State *
                  </label>
                  <SearchableSelect
                    options={states}
                    value={customerInfo.state}
                    onChange={handleStateChange}
                    placeholder="Select your state"
                    searchPlaceholder="Search states..."
                    loading={loadingStates}
                    icon={MapPin}
                  />
                  {customerInfo.state && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="mt-1.5 flex items-center gap-1.5"
                    >
                      <Truck size={12} className="text-indigo-500" />
                      <span className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">
                        Delivery: {numberFormat(deliveryFee / 100, Currencies.NGN)} ({deliveryZone})
                      </span>
                    </motion.div>
                  )}
                </div>

                {/* City (dynamic based on state) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    City *
                  </label>
                  {cities.length > 0 ? (
                    <SearchableSelect
                      options={cities}
                      value={customerInfo.city}
                      onChange={handleCityChange}
                      placeholder={customerInfo.state ? 'Select your city' : 'Select a state first'}
                      searchPlaceholder="Search cities..."
                      loading={loadingCities}
                      icon={MapPin}
                    />
                  ) : (
                    <div className="relative">
                      <MapPin
                        size={16}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                      />
                      <input
                        type="text"
                        name="city"
                        value={customerInfo.city}
                        onChange={handleInputChange}
                        placeholder={
                          loadingCities
                            ? 'Loading cities...'
                            : customerInfo.state
                              ? 'Type your city'
                              : 'Select a state first'
                        }
                        disabled={!customerInfo.state}
                        className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-sm disabled:opacity-50"
                      />
                    </div>
                  )}
                </div>

                {/* Street Address */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Street Address *
                  </label>
                  <div className="relative">
                    <MapPin size={16} className="absolute left-3 top-3 text-gray-400" />
                    <input
                      type="text"
                      name="address"
                      value={customerInfo.address}
                      onChange={handleInputChange}
                      placeholder="House number, street name"
                      className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-sm"
                    />
                  </div>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setStep('review')}
                disabled={!isInfoValid()}
                className={`w-full mt-6 py-3 rounded-lg font-medium flex items-center justify-center gap-2 transition-all ${
                  isInfoValid()
                    ? 'bg-gradient-to-r from-blue to-indigo-600 hover:from-blue hover:to-indigo-700 text-white shadow-sm'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
                }`}
              >
                Continue to Review
                <ArrowLeft size={16} className="rotate-180" />
              </motion.button>
            </motion.div>
          )}

          {/* ── Step 2: Review & Pay ── */}
          {step === 'review' && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-4"
            >
              {/* Customer Info Summary */}
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold dark:text-white flex items-center gap-2">
                    <User size={18} />
                    Delivery Information
                  </h3>
                  <button
                    onClick={() => setStep('info')}
                    className="text-sm text-indigo-500 hover:text-indigo-600 font-medium"
                  >
                    Edit
                  </button>
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                  <p className="font-medium">{customerInfo.fullName}</p>
                  <p>{customerInfo.email}</p>
                  <p>{customerInfo.phone}</p>
                  <p className="flex items-center gap-1">
                    <MessageCircle size={13} className="text-green-500" />
                    {customerInfo.whatsapp}
                  </p>
                  <p>
                    {customerInfo.address}, {customerInfo.city}, {customerInfo.state}
                  </p>
                </div>
              </div>

              {/* Order Items */}
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-5">
                <h3 className="font-semibold dark:text-white flex items-center gap-2 mb-4">
                  <ShoppingCart size={18} />
                  Order Items ({checkoutCount})
                </h3>
                <div className="space-y-3">
                  {checkoutItems.map((item) => (
                    <div key={item.id} className="flex items-center gap-3">
                      <div className="relative w-14 h-14 rounded-lg overflow-hidden flex-shrink-0">
                        <Image src={item.image} alt={item.itemName} fill className="object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium dark:text-white truncate">
                          {item.itemName}
                        </p>
                        <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                      </div>
                      <span className="text-sm font-semibold dark:text-white">
                        {numberFormat((item.price * item.quantity) / 100, Currencies.NGN)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment Section */}
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-5">
                <h3 className="font-semibold dark:text-white flex items-center gap-2 mb-4">
                  <CreditCard size={18} />
                  Payment
                </h3>

                <div className="flex items-center gap-2 mb-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <ShieldCheck size={18} className="text-green-500" />
                  <p className="text-sm text-green-700 dark:text-green-400">
                    Secure payment powered by Paystack
                  </p>
                </div>

                <PaystackButton
                  customerInfo={customerInfo}
                  checkoutItems={checkoutItems}
                  totalWithDelivery={totalWithDelivery}
                  onPaymentSuccess={handlePaymentSuccess}
                />
              </div>
            </motion.div>
          )}
        </div>

        {/* ───── Order Summary Sidebar ───── */}
        {step && (
          <div className={`${isMobile ? 'w-full mt-6' : 'w-1/3'}`}>
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-5 sticky top-4">
              <h3 className="font-semibold text-lg mb-4 dark:text-white">Order Summary</h3>

              <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
                {checkoutItems.map((item) => (
                  <div key={item.id} className="flex items-center gap-3">
                    <div className="relative w-14 h-14 rounded-lg overflow-hidden flex-shrink-0">
                      <Image src={item.image} alt={item.itemName} fill className="object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium dark:text-white truncate">
                        {item.itemName}
                      </p>
                      <p className="text-xs text-gray-400">x{item.quantity}</p>
                    </div>
                    <span className="text-xs font-semibold dark:text-white">
                      {numberFormat((item.price * item.quantity) / 100, Currencies.NGN)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-100 dark:border-gray-700 pt-3 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Subtotal</span>
                  <span className="font-medium dark:text-white">
                    {numberFormat(checkoutSubtotal / 100, Currencies.NGN)}
                  </span>
                </div>

                {/* Delivery fee */}
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400 flex items-center gap-1">
                    <Truck size={13} />
                    Delivery
                  </span>
                  {customerInfo.state ? (
                    <span className="font-medium dark:text-white">
                      {numberFormat(deliveryFee / 100, Currencies.NGN)}
                    </span>
                  ) : (
                    <span className="text-xs text-gray-400 italic">Select state</span>
                  )}
                </div>

                {customerInfo.state && deliveryZone && (
                  <div className="text-xs text-gray-400 dark:text-gray-500 text-right">
                    {deliveryZone}
                  </div>
                )}

                <div className="border-t border-gray-100 dark:border-gray-700 pt-2">
                  <div className="flex justify-between">
                    <span className="font-semibold dark:text-white">Total</span>
                    <span className="font-bold text-lg bg-gradient-to-r from-orange-500 to-rose-500 bg-clip-text text-transparent">
                      {numberFormat(
                        (customerInfo.state ? totalWithDelivery : checkoutSubtotal) / 100,
                        Currencies.NGN
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Checkout;
