import { ComposedModal } from '@carbon/react';

import { useModalContext } from '@/shared/contexts/ModalContext';

export function GlobalModal() {
  const { isOpen, closeModal, modalContent } = useModalContext();

  if (!modalContent) {
    return null;
  }

  return (
    <ComposedModal open={isOpen} onClose={closeModal}>
      {modalContent}
    </ComposedModal>
  );
}
