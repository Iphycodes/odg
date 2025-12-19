import React, { useState } from 'react';
import { Button, Input, Select } from 'antd';
import { Search, X, ChevronDown } from 'lucide-react';
import { mediaSize, useMediaQuery } from '@grc/_shared/components/responsiveness';

// Interface for the SearchBar props
interface SearchBarProps {
  onSearch: (searchValue: string, category: string) => void;
  className?: string;
  section: 'sell-item' | 'market';
}

// Interface for category options
interface CategoryOption {
  value: string;
  label: string;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch, className, section }) => {
  const [searchValue, setSearchValue] = useState<string>('');
  const [searchCategory, setSearchCategory] = useState<string>('all');
  const isMobile = useMediaQuery(mediaSize.mobile);

  const categories: CategoryOption[] = [
    { value: 'all', label: 'All Categories' },
    { value: 'hp', label: 'Hp' },
    { value: 'dell', label: 'Dell' },
    { value: 'acer', label: 'Acer' },
    { value: 'asus', label: 'Asus' },
    { value: 'lenovo', label: 'Lenovo' },
    { value: 'toshiba', label: 'Toshiba' },
    { value: 'macbook', label: 'MacBook' },
    { value: 'accessories', label: 'Chargers' },
  ];

  const statusOptions: CategoryOption[] = [
    { value: 'all', label: 'All Status' },
    { value: 'approved', label: 'Approved' },
    { value: 'pending', label: 'Pending' },
    { value: 'rejected', label: 'Rejected' },
  ];

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value === '') {
      onSearch('', searchCategory);
    }
    setSearchValue(e.target.value);
  };

  const handleClearSearch = () => {
    setSearchValue('');
    onSearch('', searchCategory);
  };

  const handleSearch = () => {
    onSearch(searchValue, searchCategory);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleChangeCategory = (value: string) => {
    setSearchCategory(value);

    // Trigger search with current search value and new category
    onSearch(searchValue, value);
  };

  return (
    <div className={`w-full ${className}`}>
      <div className="flex gap-2 w-full">
        {
          <Select
            value={searchCategory}
            onChange={(value) => handleChangeCategory(value)}
            className={`${!isMobile ? 'category-select w-[200px]' : 'w-[100px]'} ${
              isMobile ? 'h-10' : 'h-12'
            }`}
            options={section === 'market' ? categories : statusOptions}
            suffixIcon={<ChevronDown size={16} />}
            listHeight={400} // Height in pixels (default is 256px)
          />
        }

        <div className={`flex-1 flex ${isMobile ? 'gap-0' : 'gap-2'}`}>
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
              placeholder="Search for anything..."
              className={`${isMobile ? 'h-10' : 'h-12'} !w-full ${isMobile ? 'pl-7' : 'pl-11'} ${
                searchValue ? 'pr-10' : 'pr-4'
              } ${
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
            onClick={handleSearch}
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
    </div>
  );
};

export default SearchBar;
