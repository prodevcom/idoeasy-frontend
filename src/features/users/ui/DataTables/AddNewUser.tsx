import { useRouter } from 'next/navigation';

import { Add } from '@carbon/icons-react';
import { Button } from '@carbon/react';
import { useTranslations } from 'next-intl';

export const AddNewUser = () => {
  const router = useRouter();
  const t = useTranslations('users');

  return (
    <Button
      renderIcon={Add}
      onClick={() => router.push('/users/create')}
      style={{ marginLeft: 'auto' }}
    >
      {t('actions.create')}
    </Button>
  );
};
