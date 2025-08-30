'use client';

import { Button, ComposedModal, ModalBody, ModalFooter, ModalHeader } from '@carbon/react';

type DrawerProps = {
  open: boolean;
  onApply: () => void;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  onCloseText?: string;
  onApplyText?: string;
};

export function FilterModal({
  open,
  onApply,
  onClose,
  title,
  children,
  size = 'md',
  onCloseText = 'Cancel',
  onApplyText = 'Apply filters',
}: DrawerProps) {
  return (
    <ComposedModal open={open} onClose={onClose} size={size}>
      <ModalHeader title={title} />
      <ModalBody hasScrollingContent>{children}</ModalBody>
      <ModalFooter>
        <Button kind="secondary" onClick={onClose}>
          {onCloseText}
        </Button>
        <Button kind="primary" onClick={onApply}>
          {onApplyText}
        </Button>
      </ModalFooter>
    </ComposedModal>
  );
}
