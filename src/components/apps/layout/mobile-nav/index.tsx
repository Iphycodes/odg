import React, { useContext } from 'react';
import { Badge, Tooltip } from 'antd';
import { usePathname, useRouter } from 'next/navigation';
import { Nav } from '@grc/app/nav';
import { isEmpty } from 'lodash';
import { AppContext } from '@grc/app-context';

interface MobileNavProps {
  appNav: Nav;
  setSelectedKey: (key: string) => void;
  setIsCreateStoreModalOpen: (open: boolean) => void;
  setIsSellItemModalOpen: (open: boolean) => void;
  setIsChatsModalOpen: (open: boolean) => void;
}

const MobileNav: React.FC<MobileNavProps> = ({
  appNav,
  setSelectedKey,
  setIsCreateStoreModalOpen,
}) => {
  const pathname = usePathname();
  const path = pathname?.split('/')[1];
  const { push } = useRouter();
  const { getCartCount } = useContext(AppContext);

  const handleMenuClick = ({ key }: { key: string }) => {
    appNav?.mobileMenuItems.map((item) => {
      if (item.key === key) {
        if (item.destination !== '') {
          push(item?.destination);
        }
      }
    });
    if (key === 'create-store') {
      setIsCreateStoreModalOpen(true);
    }
    if (key === 'sell') {
      push('/sell-item');
    }
    if (key === 'chats') {
      push('/chats');
    }
    if (key === 'profile') {
      push('/profile');
    }
    setSelectedKey(key);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border/100 shadow-lg z-50">
      <div className="flex justify-around items-center h-16 px-2">
        {appNav.mobileMenuItems.map((item) => (
          <Tooltip key={item.key} title={item.label} placement="top">
            <span
              onClick={() => handleMenuClick(item)}
              className={`p-2 transition-colors h-10 w-10 cursor-pointer hover:bg-neutral-50 relative ${
                isEmpty(path) && item.key === 'market'
                  ? 'bg-neutral-200'
                  : path === item.key
                    ? 'bg-neutral-200'
                    : ''
              } rounded-[50%] ${
                path === item.key
                  ? 'text-primary bg-primary/10'
                  : 'text-muted-foreground hover:text-primary hover:bg-primary/10'
              }`}
            >
              {item.icon}
              {/* Cart badge */}
              {item.key === 'cart' && getCartCount() > 0 && (
                <Badge
                  count={getCartCount()}
                  size="small"
                  className="absolute -top-1 -right-1"
                  style={{ fontSize: '10px' }}
                />
              )}
            </span>
          </Tooltip>
        ))}
      </div>
    </div>
  );
};

export default MobileNav;
