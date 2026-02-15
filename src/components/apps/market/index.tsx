import React, { useContext, useEffect, useState } from 'react';
import { Badge, Col, Empty, Row, message as antMessage } from 'antd';
import { motion, AnimatePresence } from 'framer-motion';
import {
  SlidersHorizontal,
  Grid,
  List,
  MessageCircle,
  Bookmark,
  ShoppingCart,
  ShoppingBag,
} from 'lucide-react';
import { Tooltip } from 'antd';
import FilterPanel from './lib/filter-panel';
import SearchBar from './lib/search-bar';
import { mockMarketItems, Currencies } from '@grc/_shared/constant';
import ModernItemPost from '../item-post-new';
import ItemDetailModal from '../item-detail-modal';
import { mediaSize, useMediaQuery } from '@grc/_shared/components/responsiveness';
import { Shop } from 'iconsax-react';
import NotificationsDrawer from '../notification-drawer';
import { AppContext } from '@grc/app-context';
import ProductListingSkeleton from '../item-post-new/lib/product-listing-skeleton';
import Product from '../product';
import { numberFormat } from '@grc/_shared/helpers';
import Image from 'next/image';
import { useSearchParams, useRouter } from 'next/navigation';
import { CartItem } from '@grc/_shared/namespace/cart';
import { setBuyNowItem } from '@grc/_shared/namespace/buy';

