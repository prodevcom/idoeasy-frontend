import { usePathname, useRouter } from 'next/navigation';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';

import type { User } from '@entech/contracts';

import { getUserPreferences, saveUserPreferences } from '@/shared/helpers/preferences';

import { defaultLocale, locales } from '../../../../i18n';
import { getCurrentUser, updateUserPreferences } from '../api/preferences';

export const ME_QUERY_KEY = 'me';

/**
 * Hook to get current user data including preferences with locale verification
 *
 * @param enabled - Whether to enable the query. Default: true
 */
export function useCurrentUser(enabled: boolean = true) {
  const router = useRouter();
  const pathname = usePathname();
  const hasInitialized = useRef(false);

  const query = useQuery({
    queryKey: [ME_QUERY_KEY],
    queryFn: getCurrentUser,
    staleTime: Infinity, // Never consider data stale
    gcTime: 5 * 60 * 1000, // 5 minutes
    enabled, // Only fetch when enabled
    retry: false, // Never retry
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retryOnMount: false,
    refetchOnMount: false,
  });

  // Handle locale verification and route adjustment on first successful data fetch
  useEffect(() => {
    if (query.data?.data && !hasInitialized.current) {
      hasInitialized.current = true;

      const user = query.data.data;
      const currentPreferences = getUserPreferences(user);

      // Temporarily disable route adjustment to avoid conflicts with useLocaleRedirect
      // const shouldAdjustRoute = checkAndAdjustRoute(pathname, router, currentPreferences.locale);
      // if (shouldAdjustRoute) {
      //   return;
      // }

      // Sync user metadata with local preferences if needed
      syncUserMetadata(user, currentPreferences);
    }
  }, [query.data, pathname, router]);

  return query;
}

/**
 * Check if the current route matches the user's locale preference and adjust if needed
 */
function checkAndAdjustRoute(
  pathname: string,
  router: ReturnType<typeof useRouter>,
  userLocale?: string,
): boolean {
  // Extract current locale from pathname
  const segments = pathname.split('/').filter(Boolean);
  const currentLocale = segments[0];

  // If no locale in path, this shouldn't happen with next-intl, but let's be safe
  if (!currentLocale || !locales.includes(currentLocale as any)) {
    return false;
  }

  // If user has no locale preference, use default
  const preferredLocale = userLocale || defaultLocale;

  // If current locale doesn't match preferred locale, redirect
  if (currentLocale !== preferredLocale) {
    // Reconstruct the path with the correct locale
    // Remove the current locale and add the preferred one
    const pathWithoutLocale = pathname.substring(`/${currentLocale}`.length);
    const newPath = `/${preferredLocale}${pathWithoutLocale}`;

    // Use replace to avoid adding to browser history
    router.replace(newPath);
    return true;
  }

  return false;
}

/**
 * Sync user metadata with local preferences and save to cookies
 */
function syncUserMetadata(
  user: User,
  currentPreferences: ReturnType<typeof getUserPreferences>,
): void {
  // Check if we need to update local preferences based on user metadata
  const needsUpdate =
    user.metadata?.locale !== currentPreferences.locale ||
    user.metadata?.timeZone !== currentPreferences.timeZone ||
    user.metadata?.showTimezoneOffset !== currentPreferences.showTimezoneOffset;

  if (needsUpdate) {
    // Create merged preferences (user metadata takes precedence)
    const mergedPreferences = {
      locale: user.metadata?.locale || currentPreferences.locale || defaultLocale,
      timeZone: user.metadata?.timeZone || currentPreferences.timeZone || 'UTC',
      showTimezoneOffset:
        user.metadata?.showTimezoneOffset ?? currentPreferences.showTimezoneOffset ?? false,
    };

    // Save to cookies and localStorage
    saveUserPreferences(mergedPreferences);
  }
}

/**
 * Hook to get user preferences with fallbacks
 */
export function useUserPreferences() {
  const { data: userData } = useCurrentUser();

  const preferences = getUserPreferences(userData?.data as User);

  return {
    preferences,
    isLoading: false, // Since we have fallbacks, this is never loading
  };
}

/**
 * Hook to update user preferences
 */
export function useUpdateUserPreferences() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateUserPreferences,
    onSuccess: (updatedUser) => {
      // Update the user data in the cache
      queryClient.setQueryData([ME_QUERY_KEY], updatedUser);

      // Update local preferences
      const user = updatedUser.data;
      if (user?.metadata) {
        const preferences = {
          locale: user.metadata.locale,
          timeZone: user.metadata.timeZone,
          showTimezoneOffset: user.metadata.showTimezoneOffset,
        };
        saveUserPreferences(preferences);
      }

      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: [ME_QUERY_KEY] });
    },
  });
}
