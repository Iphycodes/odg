// import LoginContainer from '@grc/container/auth/login'
'use client';

import Market from '@grc/components/apps/market';
import { useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import Cookie from 'js-cookie';

const Home = () => {
  const searchParams = useSearchParams();

  useEffect(() => {
    const affiliateIdString = searchParams?.get('affiliateId');

    if (affiliateIdString) {
      Cookie.set('odg-laptops-affiliateId', affiliateIdString, { expires: 3 });
    }
    // Clean URL without page reload
    const newUrl = window.location.pathname;
    window.history.replaceState({}, '', newUrl);
  }, [searchParams]);
  return <Market />;
};

export default Home;