const Market = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [viewType, setViewType] = useState(searchParams?.get('view') || 'list');
  const { toggleNotificationsDrawer } = useContext(AppContext);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [isSaved, setIsSaved] = useState<boolean>(false);

  // Modal state for grid view item detail
  const [gridModalOpen, setGridModalOpen] = useState(false);
  const [gridModalItem, setGridModalItem] = useState<any>(null);

  const isMobile = useMediaQuery(mediaSize.mobile);
  const { shopItems, setShopItems, addToCart, isInCart, cartItems } = useContext(AppContext);

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

      window.dispatchEvent(new Event('savedItemsChanged'));
    } catch (error) {
      console.error('Error managing bookmarks:', error);
    }
  };

  const handleAddToCart = (item: any) => {
    const maxQty = item?.quantity ?? 1;
    const existing = cartItems?.find((i: CartItem) => i.id === item?.id);
    const currentQty = existing?.quantity || 0;

    if (currentQty >= maxQty) {
      antMessage.warning(`Maximum quantity (${maxQty}) reached for this item`);
      return;
    }
    if (isInCart(item?.id)) {
      antMessage.info('Item is already in your cart');
      return;
    }
    const cartItem: CartItem = {
      id: item?.id,
      itemName: item?.itemName || '',
      description: item?.description || '',
      price: item?.askingPrice?.price || 0,
      quantity: 1,
      maxQuantity: maxQty,
      image: item?.postImgUrls?.[0] || '',
      condition: item?.condition || '',
      negotiable: item?.askingPrice?.negotiable || false,
      sellerName: item?.postUserProfile?.businessName || item?.postUserProfile?.userName || '',
    };
    addToCart(cartItem?.id);
    antMessage.success('Added to cart!');
  };

  const handleBuyNow = (item: any) => {
    const maxQty = item?.quantity ?? 1;
    const buyItem: CartItem = {
      id: item?.id,
      itemName: item?.itemName || '',
      description: item?.description || '',
      price: item?.askingPrice?.price || 0,
      quantity: 1,
      maxQuantity: maxQty,
      image: item?.postImgUrls?.[0] || '',
      condition: item?.condition || '',
      negotiable: item?.askingPrice?.negotiable || false,
      sellerName: item?.postUserProfile?.businessName || item?.postUserProfile?.userName || '',
    };
    setBuyNowItem(buyItem);
    router.push('/checkout?mode=buynow');
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

  useEffect(() => {
    console.log('toggle:::', toggleNotificationsDrawer);
  }, [toggleNotificationsDrawer]);

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

  /** Grid view: open modal on desktop, navigate on mobile */
  const handleGridItemClick = (item: any) => {
    if (isMobile) {
      setSelectedProductId(item?.id?.toString());
    } else {
      setGridModalItem(item);
      setGridModalOpen(true);
    }
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
        {shopItems?.map((item) => {
          const itemInCart = isInCart(item?.id ?? '');
          const isSoldOut = !item?.availability;
          const maxQty = item?.quantity ?? 1;
          const existing = cartItems?.find((i: CartItem) => i.id === item?.id);
          const currentQty = existing?.quantity || 0;
          const isMaxQty = currentQty >= maxQty;

          return (
            <motion.div
              key={item.id}
              variants={itemVariants}
              className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col"
            >
              {/* Image Container — click opens detail modal */}
              <div
                className="relative aspect-square cursor-pointer group overflow-hidden"
                onClick={() => handleGridItemClick(item)}
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

                {/* Low stock badge */}
                {item?.availability && maxQty > 0 && maxQty <= 5 && (
                  <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-sm text-white text-[9px] font-semibold px-1.5 py-0.5 rounded-full">
                    {maxQty} left
                  </div>
                )}
              </div>

              {/* Product Details */}
              <div className="p-3 flex flex-col flex-grow">
                {/* Title */}
                <h3
                  className="font-semibold text-sm dark:text-white mb-1 line-clamp-2 cursor-pointer hover:text-blue-600 transition-colors"
                  onClick={() => handleGridItemClick(item)}
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

                {/* Action Buttons */}
                <div className="space-y-1.5">
                  {/* Buy Now + Add to Cart row */}
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleBuyNow(item);
                      }}
                      disabled={isSoldOut}
                      className={`flex-1 py-2 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition-all shadow-sm ${
                        isSoldOut
                          ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                          : 'bg-gradient-to-r from-blue to-indigo-700 hover:from-blue hover:to-indigo-800 text-white hover:shadow-md'
                      }`}
                    >
                      <ShoppingBag size={14} />
                      Buy Now
                    </button>

                    {/* Add to Cart icon */}
                    <Tooltip
                      title={
                        isSoldOut
                          ? 'Sold out'
                          : isMaxQty
                            ? `Max qty (${maxQty})`
                            : itemInCart
                              ? 'In cart'
                              : 'Add to cart'
                      }
                    >
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddToCart(item);
                        }}
                        disabled={isSoldOut || isMaxQty}
                        className={`p-2 rounded-lg border shadow-sm transition-colors ${
                          isSoldOut || isMaxQty
                            ? 'bg-gray-100 border-gray-200 text-gray-300 cursor-not-allowed'
                            : itemInCart
                              ? 'bg-blue-50 border-blue-200 text-blue-600'
                              : 'bg-neutral-50 border-neutral-200 dark:bg-gray-700 dark:border-gray-600 text-gray-500 hover:border-blue-300 hover:text-blue-600'
                        }`}
                      >
                        <ShoppingCart size={14} />
                      </button>
                    </Tooltip>
                  </div>

                  {/* WhatsApp + Save row */}
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleWhatsAppMessage(item);
                      }}
                      className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white py-2 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition-all shadow-sm hover:shadow-md"
                    >
                      <MessageCircle size={14} />
                      WhatsApp
                    </button>
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleBookmark(item);
                      }}
                      className="p-2 rounded-lg border border-neutral-200 dark:border-gray-600 bg-neutral-50 dark:bg-gray-700 shadow-sm"
                    >
                      <Bookmark
                        size={16}
                        className={`${
                          isSaved ? 'fill-pink-500 text-pink-500' : 'text-gray-400'
                        } transition-colors`}
                      />
                    </motion.button>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </motion.div>
    );
  };

  const renderProductList = () => {
    if (shopItems?.length === 0) {
      return renderEmptyState();
    }

    return (
      <div className="space-y-6 max-w-4xl mx-auto">
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
              quantity={item?.quantity ?? 1}
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
      <Row gutter={[isMobile ? 0 : 24, 0]} className={`w-full max-w-screen-7xl mx-auto`}>
        {/* Main Content */}
        <Col
          lg={isMobile ? 24 : 24}
          className="relative w-full p-0"
          style={{ height: '100vh', overflowY: 'auto' }}
        >
          {/* Enhanced Search and Filter Bar */}
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="!sticky top-0 z-20 backdrop-blur-md bg-white/80 dark:bg-gray-900/80 shadow-sm"
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
                  <Tooltip title={'Grid View'}>
                    <button
                      onClick={() => handleViewChange('grid')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors text-sm ${
                        viewType === 'grid'
                          ? 'bg-indigo-50 text-black font-semibold dark:bg-blue/30 dark:text-blue-400'
                          : 'text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700'
                      }`}
                    >
                      <Grid size={16} />
                      {!isMobile && <span className="font-medium">Grid</span>}
                    </button>
                  </Tooltip>

                  <Tooltip title={'Grid View'}>
                    <button
                      onClick={() => handleViewChange('list')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors text-sm ${
                        viewType === 'list'
                          ? 'bg-indigo-50 text-black font-semibold dark:bg-blue-900/30 dark:text-blue-400'
                          : 'text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700'
                      }`}
                    >
                      <List size={16} />
                      {!isMobile && <span className="font-medium">List</span>}
                    </button>
                  </Tooltip>
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
          <div className={`${isMobile ? 'px-0 mb-10' : 'px-4'} py-6`}>
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
      </Row>

      {/* Grid View Item Detail Modal */}
      {gridModalItem && (
        <ItemDetailModal
          open={gridModalOpen}
          onClose={() => {
            setGridModalOpen(false);
            setGridModalItem(null);
          }}
          item={{
            description: gridModalItem?.description ?? '',
            sponsored: gridModalItem?.sponsored ?? false,
            postUserProfile: gridModalItem?.postUserProfile ?? {},
            postImgurls: gridModalItem?.postImgUrls ?? [],
            askingPrice: gridModalItem?.askingPrice ?? {},
            condition: gridModalItem?.condition ?? 'Brand New',
            comments: gridModalItem?.comments ?? [],
            itemName: gridModalItem?.itemName ?? '',
            id: gridModalItem?.id ?? '',
            productTags: gridModalItem?.productTags ?? [],
            quantity: gridModalItem?.quantity ?? 1,
          }}
        />
      )}

      <NotificationsDrawer />
    </div>
  );
};

export default Market;
