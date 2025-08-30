import type { ComponentType, ReactNode } from 'react';

export type NavOptions = {
  label?: string;
  href?: string;
  icon?: ComponentType;
  disabled?: boolean;
  permission: string;
  badge?: {
    value: ReactNode;
    type?: 'blue' | 'red' | 'green' | 'gray';
    size?: 'sm' | 'md';
  };
  divider?: boolean;
  alwaysShow?: boolean;
  translateKey: string;
};
