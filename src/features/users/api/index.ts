import type {
  CreateUserRequest,
  UpdateUserRequest,
  User,
  UserQueryParams,
} from '@idoeasy/contracts';

import type { ApiSuccess } from '@/shared/api';
import { api, ENDPOINTS } from '@/shared/api';

export async function getUser(id: string): Promise<User> {
  return api.get<ApiSuccess<User>>(`${ENDPOINTS.USERS.DETAIL(id)}`).then((res) => res.data.data);
}

/**
 * Search for users with optional filters
 *
 * @param params - The query parameters for filtering
 * @returns The search results
 */
export async function searchUsers(params: UserQueryParams = {}): Promise<ApiSuccess<User[]>> {
  const qs = new URLSearchParams();

  if (params.page) qs.set('page', String(params.page));
  if (params.limit) qs.set('limit', String(params.limit));
  if (params.search) qs.set('search', params.search);
  if (params.sortBy) qs.set('sortBy', params.sortBy);
  if (params.sortOrder) qs.set('sortOrder', params.sortOrder);
  if (params.status) qs.set('status', params.status);
  if (params.roleId) qs.set('roleId', params.roleId);

  return api
    .get<ApiSuccess<User[]>>(`${ENDPOINTS.USERS.LIST}`, { params: qs })
    .then((res) => res.data);
}

/**
 * Update a user
 *
 * @param id - The ID of the user to update
 * @param payload - The payload to update the user with
 * @returns The updated user
 */
export async function updateUser(id: string, payload: UpdateUserRequest) {
  return api
    .patch<ApiSuccess<User>>(`${ENDPOINTS.USERS.DETAIL(id)}`, payload)
    .then((res) => res.data)
    .catch((err) => {
      throw new Error(err.message);
    });
}

/**
 * Create a new user
 *
 * @param payload - The payload to create the user with
 * @returns The created user
 */
export async function createUser(payload: CreateUserRequest) {
  return api
    .post<ApiSuccess<User>>(`${ENDPOINTS.USERS.LIST}`, payload)
    .then((res) => res.data)
    .catch((err) => {
      throw new Error(err.message);
    });
}
