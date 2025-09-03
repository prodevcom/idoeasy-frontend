'use client';

import { useMutation, useQuery, useQueryClient, type QueryKey } from '@tanstack/react-query';
import { useMemo } from 'react';

import type { CreateRoleRequest, UpdateRoleRequest } from '@idoeasy/contracts';

import { createRole, getRole, updateRole } from '@/features/roles';

/* ----------------------------- Support types ---------------------------- */
type Role = Awaited<ReturnType<typeof getRole>>;
type CreateResult = Awaited<ReturnType<typeof createRole>>;
type UpdateResult = Awaited<ReturnType<typeof updateRole>>;

/* -------------------------------- Query Keys ------------------------------ */
export const qk = {
  role: (id: string): QueryKey => ['role', id],
  roles: ['roles'] as const,
};

/* --------------------------------- Defaults ------------------------------- */
const DEFAULTS_CREATE: Readonly<CreateRoleRequest> = Object.freeze({
  name: '',
  description: '',
  isActive: true,
  isAdmin: false,
  parentId: undefined,
  permissionIds: [],
});

const DEFAULTS_UPDATE_LOADING: Readonly<UpdateRoleRequest> = DEFAULTS_CREATE;

/* ----------------------------- Map para defaults -------------------------- */
function toUpdateDefaults(r: Role): UpdateRoleRequest {
  return {
    name: r.name ?? '',
    description: r.description ?? '',
    isActive: !!r.isActive,
    isAdmin: !!r.isAdmin,
    permissionIds: Array.isArray(r.permissions) ? r.permissions.map((p) => p.id) : [],
  };
}

/* ------------------------------- useRoleCreate ---------------------------- */
export function useRoleCreate(): {
  isCreating: boolean;
  defaultValues: CreateRoleRequest;
  submit: (values: CreateRoleRequest) => Promise<CreateResult>;
} {
  const qc = useQueryClient();

  const mutation = useMutation<CreateResult, unknown, CreateRoleRequest>({
    mutationKey: ['role-create'],
    mutationFn: (values) => createRole(values),
    onSuccess: (created) => {
      const createdAsRole = created.data as Role;
      if (createdAsRole?.id) qc.setQueryData<Role>(qk.role(createdAsRole.id), createdAsRole);
      qc.invalidateQueries({ queryKey: qk.roles });
    },
  });

  return {
    isCreating: mutation.isPending,
    defaultValues: DEFAULTS_CREATE as CreateRoleRequest,
    submit: mutation.mutateAsync,
  };
}

/* ------------------------------- useRoleUpdate ---------------------------- */
export function useRoleUpdate(id: string): {
  submit: (values: UpdateRoleRequest) => Promise<UpdateResult>;
  defaultValues: UpdateRoleRequest;
  isUpdating: boolean;
  isLoading: boolean;
  isReady: boolean;
  role?: Role;
} {
  const qc = useQueryClient();

  const roleQuery = useQuery<Role>({
    queryKey: qk.role(id),
    queryFn: () => getRole(id),
    staleTime: 30_000,
    gcTime: 5 * 60_000,
    placeholderData: (prev) => prev,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
  });

  const defaultValues = useMemo<UpdateRoleRequest>(() => {
    if (roleQuery.data) return toUpdateDefaults(roleQuery.data);
    return DEFAULTS_UPDATE_LOADING as UpdateRoleRequest;
  }, [roleQuery.data]);

  const mutation = useMutation<UpdateResult, unknown, UpdateRoleRequest>({
    mutationKey: ['role-update', id],
    mutationFn: (values) => updateRole(id, values),
    onSuccess: (updated) => {
      const updatedDto = updated.data as Role;
      qc.setQueryData<Role>(qk.role(id), updatedDto);
      qc.invalidateQueries({ queryKey: qk.role(id) });
      qc.invalidateQueries({ queryKey: qk.roles });
    },
  });

  return {
    defaultValues,
    isLoading: roleQuery.isLoading || mutation.isPending,
    isReady: Boolean(roleQuery.data),
    submit: mutation.mutateAsync,
    isUpdating: mutation.isPending,
    role: roleQuery.data,
  };
}
