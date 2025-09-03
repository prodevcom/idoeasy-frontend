'use client';

import { useParams } from 'next/navigation';

import { Stack } from '@carbon/react';
import { useTranslations } from 'next-intl';

import type { RoleWithPermissions } from '@idoeasy/contracts';

import { RoleUpdateForm } from '@/features/roles/ui';

type UpdateRoleProps = {
  userRole?: RoleWithPermissions;
};

export default function UpdateRolePage({ userRole }: UpdateRoleProps) {
  const t = useTranslations('roles');

  const { id } = useParams<{ id: string }>();

  return (
    <Stack gap={4}>
      <Stack gap={3}>
        <h2 className="cds--type-heading-03">{t('titles.update')}</h2>
        <p className="cds--type-label-01">{t('titles.updateDescription')}</p>
      </Stack>

      <RoleUpdateForm uuid={id} userRole={userRole} />
    </Stack>
  );
}
