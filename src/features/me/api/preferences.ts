import type { UpdateUserPreferencesRequest, User } from '@entech/contracts';

import type { ApiSuccess } from '@/shared/api';
import { api, ENDPOINTS } from '@/shared/api';

/**
 * Update user preferences (locale and timezone)
 *
 * @param preferences - The preferences to update
 *
 * @returns The updated user preferences
 */
export async function updateUserPreferences(
  preferences: UpdateUserPreferencesRequest,
): Promise<ApiSuccess<User>> {
  return api.patch<ApiSuccess<User>>(ENDPOINTS.ME.PREFERENCES, preferences).then((res) => res.data);
}

/**
 * Get current user profile (includes preferences in metadata)
 *
 * @returns The current user profile
 */
export async function getCurrentUser(): Promise<ApiSuccess<User>> {
  return api.get<ApiSuccess<User>>(ENDPOINTS.ME.PROFILE).then((res) => res.data);
}
