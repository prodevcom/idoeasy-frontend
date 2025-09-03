import { useRouter } from 'next/navigation';

import { OverflowMenu, OverflowMenuItem, TableCell } from '@carbon/react';
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

  const handleUpdate = () => {
    router.push(`/users/${userId}/edit`);
  };

  const handleView = () => {
    router.push(`/users/${userId}`);
  };

  const handleDisable = () => {};

  return (
    <TableCell key={`actions`} aria-label="user-actions" className="actions-col">
      <OverflowMenu iconDescription={t('actions.actions')} align="left" flipped>
        {authorizer.canRead() && (
          <OverflowMenuItem
            disabled={forceDisabled}
            itemText={t('actions.view')}
            onClick={handleView}
          />
        )}
        {authorizer.canUpdate() && (
          <OverflowMenuItem
            disabled={forceDisabled}
            itemText={t('actions.edit')}
            onClick={handleUpdate}
          />
        )}
        {authorizer.canDelete() && (
          <OverflowMenuItem
            disabled={forceDisabled}
            itemText={t('actions.disable')}
            onClick={handleDisable}
            isDelete
          />
        )}
      </OverflowMenu>
    </TableCell>
  );
};
