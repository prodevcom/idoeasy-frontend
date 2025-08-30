import type { Role, RoleQueryParams, RoleWithPermissions } from '@entech/contracts';

import type { CreateRolePayload, RoleResponse, UpdateRolePayload } from '@/features/roles/api/dto';
import type { ApiSuccess } from '@/shared/api';
import { api, ENDPOINTS } from '@/shared/api';

/**
 * Get a role by ID
 *
 * @param id - The ID of the role to fetch
 * @returns The role with permissions
 */
export async function getRole(id: string): Promise<RoleWithPermissions> {
  return api.get<RoleResponse>(`${ENDPOINTS.ROLES.DETAIL(id)}`).then((res) => res.data.data);
}

/**
 * Search for roles with optional filters
 *
 * @param params - The query parameters for filtering
 * @returns The search results
 */
export async function searchRoles(params: RoleQueryParams = {}): Promise<ApiSuccess<Role[]>> {
  const qs = new URLSearchParams();
  if (params.page) qs.set('page', String(params.page));
  if (params.limit) qs.set('limit', String(params.limit));
  if (params.search) qs.set('search', params.search);
  if (params.isActive !== undefined) qs.set('isActive', String(params.isActive));
  if (params.sortBy) qs.set('sortBy', params.sortBy);
  if (params.sortOrder) qs.set('sortOrder', params.sortOrder);

  return api
    .get<ApiSuccess<Role[]>>(`${ENDPOINTS.ROLES.LIST}`, { params: qs })
    .then((res) => res.data);
}

/**
 * Update a role
 *
 * @param id - The ID of the role to update
 * @param payload - The payload to update the role with
 * @returns The updated role
 */
export async function updateRole(
  id: string,
  payload: UpdateRolePayload,
): Promise<ApiSuccess<Role>> {
  return api
    .patch<ApiSuccess<Role>>(`${ENDPOINTS.ROLES.DETAIL(id)}`, payload)
    .then((res) => res.data);
}

/**
 * Create a new role
 *
 * @param payload - The payload to create the role with
 * @returns The created role
 */
export async function createRole(payload: CreateRolePayload): Promise<ApiSuccess<Role>> {
  return api.post<ApiSuccess<Role>>(`${ENDPOINTS.ROLES.LIST}`, payload).then((res) => res.data);
}
