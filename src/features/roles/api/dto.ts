import type { StatusResponse } from '@/shared/api';

import type { CreateRoleRequest, RoleWithPermissions, UpdateRoleRequest } from '@idoeasy/contracts';

export type CreateRolePayload = CreateRoleRequest;
export type UpdateRolePayload = UpdateRoleRequest;

export interface RoleResponse {
  data: RoleWithPermissions;
  status: StatusResponse;
}
