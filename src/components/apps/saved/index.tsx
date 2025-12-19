'use client';
import React, { useEffect, useState } from 'react';
import { Input, Button, Badge } from 'antd';
import { motion } from 'framer-motion';
import { Search, Grid, List, X, BookmarkX, MessageCircle, Bookmark } from 'lucide-react';
import { useSearchParams, useRouter } from 'next/navigation';
import { mockMarketItems } from '@grc/_shared/constant';
import ModernItemPost from '@grc/components/apps/item-post-new';
import ProductListingSkeleton from '../item-post-new/lib/product-listing-skeleton';
import { mediaSize, useMediaQuery } from '@grc/_shared/components/responsiveness';
import { Currencies } from '@grc/_shared/constant';
import { numberFormat } from '@grc/_shared/helpers';
import Image from 'next/image';
import Product from '../product';
import ItemDetailModal from '../item-detail-modal';

const SavedItems = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [viewType, setViewType] = useState(searchParams?.get('view') || 'list');
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [savedItems, setSavedItems] = useState<any[]>([]);
  const [filteredItems, setFilteredItems] = useState<any[]>([]);
  const [searchValue, setSearchValue] = useState('');
  const isMobile = useMediaQuery(mediaSize.mobile);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  // Load saved items from localStorage
  const loadSavedItems = () => {
    try {
      const savedItemIds = JSON.parse(localStorage.getItem('savedItems') || '[]');
      const saved = mockMarketItems.filter((item) => savedItemIds.includes(item.id));
      setSavedItems(saved);
      setFilteredItems(saved);
    } catch (error) {
      console.error('Error loading saved items:', error);
      setSavedItems([]);
      setFilteredItems([]);
    }
  };

  const handleBookmark = (item: any) => {
    try {
      const savedItems = JSON.parse(localStorage.getItem('savedItems') || '[]');

      if (isSaved) {
        const updatedItems = savedItems.filter((itemId: string | number) => itemId !== item?.id);
        localStorage.setItem('savedItems', JSON.stringify(updatedItems));
        setIsSaved(false);
      } else {
        if (!savedItems.includes(item?.id)) {
          savedItems.push(item?.id);
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
    loadSavedItems();
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'savedItems') {
        loadSavedItems();
      }
    };

    const handleCustomStorageChange = () => {
      loadSavedItems();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('savedItemsChanged', handleCustomStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('savedItemsChanged', handleCustomStorageChange);
    };
  }, []);

  const handleSearch = () => {
    if (searchValue.trim() === '') {
      setFilteredItems(savedItems);
      setIsLoading(false);
      return;
    }

    const searchTerm = searchValue.toLowerCase().trim();

    const filtered = savedItems.filter((item) => {
      const nameMatch = item.itemName?.toLowerCase().includes(searchTerm);
      const descriptionMatch = item.description?.toLowerCase().includes(searchTerm);
      const categoryMatch = item.category?.toLowerCase().includes(searchTerm);
      const tagsMatch = item.productTags?.some((tag: string) =>
        tag.toLowerCase().includes(searchTerm)
      );
      const conditionMatch = item.condition?.toLowerCase().includes(searchTerm);
      const priceString = (item.askingPrice?.price / 100).toString();
      const priceMatch = priceString.includes(searchTerm);
      const businessMatch = item.postUserProfile?.businessName?.toLowerCase().includes(searchTerm);
      const usernameMatch = item.postUserProfile?.userName?.toLowerCase().includes(searchTerm);

      return (
        nameMatch ||
        descriptionMatch ||
        categoryMatch ||
        tagsMatch ||
        conditionMatch ||
        priceMatch ||
        businessMatch ||
        usernameMatch
      );
    });

    setFilteredItems(filtered);
    setIsLoading(false);
  };

  const handleSearchWithDelay = () => {
    setIsLoading(true);
    setTimeout(() => {
      handleSearch();
    }, 1000);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value);
  };

  const handleClearSearch = () => {
    setSearchValue('');
    setFilteredItems(savedItems);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearchWithDelay();
    }
  };

  useEffect(() => {
    if (searchValue === '') {
      setFilteredItems(savedItems);
    }
  }, [searchValue, savedItems]);

  const handleViewChange = (view: string) => {
    setViewType(view);
    const newParams = new URLSearchParams(searchParams?.toString());
    newParams.set('view', view);
    router.push(`?${newParams.toString()}`, { scroll: false });
  };

  const handleWhatsAppMessage = (item: any) => {
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

  const handleImageClick = (item: any) => {
    if (!isMobile) {
      setSelectedItem(item);
      setIsModalVisible(true);
    } else {
      setSelectedItem(item);
      setSelectedProductId(item?.id);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, duration: 0.3 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  const renderEmptyState = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-16"
    >
      <BookmarkX
        size={80}
        className="mx-auto text-gray-300 dark:text-gray-600 mb-4"
        strokeWidth={1}
      />
      <div className="text-center">
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
          {searchValue ? 'No items found' : 'No saved items yet'}
        </h3>
        <p className="text-gray-500 dark:text-gray-400">
          {searchValue ? 'Try adjusting your search' : 'Start bookmarking items to see them here'}
        </p>
      </div>
    </motion.div>
  );

  const renderProductGrid = () => {
    if (filteredItems.length === 0) {
      return renderEmptyState();
    }

    return (
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4"
      >
        {filteredItems.map((item) => (
          <motion.div
            key={item.id}
            variants={itemVariants}
            className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col"
          >
            {/* Image Container */}
            <div
              className="relative aspect-square cursor-pointer group overflow-hidden"
              onClick={() => handleImageClick(item)}
            >
              <Image
                src={item?.postImgUrls?.[0]}
                alt={item?.itemName}
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-300"
              />

              {/* Availability Badge */}
              <Badge
                className={`absolute top-2 left-2 backdrop-blur-md !rounded-lg shadow-lg ${
                  item?.availability
                    ? 'bg-white/10 border border-emerald-300/30'
                    : 'bg-white/10 border border-gray-300/30'
                }`}
                count={
                  <div
                    className={`px-1 py-1 text-[10px] !flex gap-1 items-center font-semibold ${
                      item?.availability ? 'text-emerald-100' : 'text-gray-200'
                    }`}
                  >
                    <div
                      className={`w-1 h-1 rounded-full ${
                        item?.availability
                          ? 'bg-emerald-400 animate-pulse shadow-[0_0_12px_rgba(52,211,153,0.8)]'
                          : 'bg-gray-300'
                      }`}
                    />
                    <span>{item?.availability ? 'Available' : 'Sold Out'}</span>
                  </div>
                }
              />

              {/* Condition Badge */}
              <div className="absolute top-2 right-2">
                <span
                  className={`px-2 py-1 rounded-full text-[10px] font-semibold backdrop-blur-sm ${
                    item?.condition === 'Brand New'
                      ? 'bg-green-500/90 text-white'
                      : item?.condition === 'Uk Used'
                        ? 'bg-blue-500/90 text-white'
                        : 'bg-yellow-500/90 text-white'
                  }`}
                >
                  {item?.condition}
                </span>
              </div>
            </div>

            {/* Product Details */}
            <div className="p-3 flex flex-col flex-grow">
              {/* Title */}
              <h3
                className="font-semibold text-sm dark:text-white mb-1 line-clamp-2 cursor-pointer hover:text-blue-600 transition-colors"
                onClick={() => handleImageClick(item)}
              >
                {item?.itemName}
              </h3>

              {/* Price */}
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg font-bold bg-gradient-to-r from-orange-500 to-rose-500 bg-clip-text text-transparent">
                  {numberFormat(item?.askingPrice?.price / 100, Currencies.NGN)}
                </span>
                {item?.askingPrice?.negotiable && (
                  <span className="text-[9px] bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 px-1.5 py-0.5 rounded-full font-medium">
                    Negotiable
                  </span>
                )}
              </div>

              {/* Description */}
              <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mb-3 flex-grow">
                {item?.description}
              </p>

              {/* Tags */}
              {item?.productTags && item.productTags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3">
                  {item.productTags.slice(0, 2).map((tag: string, idx: number) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 text-[9px] font-medium bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-gray-400 rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                  {item.productTags.length > 2 && (
                    <span className="px-2 py-0.5 text-[9px] font-medium bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-gray-400 rounded-full">
                      +{item.productTags.length - 2}
                    </span>
                  )}
                </div>
              )}

              {/* Action Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleWhatsAppMessage(item);
                }}
                className="w-full mb-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white py-2 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition-all shadow-sm hover:shadow-md"
              >
                <MessageCircle size={14} />
                Message on WhatsApp
              </button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleBookmark(item)}
                className={`w-full bg-neutral-100 !text-neutral-700 border !border-neutral-200 py-2 rounded-lg font-medium flex items-center justify-center gap-1 shadow-sm text-xs`}
              >
                <Bookmark size={14} />
                {isSaved ? 'Remove from Save' : 'Save Item'}
              </motion.button>
            </div>
          </motion.div>
        ))}
      </motion.div>
    );
  };

  const renderProductList = () => {
    if (isLoading) {
      return (
        <div className="space-y-6">
          {[1, 2, 3].map((i) => (
            <div key={i}>
              <ProductListingSkeleton />
            </div>
          ))}
        </div>
      );
    }

    if (filteredItems.length === 0) {
      return renderEmptyState();
    }

    return (
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-6 max-w-3xl mx-auto"
      >
        {filteredItems.map((item) => (
          <motion.div
            key={item.id}
            variants={itemVariants}
            className="bg-white dark:bg-gray-800 rounded-lg transition-all duration-300"
          >
            <ModernItemPost
              postUserProfile={item?.postUserProfile ?? {}}
              sponsored={item?.sponsored ?? false}
              description={item?.description ?? ''}
              postImgurls={item?.postImgUrls ?? []}
              askingPrice={item?.askingPrice ?? {}}
              condition={item?.condition ?? 'Brand New'}
              itemName={item?.itemName ?? ''}
              comments={item?.comments ?? []}
              id={item?.id ?? ''}
              productTags={item?.productTags ?? []}
              availability={item?.availability ?? true}
            />
          </motion.div>
        ))}
      </motion.div>
    );
  };

  if (selectedProductId !== '' && isMobile) {
    return <Product productId={selectedProductId} setSelectedProductId={setSelectedProductId} />;
  }

  return (
    <div className="min-h-screen dark:bg-gray-900/50">
      <div className={`w-full max-w-7xl mx-auto ${isMobile ? 'px-0 pb-[40px]' : 'px-4'}`}>
        <div className="mb-8">
          <div
            className={`py-5 ${
              isMobile ? 'px-2' : ''
            } sticky top-0 z-20 backdrop-blur-sm bg-white/95 dark:bg-gray-800/95 shadow-sm`}
          >
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold dark:text-white">My Saved Products</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {filteredItems.length} {filteredItems.length === 1 ? 'item' : 'items'} saved
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleViewChange('grid')}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                    viewType === 'grid'
                      ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                      : 'text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700'
                  }`}
                >
                  <Grid size={18} />
                  {!isMobile && <span className="text-sm font-medium">Grid</span>}
                </button>
                <button
                  onClick={() => handleViewChange('list')}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                    viewType === 'list'
                      ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                      : 'text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700'
                  }`}
                >
                  <List size={18} />
                  {!isMobile && <span className="text-sm font-medium">List</span>}
                </button>
              </div>
            </div>

            {/* Search Bar */}
            <div className={`flex ${isMobile ? 'gap-0' : 'gap-2'}`}>
              <div className="flex-1 relative">
                <Search
                  className={`absolute ${
                    isMobile ? 'left-2' : 'left-4'
                  } top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none z-10`}
                  size={isMobile ? 16 : 18}
                />
                <Input
                  value={searchValue}
                  onChange={handleSearchChange}
                  onKeyPress={handleKeyPress}
                  placeholder="Search saved products..."
                  className={`${isMobile ? 'h-10' : 'h-12'} !w-full ${
                    isMobile ? 'pl-7' : 'pl-11'
                  } ${searchValue ? 'pr-10' : 'pr-4'} ${
                    isMobile ? 'rounded-lg rounded-r-none border-r-0' : 'rounded-xl'
                  } border-gray-200 hover:border-blue-400 focus:border-blue-500 transition-colors`}
                  style={{ width: '100%' }}
                />
                {searchValue && (
                  <X
                    size={16}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer z-10"
                    onClick={handleClearSearch}
                  />
                )}
              </div>
              <Button
                onClick={handleSearchWithDelay}
                className={`${
                  isMobile ? 'h-10' : 'h-12 px-6'
                } !bg-blue hover:bg-blue-600 !text-white hover:!text-white ${
                  isMobile ? 'rounded-lg rounded-l-none border-l-0' : 'rounded-xl'
                } transition-colors flex items-center gap-2`}
              >
                <Search size={isMobile ? 14 : 18} />
                {!isMobile && <span>Search</span>}
              </Button>
            </div>
          </div>

          {viewType === 'grid' ? renderProductGrid() : renderProductList()}
        </div>

        {/* Product Detail Modal */}
        {/* <Modal
          open={isModalVisible}
          onCancel={() => setIsModalVisible(false)}
          footer={null}
          width={800}
          className="product-detail-modal"
          closeIcon={<X className="text-gray-500" />}
        >
          {selectedItem && (
            <ModernItemPost
              postUserProfile={selectedItem?.postUserProfile ?? {}}
              sponsored={selectedItem?.sponsored ?? false}
              description={selectedItem?.description ?? ''}
              postImgurls={selectedItem?.postImgUrls ?? []}
              askingPrice={selectedItem?.askingPrice ?? {}}
              condition={selectedItem?.condition ?? ''}
              itemName={selectedItem?.itemName ?? ''}
              comments={selectedItem?.comments ?? []}
              id={selectedItem?.id ?? ''}
              productTags={selectedItem?.productTags ?? []}
              availability={selectedItem?.availability ?? true}
            />
          )}
        </Modal> */}

        <ItemDetailModal
          open={isModalVisible}
          onClose={() => setIsModalVisible(false)}
          item={{
            description: selectedItem?.description ?? '',
            sponsored: false,
            postUserProfile: selectedItem?.postUserProfile ?? {},
            postImgurls: selectedItem?.postImgUrls ?? [],
            askingPrice: selectedItem?.askingPrice ?? {},
            condition: selectedItem?.condition ?? '',
            comments: selectedItem?.comments ?? '',
            itemName: selectedItem?.itemName ?? '',
            id: selectedItem?.id ?? '',
            productTags: selectedItem?.productTags ?? [],
          }}
        />
      </div>
    </div>
  );
};

export default SavedItems;
