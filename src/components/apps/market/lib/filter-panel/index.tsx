import { Currencies, mockMarketItems } from '@grc/_shared/constant';
import { numberFormat } from '@grc/_shared/helpers';
import { AppContext } from '@grc/app-context';
import { Slider, Tag } from 'antd';
import { AnimatePresence, motion } from 'framer-motion';
import { useContext, useState, useEffect } from 'react';

// Define types
type Condition = 'new' | 'fairly_used' | 'uk_used';
type Category = string;

// FilterPanel Component
const FilterPanel = ({
  setIsLoading,
  setShowFilters,
}: {
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  setShowFilters: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const [priceRange, setPriceRange] = useState<number[]>([0, 500000000]); // In cents
  const [selectedConditions, setSelectedConditions] = useState<Condition[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<Category[]>([]);
  const [activeSection, setActiveSection] = useState<'all' | 'price' | 'condition' | 'category'>(
    'all'
  );
  const { shopItems, setShopItems } = useContext(AppContext);
  const [originalItems] = useState(mockMarketItems); // Store original items

  const conditions: { value: Condition; label: string }[] = [
    { value: 'new', label: 'Brand New' },
    { value: 'uk_used', label: 'Uk Used' },
    { value: 'fairly_used', label: 'Fairly Used' },
  ];

  const categories: Category[] = ['Hp', 'Dell', 'Lenovo', 'Acer', 'Toshiba', 'Macbook', 'Samsung'];

  const sections = [
    { id: 'all' as const, label: 'All Filters' },
    { id: 'price' as const, label: 'Price Range' },
    { id: 'condition' as const, label: 'Condition' },
    { id: 'category' as const, label: 'Category' },
  ];

  const handleCategoryToggle = (category: Category) => {
    setSelectedCategories((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category]
    );
  };

  const normalizeCondition = (condition: string): Condition => {
    const normalized = condition.toLowerCase().replace(/\s+/g, '_');
    if (normalized === 'brand_new') return 'new';
    if (normalized === 'uk_used') return 'uk_used';
    if (normalized === 'fairly_used') return 'fairly_used';
    return normalized as Condition;
  };

  const applyFilters = () => {
    let filtered = [...originalItems];

    // Filter by price range
    filtered = filtered.filter((item) => {
      const price = (item.askingPrice?.price ?? 0) || 0;
      return price >= priceRange[0] && price <= priceRange[1];
    });

    // Filter by conditions
    if (selectedConditions.length > 0) {
      filtered = filtered.filter((item) => {
        const itemCondition = normalizeCondition(item.condition || '');
        return selectedConditions.includes(itemCondition);
      });
    }

    // Filter by categories
    if (selectedCategories.length > 0) {
      filtered = filtered.filter((item) => {
        const itemCategory = item.category?.toLowerCase();
        return selectedCategories.some((category) => category.toLowerCase() === itemCategory);
      });
    }

    setShopItems(filtered);
    setIsLoading(false);
  };

  const applyFilterWithDelay = () => {
    setIsLoading(true);
    setShowFilters(false);
    setTimeout(() => {
      applyFilters();
    }, 2000);
  };

  const resetFilters = () => {
    setSelectedCategories([]);
    setSelectedConditions([]);
    setPriceRange([0, 100000000]);
    setShopItems(originalItems);
  };

  // // Auto-apply filters when any filter changes (optional)
  useEffect(() => {
    applyFilters();
  }, [priceRange, selectedConditions, selectedCategories]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-white dark:bg-gray-800 rounded-lg mt-4"
    >
      {/* Filter Sections Tabs */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
        {sections.map((section) => (
          <button
            key={section.id}
            onClick={() => setActiveSection(section.id)}
            className={`px-4 py-2 rounded-lg text-sm whitespace-nowrap transition-colors
              ${
                activeSection === section.id
                  ? 'bg-blue-50 bg-gray-100 dark:bg-gray-700 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                  : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700'
              }`}
          >
            {section.label}
          </button>
        ))}
      </div>

      <div className="space-y-6">
        {/* Price Range */}
        <AnimatePresence>
          {(activeSection === 'all' || activeSection === 'price') && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="mb-4">
                <h3 className="text-sm font-medium mb-3">Price Range</h3>
                <div className="px-1">
                  <Slider
                    range
                    min={0}
                    max={500000000}
                    step={1000000}
                    value={priceRange}
                    onChange={(value: number[]) => setPriceRange(value)}
                    tooltip={{
                      formatter: (value) => numberFormat((value || 0) / 100, Currencies.NGN),
                    }}
                  />
                </div>

                <div className="flex justify-between text-sm text-gray-500 mt-1">
                  <span>{numberFormat(priceRange[0] / 100, Currencies.NGN)}</span>
                  <span>{numberFormat(priceRange[1] / 100, Currencies.NGN)}</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Conditions */}
        <AnimatePresence>
          {(activeSection === 'all' || activeSection === 'condition') && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="mb-4">
                <h3 className="text-sm font-medium mb-3">Condition</h3>
                <div className="flex flex-wrap gap-2">
                  {conditions.map((condition) => (
                    <Tag
                      key={condition.value}
                      className={`px-3 py-1 rounded-lg cursor-pointer text-sm transition-colors
                        ${
                          selectedConditions.includes(condition.value)
                            ? 'bg-blue text-white border-blue-200 dark:bg-blue-900/30 dark:text-blue-400'
                            : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700'
                        }`}
                      onClick={() => {
                        setSelectedConditions((prev) =>
                          prev.includes(condition.value)
                            ? prev.filter((c) => c !== condition.value)
                            : [...prev, condition.value]
                        );
                      }}
                    >
                      {condition.label}
                    </Tag>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Categories */}
        <AnimatePresence>
          {(activeSection === 'all' || activeSection === 'category') && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div>
                <h3 className="text-sm font-medium mb-3">Categories</h3>
                <div className="flex flex-wrap gap-2">
                  {categories.map((category) => (
                    <Tag
                      key={category}
                      className={`px-3 py-1 rounded-lg cursor-pointer text-sm transition-colors
                        ${
                          selectedCategories.includes(category)
                            ? 'bg-blue text-white border-blue-200 dark:bg-blue-900/30 dark:text-blue-400'
                            : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700'
                        }`}
                      onClick={() => handleCategoryToggle(category)}
                    >
                      {category}
                    </Tag>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Apply Filters Button */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="mt-6 flex justify-between items-center"
      >
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {shopItems.length} item{shopItems.length !== 1 ? 's' : ''} found
        </div>
        <div className="flex gap-3">
          <button
            onClick={resetFilters}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 transition-colors"
          >
            Reset
          </button>
          <button
            onClick={applyFilterWithDelay}
            className="px-6 py-2 bg-blue hover:bg-blue-600 text-white rounded-lg transition-colors text-sm"
          >
            Apply Filters
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default FilterPanel;
