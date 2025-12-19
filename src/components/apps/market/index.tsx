import React, { useContext, useEffect, useState } from 'react';
import { Badge, Col, Empty, Row } from 'antd';
import { motion, AnimatePresence } from 'framer-motion';
import { SlidersHorizontal, Grid, List, MessageCircle, Bookmark } from 'lucide-react';
import SidePanel from './lib/side-panel';
import FilterPanel from './lib/filter-panel';
import SearchBar from './lib/search-bar';
import { mockMarketItems, Currencies } from '@grc/_shared/constant';
import ModernItemPost from '../item-post-new';
import { mediaSize, useMediaQuery } from '@grc/_shared/components/responsiveness';
import { Shop } from 'iconsax-react';
import NotificationsDrawer from '../notification-drawer';
import { AppContext } from '@grc/app-context';
import ProductListingSkeleton from '../item-post-new/lib/product-listing-skeleton';
import Product from '../product';
import { numberFormat } from '@grc/_shared/helpers';
import Image from 'next/image';
import { useSearchParams, useRouter } from 'next/navigation';

const Market = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [viewType, setViewType] = useState(searchParams?.get('view') || 'list');
  const { toggleNotificationsDrawer } = useContext(AppContext);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [isSaved, setIsSaved] = useState<boolean>(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);
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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        duration: 0.3,
      },
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

  const isMobile = useMediaQuery(mediaSize.mobile);
  const isDesktop = useMediaQuery(mediaSize.desktop);

  useEffect(() => {
    console.log('toggle:::', toggleNotificationsDrawer);
  }, [toggleNotificationsDrawer]);

  const { shopItems, setShopItems } = useContext(AppContext);

  const handleSearch = (searchValue: string, searchCategory: string) => {
    if (!searchValue.trim() && searchCategory === 'all') {
      setShopItems(mockMarketItems);
      setIsLoading(false);
      return;
    }

    const searchTerm = searchValue.toLowerCase().trim();

    const filteredItems = mockMarketItems.filter((item) => {
      const categoryMatch =
        searchCategory === 'all' || item.category?.toLowerCase() === searchCategory.toLowerCase();

      if (!categoryMatch) return false;
      if (!searchTerm) return true;

      const nameMatch = item.itemName?.toLowerCase().includes(searchTerm);
      const descriptionMatch = item.description?.toLowerCase().includes(searchTerm);
      const categoryTextMatch = item.category?.toLowerCase().includes(searchTerm);
      const tagsMatch = item.productTags?.some((tag) => tag.toLowerCase().includes(searchTerm));
      const conditionMatch = item.condition?.toLowerCase().includes(searchTerm);
      const priceString = ((item?.askingPrice?.price ?? 0) / 100).toString();
      const priceMatch = priceString.includes(searchTerm);
      const businessMatch = item.postUserProfile?.businessName?.toLowerCase().includes(searchTerm);
      const usernameMatch = item.postUserProfile?.userName?.toLowerCase().includes(searchTerm);

      return (
        nameMatch ||
        descriptionMatch ||
        categoryTextMatch ||
        tagsMatch ||
        conditionMatch ||
        priceMatch ||
        businessMatch ||
        usernameMatch
      );
    });

    setShopItems(filteredItems);
    setIsLoading(false);
  };

  const handleSearchWithDelay = (searchValue: string, searchCategory: string) => {
    setIsLoading(true);
    setTimeout(() => {
      handleSearch(searchValue, searchCategory);
    }, 2000);
  };

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
    setSelectedProductId(item?.id?.toString());
  };

  const renderEmptyState = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-16"
    >
      <Empty
        image={
          <Shop size={80} className="mx-auto text-gray-300 dark:text-gray-600" strokeWidth={1} />
        }
        description={
          <div className="text-center">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              {'No items'}
            </h3>
            <p className="text-gray-500 dark:text-gray-400">{'No Items found here'}</p>
          </div>
        }
      />
    </motion.div>
  );

  const renderProductGrid = () => {
    if (shopItems?.length === 0) {
      return renderEmptyState();
    }

    return (
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4"
      >
        {shopItems?.map((item) => (
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
                src={item?.postImgUrls?.[0] ?? ''}
                alt={item?.itemName ?? ''}
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

              {item?.sponsored && (
                <div className="absolute bottom-2 left-2">
                  <span className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-2 py-1 rounded-full text-[10px] font-semibold shadow-lg">
                    Sponsored
                  </span>
                </div>
              )}
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
                  {numberFormat((item?.askingPrice?.price ?? 0) / 100, Currencies.NGN)}
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
    if (shopItems?.length === 0) {
      return renderEmptyState();
    }

    return (
      <div className="space-y-6 max-w-3xl mx-auto">
        {shopItems?.map((item, idx) => (
          <div key={idx}>
            <ModernItemPost
              postUserProfile={item?.postUserProfile ?? {}}
              sponsored={item?.sponsored ?? false}
              description={item?.description ?? ''}
              postImgurls={item?.postImgUrls ?? []}
              askingPrice={item?.askingPrice ?? {}}
              condition={item?.condition ?? 'Brand New'}
              itemName={item?.itemName ?? ''}
              comments={item?.comments ?? []}
              productTags={item?.productTags ?? []}
              id={item?.id ?? ''}
              setSelectedProductId={setSelectedProductId}
              availability={item?.availability ?? true}
            />
          </div>
        ))}
      </div>
    );
  };

  if (selectedProductId !== '' && isMobile) {
    return <Product productId={selectedProductId} setSelectedProductId={setSelectedProductId} />;
  }

  return (
    <div className="min-h-screen dark:bg-gray-900/50 w-full">
      <Row gutter={[isMobile ? 0 : 24, 0]} className="w-full max-w-screen-7xl mx-auto">
        {/* Main Content */}
        <Col
          lg={isMobile ? 24 : 15}
          className="relative w-full p-0"
          style={{ height: '100vh', overflowY: 'auto' }}
        >
          {/* Enhanced Search and Filter Bar */}
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="sticky top-0 z-20 backdrop-blur-md bg-white/80 dark:bg-gray-900/80 shadow-sm"
          >
            <div className={`p-4 ${isMobile ? 'px-1 pt-2' : ''}`}>
              <div className="w-full flex items-center justify-between gap-3 mb-3">
                <div className="flex-1">
                  <SearchBar section="market" onSearch={handleSearchWithDelay} />
                </div>
              </div>

              <div className="flex items-center justify-between gap-2">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 transition-colors"
                >
                  <SlidersHorizontal size={16} />
                  {showFilters ? 'Hide Filters' : 'Show Filters'}
                </button>

                {/* View Toggle */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleViewChange('grid')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors text-sm ${
                      viewType === 'grid'
                        ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                        : 'text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700'
                    }`}
                  >
                    <Grid size={16} />
                    {!isMobile && <span className="font-medium">Grid</span>}
                  </button>
                  <button
                    onClick={() => handleViewChange('list')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors text-sm ${
                      viewType === 'list'
                        ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                        : 'text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700'
                    }`}
                  >
                    <List size={16} />
                    {!isMobile && <span className="font-medium">List</span>}
                  </button>
                </div>
              </div>

              <AnimatePresence>
                {showFilters && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <FilterPanel setIsLoading={setIsLoading} setShowFilters={setShowFilters} />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Items Grid */}
          <div className={`${isMobile ? 'px-0' : 'px-4'} py-6`}>
            {isLoading ? (
              <div className="space-y-6">
                {[1, 2, 3].map((i) => (
                  <div key={i}>
                    <ProductListingSkeleton />
                  </div>
                ))}
              </div>
            ) : (
              <motion.div variants={containerVariants} initial="hidden" animate="visible">
                {viewType === 'grid' ? renderProductGrid() : renderProductList()}
              </motion.div>
            )}
          </div>
        </Col>

        {/* Side Panel */}
        {isDesktop && (
          <Col lg={9}>
            <motion.div
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.4 }}
              className="sticky top-0 pt-4"
            >
              <div className="bg-white dark:bg-gray-800 border border-neutral-50 rounded-lg shadow-sm">
                <SidePanel />
              </div>
            </motion.div>
          </Col>
        )}
      </Row>

      <NotificationsDrawer />
    </div>
  );
};

export default Market;
