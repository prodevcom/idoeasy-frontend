import { useRouter } from 'next/navigation';

import { OverflowMenu, OverflowMenuItem, TableCell } from '@carbon/react';
import { useTranslations } from 'next-intl';

import type { Authorizer } from '@/shared/domain';

type RoleCellActionsProps = {
  roleId: string;
  authorizer: Authorizer;
};

export const RoleUpdateActions = ({ roleId, authorizer }: RoleCellActionsProps) => {
  const router = useRouter();
  const t = useTranslations('roles');

  const handleUpdate = () => {
    router.push(`/roles/${roleId}`);
  };

  const handleDelete = () => {};

  return (
    <TableCell key={`actions-${roleId}`} aria-label="roles-actions" className="actions-col">
      <OverflowMenu iconDescription={t('actions.actions')} align="left" flipped>
        {authorizer.canUpdate() && (
          <OverflowMenuItem itemText={t('actions.edit')} onClick={handleUpdate} />
        )}
        {authorizer.canDelete() && (
          <OverflowMenuItem itemText={t('actions.delete')} onClick={handleDelete} isDelete />
        )}
      </OverflowMenu>
    </TableCell>
  );
};
