import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge, Tooltip } from 'antd';
import { Bookmark, Share2, ChevronLeft, ChevronRight, MapPin, MessageCircle } from 'lucide-react';
import Image from 'next/image';
import { numberFormat } from '@grc/_shared/helpers';
import TruncatedDescription from '@grc/_shared/components/truncated-description';
import ItemDetailModal from '../item-detail-modal';
import { mediaSize, useMediaQuery } from '@grc/_shared/components/responsiveness';
import { Currencies } from '@grc/_shared/constant';

interface ItemPostProps {
  description: string;
  sponsored: boolean;
  postUserProfile: Record<string, any>;
  postImgurls: string[];
  askingPrice: Record<string, any>;
  condition: 'Brand New' | 'Fairly Used' | 'Uk Used';
  availability?: boolean;
  comments: Record<string, any>[];
  itemName: string;
  id: string | number;
  productTags?: string[];
  setSelectedProductId?: React.Dispatch<React.SetStateAction<string>>;
}

const ModernItemPost: React.FC<ItemPostProps> = ({
  description,
  sponsored,
  postUserProfile,
  postImgurls,
  askingPrice,
  condition,
  availability = true,
  comments,
  itemName,
  setSelectedProductId,
  id,
  productTags = [],
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isSaved, setIsSaved] = useState(false);
  const [slideDirection, setSlideDirection] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const isMobile = useMediaQuery(mediaSize.mobile);

  // Ref for touch swiping on mobile
  const imageContainerRef = useRef<HTMLDivElement>(null);
  const touchStartXRef = useRef<number | null>(null);

  const handleBookmark = () => {
    try {
      const savedItems = JSON.parse(localStorage.getItem('savedItems') || '[]');

      if (isSaved) {
        const updatedItems = savedItems.filter((itemId: string | number) => itemId !== id);
        localStorage.setItem('savedItems', JSON.stringify(updatedItems));
        setIsSaved(false);
      } else {
        if (!savedItems.includes(id)) {
          savedItems.push(id);
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
      setIsSaved(savedItems.includes(id));
    } catch (error) {
      console.error('Error loading bookmarks:', error);
    }
  }, [id, isModalOpen]);

  const nextImage = () => {
    if (currentImageIndex < postImgurls.length - 1) {
      setSlideDirection(1);
      setCurrentImageIndex((prev) => prev + 1);
    }
  };

  const prevImage = () => {
    if (currentImageIndex > 0) {
      setSlideDirection(-1);
      setCurrentImageIndex((prev) => prev - 1);
    }
  };

  const handleViewItem = () => {
    if (!isMobile) {
      setIsModalOpen(true);
    } else {
      setSelectedProductId?.(id?.toString());
    }
  };

  const handleWhatsAppMessage = () => {
    const phoneNumber = '2348109362830';
    const formattedPrice = numberFormat(askingPrice?.price / 100, Currencies.NGN);

    // Create the pre-filled message
    const message = `Hi, Odogwu laptops,
I am interested in this item.

${itemName}
${description}
Price: ${formattedPrice}`;

    // Encode the message for URL
    const encodedMessage = encodeURIComponent(message);

    // Create WhatsApp URL
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;

    // Open WhatsApp in a new tab
    window.open(whatsappUrl, '_blank');
  };

  const handleShare = async () => {
    const shareData = {
      title: itemName,
      text: `Check out this item: ${itemName} - ${numberFormat(
        askingPrice?.price / 100,
        Currencies.NGN
      )}`,
      url: `${window.location.href}/product/${id}`,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(window.location.href);
        alert('Link copied to clipboard!');
      }
    } catch (err) {
      console.error('Error sharing:', err);
    }
  };

  // Touch event handlers for swiping on mobile
  useEffect(() => {
    const imageContainer = imageContainerRef.current;
    if (!imageContainer || !isMobile) return;

    const handleTouchStart = (e: TouchEvent) => {
      touchStartXRef.current = e.touches[0].clientX;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (touchStartXRef.current === null) return;

      const touchEndX = e.changedTouches[0].clientX;
      const diffX = touchEndX - touchStartXRef.current;

      // Swipe threshold - only register swipes that move more than 50px
      if (Math.abs(diffX) > 50) {
        if (diffX > 0 && currentImageIndex > 0) {
          // Swipe right -> previous image
          prevImage();
        } else if (diffX < 0 && currentImageIndex < postImgurls.length - 1) {
          // Swipe left -> next image
          nextImage();
        }
      }

      touchStartXRef.current = null;
    };

    imageContainer.addEventListener('touchstart', handleTouchStart);
    imageContainer.addEventListener('touchend', handleTouchEnd);

    return () => {
      imageContainer.removeEventListener('touchstart', handleTouchStart);
      imageContainer.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isMobile, currentImageIndex, postImgurls.length]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full border-b border-gray-100 dark:border-zinc-800 py-8 first:pt-0"
    >
      {/* Seller info */}
      <div className={`flex items-center gap-3 mb-4 ${isMobile ? 'px-2' : ''}`}>
        <div className="relative w-10 h-10">
          <Image
            src={postUserProfile?.profilePicUrl}
            alt="Seller"
            fill
            className="rounded-full object-cover"
          />
          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-medium">
              {postUserProfile?.businessName || postUserProfile?.userName}
            </h3>
            {/* {sponsored && (
              <span className="text-xs bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-full font-medium">
                Sponsored
              </span>
            )} */}
          </div>
          <div className="flex items-center gap-3 text-[12px] text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-1">
              <MapPin size={14} />
              <span>Kaduna State, Zaria</span>
            </div>
            {/* <div className="flex items-center gap-1">
              <Clock size={14} />
              <span>2d ago</span>
            </div> */}
          </div>
        </div>
      </div>
      <div className={`flex flex-col md:flex-row w-full ${isMobile ? 'gap-2' : 'gap-8'}`}>
        {/* Left section - Product Images */}
        <div
          className={`relative w-full md:w-3/5 overflow-hidden ${
            isMobile ? 'rounded-sm' : 'rounded-md'
          }`}
        >
          <div ref={imageContainerRef} className="relative aspect-square">
            <AnimatePresence initial={false} custom={slideDirection}>
              <motion.div
                key={currentImageIndex}
                custom={slideDirection}
                initial={{ x: slideDirection * 100 + '%', opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: slideDirection * -100 + '%', opacity: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                className={`absolute inset-0 rounded-sm ${!isMobile ? 'cursor-pointer' : ''}`}
                onClick={() => {
                  if (!isMobile) {
                    handleViewItem();
                  }
                }}
              >
                <Image
                  src={postImgurls[currentImageIndex]}
                  alt={`Product image ${currentImageIndex + 1}`}
                  fill
                  className="object-cover"
                  priority
                />
              </motion.div>
            </AnimatePresence>

            {/* Navigation controls */}
            {postImgurls.length > 1 && (
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

                {currentImageIndex < postImgurls.length - 1 && (
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
                  {postImgurls.map((_, index) => (
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
              className="absolute top-3 right-3 backdrop-blur-2xl !rounded-full shadow-2xl"
              count={
                <span className="px-2 py-1 !text-[10px] !text-white font-semibold">
                  {condition}
                </span>
              }
              color={'white'}
            />

            <Badge
              className={`absolute top-3 left-3 backdrop-blur-2xl !rounded-full shadow-2xl ${
                availability
                  ? 'bg-gradient-to-br from-emerald-400/30 via-green-400/25 to-teal-400/30 border border-emerald-200/50'
                  : 'bg-gradient-to-br from-red-400/25 via-red-400/20 to-red-500/25 border border-red-200/40'
              }`}
              count={
                <div
                  className={`px-2 py-1 text-[10px] !flex gap-2 items-center font-semibold ${
                    availability
                      ? 'text-white drop-shadow-[0_2px_12px_rgba(16,185,129,0.8)]'
                      : 'text-gray-200 drop-shadow-[0_2px_8px_rgba(0,0,0,0.3)]'
                  }`}
                >
                  <div
                    className={`relative w-2 h-2 rounded-full ${
                      availability
                        ? 'bg-emerald-300 shadow-[0_0_16px_rgba(52,211,153,1)] animate-pulse'
                        : 'bg-red-300 shadow-[0_0_8px_rgba(156,163,175,0.6)]'
                    }`}
                  >
                    {availability && (
                      <div className="absolute inset-0 rounded-full bg-emerald-200 animate-ping opacity-75" />
                    )}
                  </div>
                  <span className="tracking-wide">{availability ? 'Available' : 'Sold Out'}</span>
                </div>
              }
              color={availability ? 'green' : 'default'}
            />
          </div>
        </div>

        {/* Right section - Product Details */}
        <div className={`w-full md:w-1/2 ${isMobile ? 'px-2' : ''} flex flex-col`}>
          {/* Action buttons (mobile) */}
          {isMobile && (
            <div className="mt-auto space-y-6 mb-5">
              <div className="flex items-center justify-end gap-4">
                {/* <Tooltip title={isSaved ? 'Remove from saved' : 'Save item'}>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setIsSaved(!isSaved)}
                    className="group"
                  >
                    <Bookmark
                      className={`w-7 h-7 ${
                        isSaved
                          ? 'fill-blue-500 text-blue-500'
                          : 'text-black group-hover:text-black'
                      } transition-colors`}
                    />
                  </motion.button>
                </Tooltip> */}

                {/* <Tooltip title="Share">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={handleShare}
                    className="group"
                  >
                    <Share2 className="w-7 h-7 text-black group-hover:text-black transition-colors" />
                  </motion.button>
                </Tooltip> */}
              </div>
            </div>
          )}

          {/* Product info */}
          <div className="space-y-3 mb-4">
            <div>
              <h2 className="text-xl font-semibold mb-1 cursor-pointer" onClick={handleViewItem}>
                {itemName}
              </h2>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold bg-gradient-to-r from-orange-500 to-rose-500 bg-clip-text text-transparent">
                  {numberFormat(askingPrice?.price / 100, Currencies.NGN)}
                </span>
                {askingPrice?.negotiable && (
                  <span className="text-[12px] bg-gradient-to-r from-orange-50 to-rose-50 dark:from-orange-900/20 dark:to-rose-900/20 text-orange-600 dark:text-orange-400 px-2 py-1 rounded-full font-medium">
                    Negotiable
                  </span>
                )}
              </div>
            </div>

            <TruncatedDescription description={description} max={100} />

            {/* Product Tags */}
            {productTags && productTags.length > 0 && (
              <div className="flex flex-wrap gap-2 py-2">
                {productTags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 text-xs font-medium bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-300 rounded-full hover:bg-gray-200 dark:hover:bg-zinc-700 transition-colors cursor-pointer"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Action buttons (desktop) */}
          {!isMobile && (
            <div className="mt-auto space-y-6 mb-3">
              <div className="flex items-center justify-end gap-4">
                {/* <Tooltip title={isSaved ? 'Remove from saved' : 'Save item'}>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setIsSaved(!isSaved)}
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

                {/* <Tooltip title="Share">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={handleShare}
                    className="group"
                  >
                    <Share2 className="w-6 h-6 text-gray-400 group-hover:text-gray-600 transition-colors" />
                  </motion.button>
                </Tooltip> */}
              </div>
            </div>
          )}

          {/* WhatsApp button */}
          <div className="flex items-center gap-1">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleWhatsAppMessage}
              className={
                'w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white py-3 rounded-lg font-medium flex items-center justify-center gap-1 shadow-sm'
              }
            >
              <MessageCircle size={20} />
              Whatsapp
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleBookmark}
              className={`w-full bg-neutral-100 !text-neutral-700 border !border-neutral-200 py-3 rounded-lg font-medium flex items-center justify-center gap-1 shadow-sm ${
                isSaved ? 'text-[10px]' : ''
              }`}
            >
              <Bookmark size={20} />
              {isSaved ? 'Remove from Save' : 'Save Item'}
            </motion.button>
            <Tooltip title="Share">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleShare}
                className="px-2 border border-neutral-200 py-3 rounded-lg font-medium flex items-center justify-center gap-1 shadow-sm"
              >
                <Share2 className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
              </motion.button>
            </Tooltip>
          </div>
          {/* <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleWhatsAppMessage}
            className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white py-3 rounded-lg font-medium flex items-center justify-center gap-2 shadow-sm"
          >
            <MessageCircle size={20} />
            Message on WhatsApp
          </motion.button> */}
        </div>
      </div>
      <ItemDetailModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        item={{
          description,
          sponsored,
          postUserProfile,
          postImgurls,
          askingPrice,
          condition,
          comments,
          itemName,
          id,
          productTags,
        }}
      />
    </motion.div>
  );
};

export default ModernItemPost;
