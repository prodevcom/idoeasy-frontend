'use client';

import { useEffect, useState } from 'react';

import { DesktopLoginLayout, MobileLoginLayout } from '@/shared/components/Login';

export default function LoginPage() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);

    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Mobile Layout
  if (isMobile) {
    return <MobileLoginLayout />;
  }

  // Desktop Layout
  return <DesktopLoginLayout />;
}
