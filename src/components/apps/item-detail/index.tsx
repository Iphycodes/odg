import React, { useState, useEffect, useContext } from 'react';
import { Tag, Tooltip, message as antMessage } from 'antd';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bookmark,
  Share2,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Clock,
  MessageCircle,
  ShoppingCart,
  ShoppingBag,
} from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { numberFormat } from '@grc/_shared/helpers';
import { Currencies } from '@grc/_shared/constant';
import { capitalize, isEmpty, startCase } from 'lodash';
import { mediaSize, useMediaQuery } from '@grc/_shared/components/responsiveness';
import Cookie from 'js-cookie';
import { AppContext } from '@grc/app-context';
import { CartItem } from '@grc/_shared/namespace/cart';
import { setBuyNowItem } from '@grc/_shared/namespace/buy';

interface ItemDetailProps {
  item: {
    description: string;
    sponsored: boolean;
    postUserProfile: Record<string, any>;
    postImgurls: string[];
    askingPrice: Record<string, any>;
    condition: string;
    comments: Record<string, any>[];
    itemName: string;
    productTags?: string[];
    id: string | number;
    quantity?: number;
    status?: 'pending' | 'approved' | 'rejected';
    feePaymentStatus?:
      | 'pending'
      | 'processed'
      | 'awaiting payment'
      | 'awaiting approval'
      | undefined;
    platformFee?: number;
    live?: boolean;
  };
  isSellerView?: boolean;
  onClose?: () => void;
}

