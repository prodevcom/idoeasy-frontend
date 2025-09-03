import { useRouter } from 'next/navigation';

import { View } from '@carbon/icons-react';
import { Button, TableCell } from '@carbon/react';
import { useTranslations } from 'next-intl';

import type { Authorizer } from '@/shared/domain';

export const ViewUserAction = ({
  userId,
  authorizer,
  forceDisabled,
}: {
  userId: string;
  authorizer: Authorizer;
  forceDisabled?: boolean;
}) => {
  const router = useRouter();
  const t = useTranslations('users');
  return (
    <TableCell key={`actions`} aria-label="user-actions" className="actions-col">
      {!forceDisabled && (
        <Button
          hasIconOnly
          kind="ghost"
          onClick={() => router.push(`/users/${userId}`)}
          aria-label={t('actions.view')}
          disabled={forceDisabled || !authorizer.canUpdate()}
          iconDescription={t('actions.view')}
        >
          <View />
        </Button>
      )}
    </TableCell>
  );
};
