'use client';

import { Stack } from '@carbon/react';
import { useTranslations } from 'next-intl';

import type { AuthUser } from '@entech/contracts';

import { UserCreateForm } from '@/features/users';

type CreateUserProps = {
  currentUser?: AuthUser;
};

export default function CreateUserPage(_: CreateUserProps) {
  const t = useTranslations('users');
  return (
    <Stack gap={4}>
      <Stack gap={3}>
        <h2 className="cds--type-heading-03">{t('titles.create')}</h2>
        <p className="cds--type-label-01">{t('titles.createDescription')}</p>
      </Stack>

      <UserCreateForm />
    </Stack>
  );
}
