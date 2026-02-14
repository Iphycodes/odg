'use client';
import React, { useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight, ShoppingCart, Truck } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { AppContext } from '@grc/app-context';
import { numberFormat } from '@grc/_shared/helpers';
import { Currencies } from '@grc/_shared/constant';
import { mediaSize, useMediaQuery } from '@grc/_shared/components/responsiveness';
import { Empty } from 'antd';

const Cart = () => {
  const router = useRouter();
  const isMobile = useMediaQuery(mediaSize.mobile);
  const { cartItems, removeFromCart, updateQuantity, getCartTotal, getCartCount, clearCart } =
    useContext(AppContext);

  const handleCheckout = () => {
    router.push('/checkout');
  };

  const handleContinueShopping = () => {
    router.push('/');
  };

  if (cartItems.length === 0) {
    return (
      <div
        className={`min-h-[80vh] flex flex-col items-center justify-center ${
          isMobile ? 'px-4' : ''
        }`}
      >
        <Empty
          image={
            <ShoppingCart
              size={80}
              className="mx-auto text-gray-300 dark:text-gray-600"
              strokeWidth={1}
            />
          }
          description={
            <div className="text-center">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                Your cart is empty
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6">
                Browse our collection and add items to your cart
              </p>
            </div>
          }
        />
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleContinueShopping}
          className="bg-gradient-to-r from-indigo-500 to-blue-600 text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2"
        >
          <ShoppingBag size={18} />
          Browse Shop
        </motion.button>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isMobile ? 'px-3 pt-4' : 'py-6'}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold dark:text-white">Shopping Cart</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {getCartCount()} {getCartCount() === 1 ? 'item' : 'items'} in your cart
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={clearCart}
          className="text-sm text-red-500 hover:text-red-600 font-medium flex items-center gap-1"
        >
          <Trash2 size={14} />
          Clear Cart
        </motion.button>
      </div>

      <div className={`flex ${isMobile ? 'flex-col' : 'gap-8'}`}>
        {/* Cart Items */}
        <div className={`${isMobile ? 'w-full' : 'w-2/3'} space-y-4`}>
          <AnimatePresence>
            {cartItems.map((item) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -100 }}
                className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4 flex gap-4"
              >
                {/* Product Image */}
                <div className="relative w-24 h-24 md:w-32 md:h-32 rounded-lg overflow-hidden flex-shrink-0">
                  <Image src={item.image} alt={item.itemName} fill className="object-cover" />
                  <div className="absolute top-1 right-1">
                    <span
                      className={`px-1.5 py-0.5 rounded-full text-[9px] font-semibold backdrop-blur-sm ${
                        item.condition === 'Brand New'
                          ? 'bg-green-500/90 text-white'
                          : item.condition === 'Uk Used'
                            ? 'bg-blue-500/90 text-white'
                            : 'bg-yellow-500/90 text-white'
                      }`}
                    >
                      {item.condition}
                    </span>
                  </div>
                </div>

                {/* Product Details */}
                <div className="flex-1 flex flex-col justify-between min-w-0">
                  <div>
                    <h3 className="font-semibold text-sm md:text-base dark:text-white truncate">
                      {item.itemName}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      Seller: {item.sellerName}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-lg font-bold bg-gradient-to-r from-orange-500 to-rose-500 bg-clip-text text-transparent">
                        {numberFormat(item.price / 100, Currencies.NGN)}
                      </span>
                      {item.negotiable && (
                        <span className="text-[9px] bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 px-1.5 py-0.5 rounded-full font-medium">
                          Negotiable
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Quantity & Remove */}
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center gap-2">
                      <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="w-8 h-8 rounded-full border border-gray-200 dark:border-gray-600 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      >
                        <Minus size={14} />
                      </motion.button>
                      <span className="w-8 text-center font-medium text-sm">{item.quantity}</span>
                      <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-8 h-8 rounded-full border border-gray-200 dark:border-gray-600 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      >
                        <Plus size={14} />
                      </motion.button>
                    </div>

                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={() => removeFromCart(item.id)}
                      className="text-red-400 hover:text-red-500 p-2 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    >
                      <Trash2 size={16} />
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Order Summary */}
        <div className={`${isMobile ? 'w-full mt-6 mb-24' : 'w-1/3'}`}>
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-5 sticky top-4">
            <h3 className="font-semibold text-lg mb-4 dark:text-white">Order Summary</h3>

            <div className="space-y-3 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">
                  Subtotal ({getCartCount()} {getCartCount() === 1 ? 'item' : 'items'})
                </span>
                <span className="font-medium dark:text-white">
                  {numberFormat(getCartTotal() / 100, Currencies.NGN)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400 flex items-center gap-1">
                  <Truck size={13} />
                  Delivery
                </span>
                <span className="text-xs text-gray-400 italic">Calculated at checkout</span>
              </div>

              {/* Delivery info note */}
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 text-xs text-blue-700 dark:text-blue-300 space-y-1">
                <p className="font-medium flex items-center gap-1">
                  <Truck size={12} />
                  Delivery Zones
                </p>
                <p>Northern (near base): ₦3,000</p>
                <p>Middle belt / Far North: ₦5,000</p>
                <p>Southern states: ₦8,000</p>
              </div>

              <div className="border-t border-gray-100 dark:border-gray-700 pt-3">
                <div className="flex justify-between">
                  <span className="font-semibold dark:text-white">Subtotal</span>
                  <span className="font-bold text-lg bg-gradient-to-r from-orange-500 to-rose-500 bg-clip-text text-transparent">
                    {numberFormat(getCartTotal() / 100, Currencies.NGN)}
                  </span>
                </div>
                <p className="text-xs text-gray-400 mt-1">+ delivery fee at checkout</p>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleCheckout}
              className="w-full bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700 text-white py-3 rounded-lg font-medium flex items-center justify-center gap-2 shadow-sm transition-all"
            >
              Proceed to Checkout
              <ArrowRight size={18} />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleContinueShopping}
              className="w-full mt-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 py-3 rounded-lg font-medium flex items-center justify-center gap-2 transition-all"
            >
              <ShoppingBag size={18} />
              Continue Shopping
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
