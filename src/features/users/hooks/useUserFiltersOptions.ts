import { useQuery } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { useMemo } from 'react';

import type { UserStatus } from '@entech/contracts';

import { searchRoles } from '@/features/roles';

export function useUserFiltersOptions() {
  const t = useTranslations('users');
  // Roles
  const rolesQuery = useQuery({
    queryKey: ['roles'],
    queryFn: () => searchRoles({ page: 1, limit: 1000 }),
  });

  const availableRoles = useMemo(() => rolesQuery.data?.data ?? [], [rolesQuery.data]);

  // Statuses
  const availableStatuses = useMemo<{ value: UserStatus | undefined; label: string }[]>(
    () => [
      { value: undefined, label: t('filters.statusAll') },
      { value: 'ACTIVE' as UserStatus, label: t('status.active') },
      { value: 'INACTIVE' as UserStatus, label: t('status.inactive') },
      { value: 'PROVISIONED' as UserStatus, label: t('status.provisioned') },
    ],
    [t],
  );

  // Headers
  const tableHeaders = [
    { key: 'name', header: t('view.headers.name') },
    { key: 'email', header: t('view.headers.email') },
    { key: 'role', header: t('view.headers.role') },
    { key: 'status', header: t('view.headers.status') },
    { key: 'createdAt', header: t('view.headers.createdAt') },
  ];

  // Key Header Actions
  const keyHeaderActions = 'createdAt';

  // Sortable Keys
  const sortableKeys = ['name', 'email', 'createdAt'];

  return {
    availableRoles,
    availableStatuses,
    tableHeaders,
    keyHeaderActions,
    sortableKeys,
  };
}
