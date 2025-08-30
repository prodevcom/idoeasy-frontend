import type { StatusResponse } from '@/shared/api';

import type { CreateRoleRequest, RoleWithPermissions, UpdateRoleRequest } from '@entech/contracts';

export type CreateRolePayload = CreateRoleRequest;
export type UpdateRolePayload = UpdateRoleRequest;

export interface RoleResponse {
  data: RoleWithPermissions;
  status: StatusResponse;
}