const ItemDetail: React.FC<ItemDetailProps> = ({ item, isSellerView }) => {
  const router = useRouter();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [slideDirection, setSlideDirection] = useState(0);
  const [isSaved, setIsSaved] = useState(false);
  const isMobile = useMediaQuery(mediaSize.mobile);
  const { addToCart, isInCart, cartItems } = useContext(AppContext);

  const itemInCart = isInCart(item?.id);
  const maxQuantity = item?.quantity ?? 1;
  const cartItem = cartItems?.find((i: CartItem) => i.id === item?.id);
  const cartQuantity = cartItem?.quantity || 0;
  const isMaxQuantityReached = cartQuantity >= maxQuantity;

  const buildCartItem = (): CartItem => ({
    id: item.id,
    itemName: item.itemName,
    description: item.description,
    price: item.askingPrice?.price || 0,
    quantity: 1,
    maxQuantity,
    image: item.postImgurls?.[0] || '',
    condition: item.condition,
    negotiable: item.askingPrice?.negotiable || false,
    sellerName: item.postUserProfile?.businessName || item.postUserProfile?.userName || '',
  });

  /** Add to cart only — no navigation */
  const handleAddToCart = () => {
    if (isMaxQuantityReached) {
      antMessage.warning(`Maximum quantity (${maxQuantity}) reached for this item`);
      return;
    }
    if (isInCart(item?.id)) {
      antMessage.info('Item is already in your cart');
      return;
    }
    addToCart(item?.id);
    antMessage.success('Added to cart!');
  };

  /** Store item in sessionStorage and navigate to checkout in buy-now mode */
  const handleBuyNow = () => {
    setBuyNowItem(buildCartItem());
    router.push('/checkout?mode=buynow');
  };

  const nextImage = () => {
    setSlideDirection(1);
    setCurrentImageIndex((prev) => (prev + 1) % item.postImgurls.length);
  };

  const prevImage = () => {
    setSlideDirection(-1);
    setCurrentImageIndex((prev) => (prev - 1 + item.postImgurls.length) % item.postImgurls.length);
  };

  const handleBookmark = () => {
    try {
      const savedItems = JSON.parse(localStorage.getItem('savedItems') || '[]');

      if (isSaved) {
        const updatedItems = savedItems.filter((itemId: string | number) => itemId !== item.id);
        localStorage.setItem('savedItems', JSON.stringify(updatedItems));
        setIsSaved(false);
      } else {
        if (!savedItems.includes(item.id)) {
          savedItems.push(item.id);
          localStorage.setItem('savedItems', JSON.stringify(savedItems));
        }
        setIsSaved(true);
      }

      window.dispatchEvent(new Event('savedItemsChanged'));
    } catch (error) {
      console.error('Error managing bookmarks:', error);
    }
  };

  useEffect(() => {
    try {
      const savedItems = JSON.parse(localStorage.getItem('savedItems') || '[]');
      setIsSaved(savedItems.includes(item?.id));
    } catch (error) {
      console.error('Error loading bookmarks:', error);
    }
  }, [item?.id]);

  const handleWhatsAppMessage = () => {
    const phoneNumber = '2348109362830';
    const formattedPrice = numberFormat(item?.askingPrice?.price / 100, Currencies.NGN);
    const affiliateId = Cookie.get('odg-laptops-affiliateId') ?? '';

    const message = `
Hi, Odogwu laptops,
I am interested in this item.

Item Id: ${item?.id}
Name: ${item?.itemName}
Description: ${item?.description}
Price: ${formattedPrice}
${!isEmpty(affiliateId) ? `Referral Code: ${affiliateId}` : ''}
`;

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleShare = async () => {
    const shareData = {
      title: item.itemName,
      text: `Check out this item: ${item.itemName} - ${numberFormat(
        item.askingPrice?.price / 100,
        Currencies.NGN
      )}`,
      url: `${window.location.origin}/product/${item?.id}`,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(`${window.location.origin}/product/${item?.id}`);
        alert('Link copied to clipboard!');
      }
    } catch (err) {
      console.error('Error sharing:', err);
    }
  };

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? '100%' : '-100%',
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction < 0 ? '100%' : '-100%',
      opacity: 0,
    }),
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'approved':
        return 'success';
      case 'pending':
        return 'warning';
      case 'rejected':
        return 'error';
      default:
        return 'default';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'processed':
        return 'success';
      case 'pending':
        return 'warning';
      case 'awaiting payment':
        return 'processing';
      default:
        return 'default';
    }
  };

  return (
    <div
      className={`relative bg-white dark:bg-gray-800 rounded-lg transition-all duration-300 ${
        isMobile ? 'px-3' : ''
      }`}
    >
      {/* Seller Info - Mobile */}
      {isMobile && (
        <div className="flex items-center gap-3 mb-6">
          <div className="relative w-12 h-12">
            <Image
              src={item.postUserProfile?.profilePicUrl}
              alt="Seller"
              fill
              className="rounded-full object-cover"
            />
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white" />
          </div>
          <div>
            <h3 className="font-medium text-lg">
              {item.postUserProfile?.businessName || item.postUserProfile?.userName}
            </h3>
            <div className="flex items-center gap-3 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <MapPin size={14} />
                Kaduna State, Zaria
              </span>
              <span className="flex items-center gap-1">
                <Clock size={14} />
                2d ago
              </span>
            </div>
          </div>
        </div>
      )}

      <div className={`flex ${isMobile ? 'flex-col' : ''}`}>
        {/* Left Section - Image */}
        <div className={`${isMobile ? 'w-full' : 'w-2/3'} relative`}>
          <div className="sticky top-0 h-full">
            <div className="relative aspect-square overflow-hidden">
              <AnimatePresence initial={false} custom={slideDirection} mode="popLayout">
                <motion.div
                  key={currentImageIndex}
                  custom={slideDirection}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{
                    x: { type: 'tween', duration: 0.25 },
                    position: { delay: 0 },
                  }}
                  className="w-full h-full"
                >
                  <Image
                    src={item.postImgurls[currentImageIndex]}
                    alt={item.itemName}
                    fill
                    className="object-cover"
                  />
                </motion.div>
              </AnimatePresence>

              {/* Low stock badge on image */}
              {maxQuantity > 0 && maxQuantity <= 5 && (
                <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-sm text-white text-xs font-semibold px-2.5 py-1 rounded-full">
                  Only {maxQuantity} left
                </div>
              )}
            </div>

            {item.postImgurls.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full backdrop-blur-sm"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full backdrop-blur-sm"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}
          </div>
        </div>

        {/* Right Section - Details */}
        <div
          className={`${isMobile ? 'w-full' : 'w-1/3 !min-h-[100%] overflow-y-auto p-5'} relative`}
        >
          {/* Seller Details - Desktop */}
          {!isMobile && (
            <div className="flex items-center gap-3 mb-6">
              <div className="relative w-12 h-12">
                <Image
                  src={item.postUserProfile?.profilePicUrl}
                  alt="Seller"
                  fill
                  className="rounded-full object-cover"
                />
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white" />
              </div>
              <div>
                <h3 className="font-medium text-lg">
                  {item.postUserProfile?.businessName || item.postUserProfile?.userName}
                </h3>
                <div className="flex items-center gap-3 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <MapPin size={14} />
                    Kaduna State, Zaria
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock size={14} />
                    2d ago
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Item Details */}
          <div className="space-y-6">
            <div className="flex justify-between">
              <div>
                {isSellerView && (
                  <div className="flex gap-1 items-center">
                    <span className="text-muted-foreground text-sm">PRD-01</span>
                    <Tag
                      className="rounded-3xl"
                      color={getStatusColor(item?.status?.toLowerCase() ?? '')}
                    >
                      {startCase(capitalize(item?.status)) ?? ''}
                    </Tag>
                  </div>
                )}
                <h2 className="text-xl font-semibold mb-1 cursor-pointer">{item.itemName}</h2>
                <div className="flex items-center gap-3">
                  <span className="text-2xl font-bold bg-gradient-to-r from-orange-500 to-rose-500 bg-clip-text text-transparent">
                    {numberFormat(item.askingPrice?.price / 100, Currencies?.NGN)}
                  </span>
                  {item.askingPrice?.negotiable && (
                    <span className="text-[12px] bg-gradient-to-r from-orange-50 to-rose-50 dark:from-orange-900/20 dark:to-rose-900/20 text-orange-600 dark:text-orange-400 px-2 py-1 rounded-full font-medium">
                      Negotiable
                    </span>
                  )}
                </div>
              </div>
              {isSellerView && (
                <div className="flex flex-col gap-1">
                  <span className="text-muted-foreground text-sm">
                    Platform Fee: {numberFormat((item?.platformFee ?? 0) / 100, Currencies.NGN)}
                  </span>
                  <div>
                    <Tag
                      className="rounded-3xl"
                      color={getPaymentStatusColor(item?.feePaymentStatus?.toLowerCase() ?? '')}
                    >
                      {startCase(capitalize(item?.feePaymentStatus)) ?? ''}
                    </Tag>
                    <span>
                      <Tooltip
                        title={
                          item?.feePaymentStatus === 'awaiting payment'
                            ? 'Proceed to Payment'
                            : 'View'
                        }
                      >
                        <i className="ri-arrow-right" />
                      </Tooltip>
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Product Tags */}
            {item.productTags && item.productTags.length > 0 && (
              <div className="flex flex-wrap gap-2 py-2">
                {item.productTags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 text-xs font-medium bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-300 rounded-full hover:bg-gray-200 dark:hover:bg-zinc-700 transition-colors cursor-pointer"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            <div className="flex items-center justify-end">
              <div className="flex items-center gap-3">
                <Tooltip title={isSaved ? 'Remove from saved' : 'Save item'}>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={handleBookmark}
                    className="group"
                  >
                    <Bookmark
                      className={`w-6 h-6 ${
                        isSaved
                          ? 'fill-pink-500 text-pink-500'
                          : 'text-gray-400 group-hover:text-gray-600'
                      } transition-colors`}
                    />
                  </motion.button>
                </Tooltip>

                <Tooltip title="Share">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={handleShare}
                    className="group"
                  >
                    <Share2 className="w-6 h-6 text-gray-400 group-hover:text-gray-600 transition-colors" />
                  </motion.button>
                </Tooltip>
              </div>
            </div>

            <div
              className={`${
                !isMobile ? 'max-h-[500px] overflow-y-scroll' : 'max-h-[500px] overflow-y-scroll'
              }`}
            >
              {/* Description */}
              <div className="bg-gray-50 rounded-lg p-3 mb-3">
                <h4 className="font-medium mb-2">Description</h4>
                <p className={`text-gray-600 ${!isDescriptionExpanded && 'line-clamp-3'}`}>
                  {item.description}
                </p>
                <button
                  onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                  className="text-blue-600 text-sm mt-2"
                >
                  Show {isDescriptionExpanded ? 'less' : 'more'}
                </button>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          {!isSellerView && (
            <div className="absolute w-[90%] flex flex-col gap-2 bottom-0 bg-white py-4 mt-6 border-t">
              {/* Buy Now + Add to Cart row */}
              <div className="flex items-center gap-1.5">
                {/* Buy Now → checkout */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleBuyNow}
                  className="flex-1 py-3 rounded-lg font-medium flex items-center justify-center gap-2 shadow-sm transition-all bg-gradient-to-r from-blue to-indigo-700 hover:from-blue hover:to-indigo-800 text-white hover:shadow-md"
                >
                  <ShoppingBag size={20} />
                  Buy Now
                </motion.button>

                {/* Add to Cart icon */}
                <Tooltip
                  title={
                    isMaxQuantityReached
                      ? `Max quantity (${maxQuantity}) reached`
                      : itemInCart
                        ? 'Already in cart'
                        : 'Add to cart'
                  }
                >
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={handleAddToCart}
                    disabled={isMaxQuantityReached}
                    className={`p-3 rounded-lg border shadow-sm transition-colors ${
                      isMaxQuantityReached
                        ? 'bg-gray-100 border-gray-200 text-gray-300 cursor-not-allowed'
                        : itemInCart
                          ? 'bg-blue-50 border-blue-200 text-blue-600'
                          : 'bg-neutral-100 border-neutral-200 text-gray-600 hover:border-blue-300 hover:text-blue-600'
                    }`}
                  >
                    <ShoppingCart size={20} />
                  </motion.button>
                </Tooltip>
              </div>

              {/* WhatsApp + Save + Share row */}
              <div className="flex items-center gap-1.5">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleWhatsAppMessage}
                  className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white py-3 rounded-lg font-medium flex items-center justify-center gap-2 shadow-sm"
                >
                  <MessageCircle size={20} />
                  WhatsApp
                </motion.button>

                <Tooltip title={isSaved ? 'Remove from saved' : 'Save item'}>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={handleBookmark}
                    className={`p-3 rounded-lg border shadow-sm transition-colors ${
                      isSaved ? 'bg-pink-50 border-pink-200' : 'bg-neutral-100 border-neutral-200'
                    }`}
                  >
                    <Bookmark
                      size={20}
                      className={`${
                        isSaved ? 'fill-pink-500 text-pink-500' : 'text-gray-500'
                      } transition-colors`}
                    />
                  </motion.button>
                </Tooltip>

                <Tooltip title="Share">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={handleShare}
                    className="p-3 rounded-lg border border-neutral-200 bg-neutral-100 shadow-sm"
                  >
                    <Share2 size={20} className="text-gray-500" />
                  </motion.button>
                </Tooltip>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ItemDetail;
