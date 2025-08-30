import { useRouter } from 'next/navigation';

import { OverflowMenu, OverflowMenuItem, TableCell } from '@carbon/react';
import { useTranslations } from 'next-intl';

import type { Authorizer } from '@/shared/domain';

export const UserUpdateAction = ({
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
        <OverflowMenu iconDescription={t('actions.actions')} align="left" flipped>
          <OverflowMenuItem
            itemText={t('actions.view')}
            onClick={() => router.push(`/users/${userId}`)}
            disabled={forceDisabled || !authorizer.canUpdate()}
          />
          <OverflowMenuItem
            itemText={t('actions.deactivate')}
            onClick={() => {}}
            disabled={forceDisabled || !authorizer.canDelete()}
            isDelete
          />
        </OverflowMenu>
      )}
    </TableCell>
  );
};
