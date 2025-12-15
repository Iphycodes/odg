'use client';
import React, { useEffect, useState } from 'react';
import { Modal, Input, Button } from 'antd';
import { motion } from 'framer-motion';
import { Search, Grid, List, X, BookmarkX } from 'lucide-react';
import { useSearchParams, useRouter } from 'next/navigation';
import { mockMarketItems } from '@grc/_shared/constant';
import ModernItemPost from '@grc/components/apps/item-post-new';
import ProductListingSkeleton from '../item-post-new/lib/product-listing-skeleton';
import { mediaSize, useMediaQuery } from '@grc/_shared/components/responsiveness';

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

  // Load saved items from localStorage
  const loadSavedItems = () => {
    try {
      const savedItemIds = JSON.parse(localStorage.getItem('savedItems') || '[]');
      // Filter mockMarketItems to only include saved items
      const saved = mockMarketItems.filter((item) => savedItemIds.includes(item.id));
      setSavedItems(saved);
      setFilteredItems(saved);
    } catch (error) {
      console.error('Error loading saved items:', error);
      setSavedItems([]);
      setFilteredItems([]);
    }
  };

  useEffect(() => {
    // Load saved items on mount
    loadSavedItems();

    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  // Listen for storage changes (when items are bookmarked/unbookmarked)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'savedItems') {
        loadSavedItems();
      }
    };

    // Custom event listener for same-tab updates
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

  // Comprehensive search function (matching market page logic)
  const handleSearch = () => {
    if (searchValue.trim() === '') {
      setFilteredItems(savedItems);
      setIsLoading(false);
      return;
    }

    const searchTerm = searchValue.toLowerCase().trim();

    const filtered = savedItems.filter((item) => {
      // Search in item name
      const nameMatch = item.itemName?.toLowerCase().includes(searchTerm);

      // Search in description
      const descriptionMatch = item.description?.toLowerCase().includes(searchTerm);

      // Search in category
      const categoryMatch = item.category?.toLowerCase().includes(searchTerm);

      // Search in product tags
      const tagsMatch = item.productTags?.some((tag: string) =>
        tag.toLowerCase().includes(searchTerm)
      );

      // Search in condition
      const conditionMatch = item.condition?.toLowerCase().includes(searchTerm);

      // Search in price (convert price to readable format)
      const priceString = (item.askingPrice?.price / 100).toString();
      const priceMatch = priceString.includes(searchTerm);

      // Search in business name
      const businessMatch = item.postUserProfile?.businessName?.toLowerCase().includes(searchTerm);

      // Search in username
      const usernameMatch = item.postUserProfile?.userName?.toLowerCase().includes(searchTerm);

      // Return true if any field matches
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
    }, 2000);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value);
  };

  const handleClearSearch = () => {
    setSearchValue('');
    setFilteredItems(savedItems); // Reset to all saved items
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearchWithDelay();
    }
  };

  // Auto-search when search value is cleared
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

  const handleChat = () => {
    console.log('Opening chat with vendor');
    router.push(`/chats`);
  };

  const handleImageClick = (item: any) => {
    setSelectedItem(item);
    setIsModalVisible(true);
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
        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
      >
        {filteredItems.map((item) => (
          <motion.div
            key={item.id}
            variants={itemVariants}
            className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-300"
          >
            {/* Image Container with Condition Badge */}
            <div className="relative aspect-square" onClick={() => handleImageClick(item)}>
              <img
                src={item?.postImgUrls?.[0]}
                alt={item?.itemName}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300 cursor-pointer"
              />
              <div className="absolute top-2 left-2">
                <span
                  className={`
                px-2 py-1 rounded-full text-xs font-medium
                ${
                  item?.condition === 'Brand New'
                    ? 'bg-green-500 text-white'
                    : item?.condition === 'Fairly Used'
                      ? 'bg-blue text-white'
                      : 'bg-yellow-500 text-white'
                }
              `}
                >
                  {item?.condition}
                </span>
              </div>
              {item?.sponsored && (
                <div className="absolute top-2 right-2">
                  <span className="bg-gray-900/70 text-white px-2 py-1 rounded-full text-xs">
                    Sponsored
                  </span>
                </div>
              )}
            </div>

            {/* Product Details */}
            <div className="p-3">
              {/* Title and Price Row */}
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-medium text-sm truncate flex-1 dark:text-white">
                  {item?.itemName}
                </h3>
                <span className="text-sm font-bold text-green-600 dark:text-green-400 whitespace-nowrap ml-2">
                  ${item?.askingPrice?.price}
                </span>
              </div>

              {/* Description and Action Row */}
              <div className="flex justify-between items-center">
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[55%]">
                  {item?.description}
                </p>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleChat();
                  }}
                  className="text-xs bg-blue hover:bg-blue text-white px-2 py-1 rounded-full flex items-center gap-1 transition-colors"
                >
                  Chat Seller
                </button>
              </div>
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
            />
          </motion.div>
        ))}
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen dark:bg-gray-900/50">
      <div className={`w-full max-w-7xl mx-auto ${isMobile ? 'px-0' : 'px-4'}`}>
        <div className="mb-8">
          <div
            className={`py-5 ${
              isMobile ? 'px-2' : ''
            } sticky top-0 z-20 backdrop-blur-sm bg-white dark:bg-gray-800`}
          >
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-xl font-semibold dark:text-white">My Saved Products</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {filteredItems.length} {filteredItems.length === 1 ? 'item' : 'items'} saved
                </p>
              </div>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => handleViewChange('grid')}
                  className={`flex items-center gap-2 ${
                    viewType === 'grid' ? 'text-blue-500' : 'text-gray-500 dark:text-gray-400'
                  }`}
                >
                  <Grid size={20} />
                  {!isMobile && 'Grid'}
                </button>
                <button
                  onClick={() => handleViewChange('list')}
                  className={`flex items-center gap-2 ${
                    viewType === 'list' ? 'text-blue-500' : 'text-gray-500 dark:text-gray-400'
                  }`}
                >
                  <List size={20} />
                  {!isMobile && 'List'}
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
                  placeholder="Search Saved Products..."
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
        <Modal
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
              condition={selectedItem?.condition ?? 'Brand New'}
              itemName={selectedItem?.itemName ?? ''}
              comments={selectedItem?.comments ?? []}
              id={selectedItem?.id ?? ''}
              productTags={selectedItem?.productTags ?? []}
            />
          )}
        </Modal>
      </div>
    </div>
  );
};

export default SavedItems;
