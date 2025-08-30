'use client';

import { Stack } from '@carbon/react';
import { useTranslations } from 'next-intl';

import type { RoleWithPermissions } from '@entech/contracts';

import { RoleCreateForm } from '@/features/roles/ui/RoleCreateForm';

type CreateRoleProps = {
  userRole?: RoleWithPermissions;
};

export default function CreateRolePage({ userRole }: CreateRoleProps) {
  const t = useTranslations('roles');

  return (
    <Stack gap={4}>
      <Stack gap={3}>
        <h2 className="cds--type-heading-03">{t('titles.create')}</h2>
        <p className="cds--type-label-01">{t('titles.createDescription')}</p>
      </Stack>

      <RoleCreateForm userRole={userRole} />
    </Stack>
  );
}
