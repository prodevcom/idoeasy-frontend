// ModalProvider.tsx
'use client';

import { ComposedModal } from '@carbon/react';
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

interface ModalContextType {
  isOpen: boolean;
  openModal: (node: ReactNode) => void; // no per-modal props
  closeModal: () => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export function ModalProvider({ children }: { children: ReactNode }) {
  const [isClient, setIsClient] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [content, setContent] = useState<ReactNode | null>(null);

  useEffect(() => setIsClient(true), []);

  const container = useMemo(() => {
    if (typeof document === 'undefined') return null;
    let el = document.getElementById('modal-root');
    if (!el) {
      el = document.createElement('div');
      el.id = 'modal-root';
      document.body.appendChild(el);
    }
    return el;
  }, []);

  const openModal = (node: ReactNode) => {
    setContent(node);
    // Ensure the modal is already mounted before flipping to open on next tick.
    requestAnimationFrame(() => setIsOpen(true));
  };

  const closeModal = () => {
    // Close (animation plays). You can clear content after close if you want.
    setIsOpen(false);
  };

  const ctx: ModalContextType = { isOpen, openModal, closeModal };

  return (
    <ModalContext.Provider value={ctx}>
      {children}

      {/* keep the modal mounted after client boot; only toggle `open` */}
      {isClient && container
        ? createPortal(
            <ComposedModal
              open={isOpen}
              onClose={closeModal} // ESC/overlay/close button
              preventCloseOnClickOutside={false}
            >
              {content}
            </ComposedModal>,
            container,
          )
        : null}
    </ModalContext.Provider>
  );
}

export function useModalContext() {
  const v = useContext(ModalContext);
  if (!v) throw new Error('useModalContext must be used within a ModalProvider');
  return v;
}
