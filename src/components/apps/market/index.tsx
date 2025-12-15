import React, { useContext, useEffect, useState } from 'react';
import { Col, Empty, Row } from 'antd';
import { motion, AnimatePresence } from 'framer-motion';
import { SlidersHorizontal } from 'lucide-react';
import SidePanel from './lib/side-panel';
import FilterPanel from './lib/filter-panel';
import SearchBar from './lib/search-bar';
import { mockMarketItems } from '@grc/_shared/constant';
import ModernItemPost from '../item-post-new';
import { mediaSize, useMediaQuery } from '@grc/_shared/components/responsiveness';
import { Shop } from 'iconsax-react';
import NotificationsDrawer from '../notification-drawer';
import { AppContext } from '@grc/app-context';
import ProductListingSkeleton from '../item-post-new/lib/product-listing-skeleton';
import Product from '../product';

const Market = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const { toggleNotificationsDrawer } = useContext(AppContext);
  const [selectedProductId, setSelectedProductId] = useState('');
  // const [selectedCommentsData, setSelectedCommentsData] = useState({});
  // Simulate initial loading
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

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

  // const itemVariants = {
  //   hidden: { opacity: 0, y: 20 },
  //   visible: {
  //     opacity: 1,
  //     y: 0,
  //     transition: { duration: 0.5 },
  //   },
  // };

  const isMobile = useMediaQuery(mediaSize.mobile);
  const isDesktop = useMediaQuery(mediaSize.desktop);

  useEffect(() => {
    console.log('toggle:::', toggleNotificationsDrawer);
  }, [toggleNotificationsDrawer]);

  const { shopItems, setShopItems } = useContext(AppContext);

  const handleSearch = (searchValue: string, searchCategory: string) => {
    // If search is empty and category is 'all', reset to original items

    if (!searchValue.trim() && searchCategory === 'all') {
      setShopItems(mockMarketItems); // Reset to original data
      setIsLoading(false);
      return;
    }

    const searchTerm = searchValue.toLowerCase().trim();

    const filteredItems = mockMarketItems.filter((item) => {
      // Category filter
      const categoryMatch =
        searchCategory === 'all' || item.category?.toLowerCase() === searchCategory.toLowerCase();

      // If category doesn't match, skip this item
      if (!categoryMatch) return false;

      // If no search term, return all items in the category
      if (!searchTerm) return true;

      // Search in item name
      const nameMatch = item.itemName?.toLowerCase().includes(searchTerm);

      // Search in description
      const descriptionMatch = item.description?.toLowerCase().includes(searchTerm);

      // Search in category
      const categoryTextMatch = item.category?.toLowerCase().includes(searchTerm);

      // Search in product tags
      const tagsMatch = item.productTags?.some((tag) => tag.toLowerCase().includes(searchTerm));

      // Search in condition
      const conditionMatch = item.condition?.toLowerCase().includes(searchTerm);

      // Search in price (convert price to readable format)
      const priceString = ((item?.askingPrice?.price ?? 0) / 100).toString();
      const priceMatch = priceString.includes(searchTerm);

      // Search in business name
      const businessMatch = item.postUserProfile?.businessName?.toLowerCase().includes(searchTerm);

      // Search in username
      const usernameMatch = item.postUserProfile?.userName?.toLowerCase().includes(searchTerm);

      // Return true if any field matches
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

  if (selectedProductId !== '' && isMobile) {
    return <Product productId={selectedProductId} setSelectedProductId={setSelectedProductId} />;
  }

  return (
    <div className="min-h-screen dark:bg-gray-900/50 w-full">
      <Row gutter={[isMobile ? 0 : 24, 0]} className="w-full max-w-screen-7xl mx-auto">
        {/* Main Content */}
        <Col lg={isMobile ? 24 : 15} className="relative w-full p-0">
          {/* Enhanced Search and Filter Bar */}
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="sticky top-0 z-20 backdrop-blur-md bg-white/80 dark:bg-gray-900/80 shadow-sm"
          >
            <div className={`p-4 ${isMobile ? 'px-1 pt-2' : ''}`}>
              <div className="w-full flex items-center justify-between gap-3">
                <div className="flex-1">
                  <SearchBar section="market" onSearch={handleSearchWithDelay} />
                </div>

                {/* {isMobile && (
                  <div
                    className="cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      setToggleNotificationsDrawer(false);
                      // console.log('toggle:::', toggleNotificationsDrawer);
                    }}
                  >
                    <Badge count={5} size="small">
                      <Notification variant="Bulk" color="#1e88e5" size={24} />
                    </Badge>
                  </div>
                )}
                {isMobile && <UserDropdown />} */}
              </div>

              <div className="flex items-center gap-2 mt-3 mb-1">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 transition-colors"
                >
                  <SlidersHorizontal size={16} />
                  {showFilters ? 'Hide Filters' : 'Show Filters'}
                </button>
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
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-6"
            >
              {isLoading ? (
                <div className="space-y-6">
                  {[1, 2, 3].map((i) => (
                    <div key={i}>
                      <ProductListingSkeleton />
                    </div>
                  ))}
                </div>
              ) : (
                <>
                  {shopItems?.length === 0 ? (
                    renderEmptyState()
                  ) : (
                    <>
                      {shopItems?.map((item, idx) => (
                        // <motion.div
                        //   key={idx}
                        //   variants={itemVariants}
                        //   className="bg-white dark:bg-gray-800 rounded-lg transition-all duration-300"
                        // >
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
                          />
                        </div>

                        // </motion.div>
                      ))}
                    </>
                  )}
                </>
              )}
            </motion.div>
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
