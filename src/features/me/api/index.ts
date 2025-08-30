import type { AuditLog, ChangePasswordRequest, UpdateMeRequest, User } from '@entech/contracts';

import type { ApiSuccess } from '@/shared/api';
import { api } from '@/shared/api/api';
import { ENDPOINTS } from '@/shared/api/endpoints';

export * from './preferences';

/**
 * Get the last audit logs for the current user
 *
 * @returns Audit logs
 */
export async function getMyLastAuditLogs() {
  return api.get<ApiSuccess<AuditLog[]>>(`${ENDPOINTS.ME.AUDIT_LOGS}`).then((res) => res.data);
}

/**
 * Change the password for a user
 *
 * @param payload - The payload to change the password with
 * @returns The updated user
 */
export async function changePassword(payload: ChangePasswordRequest) {
  return api
    .post<ApiSuccess<User>>(`${ENDPOINTS.ME.CHANGE_PASSWORD}`, payload)
    .then((res) => res.data)
    .catch((err) => {
      throw new Error(err.message);
    });
}

/**
 * Update the current user's infos
 *
 * @param payload - The payload to update the user with
 * @returns The updated user
 */
export async function updateMeInfos(payload: UpdateMeRequest) {
  return api
    .patch<ApiSuccess<User>>(`${ENDPOINTS.ME.PROFILE}`, payload)
    .then((res) => res.data)
    .catch((err) => {
      throw new Error(err.message);
    });
}
