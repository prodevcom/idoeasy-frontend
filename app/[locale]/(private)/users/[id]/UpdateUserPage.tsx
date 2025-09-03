'use client';

import { useParams } from 'next/navigation';

import { Stack } from '@carbon/react';
import { useTranslations } from 'next-intl';

import type { AuthUser } from '@idoeasy/contracts';

import { UpdateUserForm } from '@/features/users/ui/UserUpdateForm';

type UpdateUserProps = {
  currentUser?: AuthUser;
};

export default function UpdateUserPage({ currentUser }: UpdateUserProps) {
  const t = useTranslations('users');
  const { id } = useParams<{ id: string }>();

  return (
    <Stack gap={4}>
      <Stack gap={3}>
        <h2 className="cds--type-heading-03">{t('titles.update')}</h2>
        <p className="cds--type-label-01">{t('titles.updateDescription')}</p>
      </Stack>

      <UpdateUserForm uid={id} currentUser={currentUser!} />
    </Stack>
  );
}
