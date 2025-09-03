import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type { User, UserPreferences } from '@idoeasy/contracts';

import type { ApiClientError } from '@/shared/api/types';
import { getUserPreferences, saveUserPreferences } from '@/shared/helpers/preferences';

import { getCurrentUser, updateUserPreferences } from '../api/preferences';

export const ME_QUERY_KEY = 'me';

/**
 * Hook to get current user data including preferences
 *
 * @param enabled - Whether to enable the query. Default: true
 */
export function useCurrentUser(enabled: boolean = true) {
  return useQuery({
    queryKey: [ME_QUERY_KEY],
    queryFn: getCurrentUser,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    enabled, // Only fetch when enabled
    retry: (failureCount, error) => {
      const status = (error as ApiClientError)?.status;
      if (status && [400, 401, 403, 404, 422].includes(status)) return false;
      return failureCount < 3;
    },
  });
}

/**
 * Hook to get user preferences with fallbacks
 */
export function useUserPreferences() {
  const { data: userData } = useCurrentUser();

  const preferences = getUserPreferences(userData?.data as User);

  return {
    preferences,
    isLoading: false,
  };
}

/**
 * Hook to update user preferences
 */
export function useUpdateUserPreferences() {
  const queryClient = useQueryClient();

  const { data: userData } = useCurrentUser();
  const preferences = getUserPreferences(userData?.data as User);

  const defaults = {
    locale: preferences.locale || 'en',
    timeZone: preferences.timeZone || 'UTC',
    showTimezoneOffset: preferences.showTimezoneOffset || false,
  };

  const mutation = useMutation({
    mutationFn: async (preferences: UserPreferences) => {
      // Save to cookies immediately for instant UI feedback
      saveUserPreferences(preferences);

      // Update server
      const response = await updateUserPreferences(preferences);
      return response;
    },
    onSuccess: (data) => {
      // Update the user query cache
      queryClient.setQueryData([ME_QUERY_KEY], data);

      // Ensure preferences are saved to cookies (in case server response differs)
      if (data.data?.metadata) {
        saveUserPreferences(data.data.metadata as UserPreferences);
      }

      // Invalidate related queries that might depend on preferences
      queryClient.invalidateQueries({ queryKey: ['audit-logs'] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['roles'] });
    },
    onError: (error) => {
      console.error('Failed to update user preferences:', error);
      // Optionally revert cookies on error
      // This could be enhanced to store previous preferences and revert
    },
  });

  return {
    mutation,
    defaults,
  };
}
