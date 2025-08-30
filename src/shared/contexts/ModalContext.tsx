import { createContext, useContext, useState, type ReactNode } from 'react';

// Types for the modal context
interface ModalContextType {
  isOpen: boolean;
  openModal: (component: ReactNode, props?: Record<string, unknown>) => void;
  closeModal: () => void;
  modalContent: ReactNode | null;
  modalProps: Record<string, unknown> | undefined;
}

// Create the context
const ModalContext = createContext<ModalContextType | undefined>(undefined);

// Provider component
interface ModalProviderProps {
  children: ReactNode;
}

export function ModalProvider({ children }: ModalProviderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [modalContent, setModalContent] = useState<ReactNode | null>(null);
  const [modalProps, setModalProps] = useState<Record<string, unknown> | undefined>(undefined);

  const openModal = (component: ReactNode, props?: Record<string, unknown>) => {
    setModalContent(component);
    setModalProps(props);
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
    setModalContent(null);
    setModalProps(undefined);
  };

  const value: ModalContextType = {
    isOpen,
    openModal,
    closeModal,
    modalContent,
    modalProps,
  };

  return <ModalContext.Provider value={value}>{children}</ModalContext.Provider>;
}

// Hook to use the modal context
export function useModalContext(): ModalContextType {
  const context = useContext(ModalContext);
  if (context === undefined) {
    throw new Error('useModalContext must be used within a ModalProvider');
  }
  return context;
}
