import { useQuery } from '@tanstack/react-query';
import { useEffect, useMemo } from 'react';
import { useController, type Control } from 'react-hook-form';

import type { RoleWithPermissions } from '@entech/contracts';

import { searchPermissions } from '@/features/permissions/api';

import { PermissionTransfer } from './PermissionTransfer';

type PermissionFieldProps = {
  userRole?: RoleWithPermissions;
  name: string;
  control: Control<any>; // eslint-disable-line @typescript-eslint/no-explicit-any
  disabled: boolean;
  initialModules?: string[];
};

export function PermissionField({
  userRole,
  name,
  control,
  disabled,
  initialModules,
}: PermissionFieldProps) {
  const { field } = useController({ name, control, defaultValue: [] });

  const { data: permissions, isLoading: isPermissionsLoading } = useQuery({
    queryKey: ['permissions', { isActive: true }],
    queryFn: () => searchPermissions({ page: 1, limit: 1000, isActive: true }),
  });

  const defaultPermissions = useMemo(
    () =>
      permissions?.data?.filter((i) => initialModules?.includes(i.module)).map((i) => i.id) ?? [],
    [permissions?.data, initialModules],
  );

  useEffect(() => {
    if (!isPermissionsLoading && defaultPermissions.length > 0) {
      const cur = field.value ?? [];
      if (Array.isArray(cur) && cur.length === 0) {
        field.onChange(defaultPermissions);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPermissionsLoading, defaultPermissions]);

  const items = useMemo(
    () => permissions?.data?.map((p) => ({ id: p.id, name: p.name })) ?? [],
    [permissions?.data],
  );

  const disabledIds = useMemo(
    () =>
      !userRole?.isAdmin
        ? (permissions?.data?.filter((p) => p.isAdminOnly).map((p) => p.id) ?? [])
        : [],
    [permissions?.data, userRole?.isAdmin],
  );

  return (
    <PermissionTransfer
      items={items}
      selectedIds={field.value ?? []}
      disabledIds={disabledIds}
      onChange={field.onChange}
      disabled={disabled || isPermissionsLoading}
    />
  );
}
