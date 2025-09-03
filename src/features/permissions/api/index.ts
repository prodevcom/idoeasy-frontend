import type { Permission, PermissionQueryParams } from '@idoeasy/contracts';

import type { ApiSuccess } from '@/shared/api';
import { api, ENDPOINTS } from '@/shared/api';

/**
 * Search for permissions with optional filters
 *
 * @param params - The query parameters for filtering
 *
 * @returns The search results
 */
export async function searchPermissions(
  params: PermissionQueryParams = {},
): Promise<ApiSuccess<Permission[]>> {
  const qs = new URLSearchParams();

  if (params.page) qs.set('page', String(params.page));
  if (params.limit) qs.set('limit', String(params.limit));
  if (params.search) qs.set('search', params.search);
  if (params.module) qs.set('module', params.module);
  if (params.action) qs.set('action', params.action);
  if (typeof params.isActive === 'boolean') qs.set('isActive', String(params.isActive));
  if (params.sortBy) qs.set('sortBy', params.sortBy);
  if (params.sortOrder) qs.set('sortOrder', params.sortOrder);

  return api
    .get<ApiSuccess<Permission[]>>(`${ENDPOINTS.PERMISSIONS.LIST}`, {
      params: qs,
    })
    .then((res) => res.data);
}
