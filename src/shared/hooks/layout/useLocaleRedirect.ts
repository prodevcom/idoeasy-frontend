'use client';

import { usePathname, useRouter } from 'next/navigation';

import { useEffect, useRef } from 'react';

import { usePreferences } from '@/shared/contexts/PreferencesContext';

import { defaultLocale, locales } from '../../../../i18n';

/**
 * Hook to automatically redirect users to their preferred locale route
 * This ensures users are always on the correct locale path
 */
export function useLocaleRedirect() {
  const router = useRouter();
  const pathname = usePathname();
  const { preferences, isInitialized } = usePreferences();
  const hasRedirected = useRef(false);

  useEffect(() => {
    // Only proceed if preferences are initialized and we haven't redirected yet
    if (!isInitialized || hasRedirected.current) {
      return;
    }

    // Extract current locale from pathname
    const segments = pathname.split('/').filter(Boolean);
    const currentLocale = segments[0];

    // If no locale in path, this shouldn't happen with next-intl, but let's be safe
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (!currentLocale || !locales.includes(currentLocale as any)) {
      return;
    }

    // Get user's preferred locale (fallback to default)
    const preferredLocale = preferences.locale || defaultLocale;

    // If current locale doesn't match preferred locale, redirect
    if (currentLocale !== preferredLocale) {
      hasRedirected.current = true;

      // Reconstruct the path with the correct locale
      // Remove the current locale and add the preferred one
      const pathWithoutLocale = pathname.substring(`/${currentLocale}`.length);
      const newPath = `/${preferredLocale}${pathWithoutLocale}`;

      // Use replace to avoid adding to browser history
      router.replace(newPath);
    }
  }, [pathname, preferences.locale, isInitialized, router]);

  return {
    currentLocale: pathname.split('/')[1],
    preferredLocale: preferences.locale || defaultLocale,
    isRedirecting: hasRedirected.current,
  };
}
