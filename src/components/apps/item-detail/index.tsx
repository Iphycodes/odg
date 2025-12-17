import React, { useState, useEffect } from 'react';
import { Tag, Tooltip } from 'antd';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bookmark,
  Share2,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Clock,
  MessageCircle,
} from 'lucide-react';
import Image from 'next/image';
import { numberFormat } from '@grc/_shared/helpers';
import { Currencies } from '@grc/_shared/constant';
import { capitalize, startCase } from 'lodash';
import { mediaSize, useMediaQuery } from '@grc/_shared/components/responsiveness';

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
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [slideDirection, setSlideDirection] = useState(0);
  const [isSaved, setIsSaved] = useState(false);
  const isMobile = useMediaQuery(mediaSize.mobile);

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

      // Dispatch custom event to notify other components
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
    const formattedPrice = numberFormat(item.askingPrice?.price / 100, Currencies.NGN);

    const message = `Hi, Odogwu laptops,
I am interested in this item.

${item.itemName}
${item.description}
Price: ${formattedPrice}`;

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

  useEffect(() => {
    try {
      const savedItems = JSON.parse(localStorage.getItem('savedItems') || '[]');
      setIsSaved(savedItems.includes(item.id));
    } catch (error) {
      console.error('Error loading bookmarks:', error);
    }
  }, [item.id]);

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
      {/* Seller Info */}
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
          {/* Seller Details */}
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
              <div className="flex items-center gap-4">
                {/* <Tooltip title={isSaved ? 'Remove from saved' : 'Save item'}>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={handleBookmark}
                    className="group"
                  >
                    <Bookmark
                      className={`w-6 h-6 ${
                        isSaved
                          ? 'fill-blue-500 text-blue-500'
                          : 'text-gray-400 group-hover:text-gray-600'
                      } transition-colors`}
                    />
                  </motion.button>
                </Tooltip> */}

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
            <div className="absolute w-[90%] flex gap-1 items-center bottom-0 bg-white py-4 mt-6 border-t">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleWhatsAppMessage}
                className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white py-3 rounded-lg font-medium flex items-center justify-center gap-2 shadow-sm"
              >
                <MessageCircle size={20} />
                WhatsApp
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleBookmark}
                className={`w-full bg-neutral-100 !text-neutral-700 border !border-neutral-200 py-3 rounded-lg font-medium flex items-center justify-center gap-2 shadow-sm ${
                  isSaved ? 'text-xs' : ''
                }`}
              >
                <Bookmark size={20} />
                {isSaved ? 'Remove from Save' : 'Save Item'}
              </motion.button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ItemDetail;
