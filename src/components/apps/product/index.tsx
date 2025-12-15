'use client';

import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Currencies, mockMarketItems } from '@grc/_shared/constant';
import Image from 'next/image';
import {
  Bookmark,
  ChevronLeft,
  ChevronRight,
  Clock,
  MapPin,
  MessageCircle,
  Share2,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { mockMarketItemType } from '@grc/_shared/namespace';
import { numberFormat } from '@grc/_shared/helpers';
import { Badge, Button, Tooltip } from 'antd';
import { mediaSize, useMediaQuery } from '@grc/_shared/components/responsiveness';

interface ProductProps {
  productId: string;
  setSelectedProductId?: React.Dispatch<React.SetStateAction<string>>;
}

const Product = ({ productId, setSelectedProductId }: ProductProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [slideDirection, setSlideDirection] = useState(0);
  const [isSaved, setIsSaved] = useState(false);
  const { push } = useRouter();
  const isMobile = useMediaQuery(mediaSize.mobile);

  const item: Partial<mockMarketItemType> =
    mockMarketItems[
      Number(productId) === 0 || Number(productId) === 1 || Number(productId) === 2
        ? Number(productId)
        : 0
    ];

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, [productId]);

  // Check if item is saved on mount
  useEffect(() => {
    try {
      const savedItems = JSON.parse(localStorage.getItem('savedItems') || '[]');
      setIsSaved(savedItems.includes(item.id));
    } catch (error) {
      console.error('Error loading bookmarks:', error);
    }
  }, [item.id]);

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  const nextImage = () => {
    setSlideDirection(1);
    setCurrentImageIndex((prev) => (prev + 1) % (item?.postImgUrls?.length ?? 0));
  };

  const prevImage = () => {
    setSlideDirection(-1);
    setCurrentImageIndex(
      (prev) => (prev - 1 + (item?.postImgUrls?.length ?? 0)) % (item?.postImgUrls?.length ?? 0)
    );
  };

  const handleGoBack = () => {
    push('/');
    setSelectedProductId?.('');
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

  const handleWhatsAppMessage = () => {
    const phoneNumber = '2348109362830';
    const formattedPrice = numberFormat((item.askingPrice?.price ?? 0) / 100, Currencies.NGN);

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
      title: item.itemName || '',
      text: `Check out this item: ${item.itemName} - ${numberFormat(
        (item.askingPrice?.price ?? 0) / 100,
        Currencies.NGN
      )}`,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        alert('Link copied to clipboard!');
      }
    } catch (err) {
      console.error('Error sharing:', err);
    }
  };

  console.log(isLoading);

  return (
    <motion.div
      variants={itemVariants}
      className={`bg-white dark:bg-gray-800 rounded-lg transition-all duration-300 ${
        isMobile ? 'mt-0' : 'mt-10'
      }`}
    >
      <div className="sticky top-0 left-0 w-full py-4 !z-50 bg-white border-b mb-5">
        <Button
          type="link"
          onClick={() => handleGoBack()}
          className="text-neutral-500 hover:text-blue font-semibold flex text-base gap-1 items-center"
        >
          <i className="ri-arrow-left-s-line"></i>
          <span>Back</span>
        </Button>
      </div>
      <div className={`${isMobile ? 'px-2' : ''}`}>
        {/* Seller Info */}
        <div className="flex items-center gap-3 mb-6">
          <div className="relative w-12 h-12">
            <Image
              src={item.postUserProfile?.profilePicUrl ?? ''}
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

        <div className={`flex ${isMobile ? 'flex-col gap-4' : ' gap-8'}`}>
          {/* Left Section - Image */}
          <div
            className={`relative w-full md:w-3/5 overflow-hidden ${
              isMobile ? 'rounded-sm' : 'rounded-md'
            }`}
          >
            <div className="relative aspect-square">
              <AnimatePresence initial={false} custom={slideDirection}>
                <motion.div
                  key={currentImageIndex}
                  custom={slideDirection}
                  initial={{ x: slideDirection * 100 + '%', opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: slideDirection * -100 + '%', opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  className={`absolute inset-0 rounded-sm ${!isMobile ? 'cursor-pointer' : ''}`}
                >
                  <Image
                    src={item?.postImgUrls?.[currentImageIndex] ?? ''}
                    alt={item?.itemName ?? ''}
                    fill
                    className="object-cover"
                    priority
                  />
                </motion.div>
              </AnimatePresence>

              {/* Navigation controls */}
              {(item?.postImgUrls?.length ?? 0) > 1 && (
                <>
                  {currentImageIndex > 0 && (
                    <button
                      onClick={prevImage}
                      className={`absolute left-1 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white ${
                        isMobile ? 'p-1' : 'p-2'
                      } rounded-full backdrop-blur-sm transition-colors`}
                    >
                      <ChevronLeft className={`${isMobile ? 'w-4 h-4' : 'w-6 h-6'}`} />
                    </button>
                  )}

                  {currentImageIndex < (item?.postImgUrls?.length ?? 0) - 1 && (
                    <button
                      onClick={nextImage}
                      className={`absolute right-1 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white ${
                        isMobile ? 'p-1' : 'p-2'
                      } rounded-full backdrop-blur-sm transition-colors`}
                    >
                      <ChevronRight className={`${isMobile ? 'w-4 h-4' : 'w-6 h-6'}`} />
                    </button>
                  )}

                  {/* Dots indicator */}
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5">
                    {item?.postImgUrls?.map((_, index) => (
                      <div
                        key={index}
                        className={`w-2 h-2 rounded-full ${
                          currentImageIndex === index
                            ? 'bg-white'
                            : 'bg-white/30 border border-white/60'
                        } transition-all duration-200`}
                      />
                    ))}
                  </div>
                </>
              )}

              <Badge
                className="absolute top-3 right-3 backdrop-blur-lg !rounded-md"
                count={
                  <span className="px-2 py-1 text-sm text-white font-semibold">
                    {item?.condition}
                  </span>
                }
                color={item?.condition === 'Brand New' ? 'green' : 'blue'}
              />
            </div>
          </div>

          {/* Right Section - Details */}
          <div
            className={`${isMobile ? 'w-full' : 'w-1/2 !min-h-[100%] overflow-y-auto'} relative`}
          >
            {/* Item Details */}
            <div className="space-y-6">
              {isMobile && (
                <div className="flex items-center justify-end">
                  <div className="flex items-center gap-4">
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
                              ? 'fill-blue-500 text-blue-500'
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
              )}

              <div>
                <h2 className="text-xl font-semibold mb-1 cursor-pointer">{item?.itemName}</h2>
                <div className="flex items-center gap-3">
                  <span className="text-2xl font-bold bg-gradient-to-r from-orange-500 to-rose-500 bg-clip-text text-transparent">
                    {numberFormat((item.askingPrice?.price ?? 0) / 100, Currencies.NGN)}
                  </span>
                  {item.askingPrice?.negotiable && (
                    <span className="text-[12px] bg-gradient-to-r from-orange-50 to-rose-50 dark:from-orange-900/20 dark:to-rose-900/20 text-orange-600 dark:text-orange-400 px-2 py-1 rounded-full font-medium">
                      Negotiable
                    </span>
                  )}
                </div>
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

              {!isMobile && (
                <div className="flex items-center justify-end">
                  <div className="flex items-center gap-4">
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
                              ? 'fill-blue-500 text-blue-500'
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
              )}

              <div>
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

            {/* Action Button */}
            <div
              className={`${
                isMobile
                  ? 'fixed max-w-full bottom-[64px] py-4 left-0 px-2'
                  : 'absolute bottom-0 pt-4'
              } w-full bg-white mt-6 border-t`}
            >
              {/* <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleWhatsAppMessage}
                className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white py-3 rounded-lg font-medium flex items-center justify-center gap-2 shadow-sm"
              >
                <MessageCircle size={20} />
                Message on WhatsApp
              </motion.button> */}
              <div className="flex items-center gap-1">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleWhatsAppMessage}
                  className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white py-3 rounded-lg font-medium flex items-center justify-center gap-2 shadow-sm"
                >
                  <MessageCircle size={20} />
                  Whatsapp
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
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Product;
