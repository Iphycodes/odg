'use client';
import React from 'react';
import { SiderTheme } from 'antd/es/layout/Sider';
import { NavItem, getFirstCharacter, getRandomColorByString } from '@grc/_shared/helpers';
import { isEmpty } from 'lodash';
import { Avatar } from 'antd';
import { Store, ShoppingCart, Bookmark, ShoppingBag } from 'lucide-react';
import SideNavAuthButton from '@grc/components/apps/layout/side-nav/lib/side-nav-auth-button';

export type Nav = {
  theme: SiderTheme & string;
  appName: string;
  items: NavItem[];
  mobileMenuItems: NavItem[];
  footerMenuItems: NavItem[];
};

const footerMenuItems: NavItem[] = [
  {
    label: 'Profile',
    key: 'profile',
    destination: '',
    icon: (
      <Avatar
        style={{
          backgroundColor: getRandomColorByString('Ifeanyi'),
          verticalAlign: 'middle',
          height: '22px',
          width: '22px',
        }}
      >
        {isEmpty('') && getFirstCharacter('Ifeanyi')}
      </Avatar>
    ),
  },
  {
    label: <SideNavAuthButton />,
    key: 'auth',
    destination: '',
    icon: <></>,
  },
];

const menuItems: NavItem[] = [
  {
    label: 'Shop',
    key: 'shop',
    destination: '/',
    icon: <Store size={20} color="#6366f1" />,
  },
  {
    label: 'Cart',
    key: 'cart',
    destination: '/cart',
    icon: <ShoppingCart size={20} color="#f97316" />,
  },
  {
    label: 'Saved',
    key: 'saved',
    destination: '/saved',
    icon: <Bookmark size={20} color="#ec4899" />,
  },
];

const mobileMenuItems: NavItem[] = [
  {
    label: 'Shop',
    key: 'shop',
    destination: '/',
    icon: <ShoppingBag size={22} color="#6366f1" />,
  },
  {
    label: 'Cart',
    key: 'cart',
    destination: '/cart',
    icon: <ShoppingCart size={22} color="#f97316" />,
  },
  {
    label: 'Saved',
    key: 'saved',
    destination: '/saved',
    icon: <Bookmark size={22} color="#ec4899" />,
  },
];

const appNav: Nav = {
  appName: 'Comaket',
  theme: 'light',
  items: menuItems,
  mobileMenuItems,
  footerMenuItems: footerMenuItems,
};

export { appNav };
