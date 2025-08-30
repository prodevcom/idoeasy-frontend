'use client';

import {
  Button,
  Form,
  FormGroup,
  Modal,
  ModalBody,
  ModalFooter,
  Select,
  SelectItem,
  Stack,
} from '@carbon/react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

import type { UserStatus } from '@entech/contracts';

import { useUserFiltersOptions } from '../hooks';

type FilterModalProps = {
  isOpen: boolean;
  onClose: () => void;
  status: UserStatus | undefined;
  roleId: string | undefined;
  onStatusChange: (value: UserStatus | undefined) => void;
  onRoleChange: (value: string | undefined) => void;
  onReset: () => void;
  hasFilters: boolean;
};

export function FilterDrawer({
  isOpen,
  onClose,
  status,
  roleId,
  onStatusChange,
  onRoleChange,
  onReset,
  hasFilters,
}: FilterModalProps) {
  const t = useTranslations('users');
  const { availableRoles, availableStatuses } = useUserFiltersOptions();

  const [localStatus, setLocalStatus] = useState<UserStatus | undefined>(status);
  const [localRoleId, setLocalRoleId] = useState<string | undefined>(roleId);

  const handleApply = () => {
    onStatusChange(localStatus ?? undefined);
    onRoleChange(localRoleId ?? undefined);
    onClose();
  };

  const handleReset = () => {
    setLocalStatus(undefined);
    setLocalRoleId(undefined);
    onReset();
    onClose();
  };

  const handleClose = () => {
    setLocalStatus(status);
    setLocalRoleId(roleId);
    onClose();
  };

  return (
    <Modal
      open={isOpen}
      onRequestClose={handleClose}
      modalHeading={t('filters.title')}
      primaryButtonText={t('filters.apply')}
      secondaryButtonText={t('filters.cancel')}
      onRequestSubmit={handleApply}
    >
      <ModalBody>
        <Form>
          <Stack gap={6}>
            <FormGroup legendText={t('filters.accessControl')}>
              <Stack gap={6}>
                <Select
                  id="status-filter"
                  labelText={t('filters.userStatus')}
                  value={localStatus}
                  onChange={(e) => setLocalStatus(e.target.value as UserStatus)}
                >
                  {availableStatuses.map((status) => (
                    <SelectItem
                      key={status.value ?? 'all'}
                      value={status.value}
                      text={status.label}
                    />
                  ))}
                </Select>

                <Select
                  id="role-filter"
                  labelText={t('filters.userRole')}
                  value={localRoleId}
                  onChange={(e) => setLocalRoleId(e.target.value)}
                >
                  <SelectItem value="" text={t('filters.roleAll')} />
                  {availableRoles.map((role) => (
                    <SelectItem key={role.id} value={role.id} text={role.name} />
                  ))}
                </Select>
              </Stack>
            </FormGroup>
          </Stack>
        </Form>
      </ModalBody>

      <ModalFooter>
        {hasFilters && (
          <Button kind="ghost" onClick={handleReset} style={{ marginRight: 'auto' }}>
            {t('filters.reset')}
          </Button>
        )}
      </ModalFooter>
    </Modal>
  );
}
