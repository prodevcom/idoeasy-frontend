import {
  Calendar,
  Dashboard,
  LicenseDraft,
  Money,
  QrCode,
  SecurityServices,
  User,
} from '@carbon/icons-react';

import type { NavOptions } from './types';

export type { NavOptions } from './types';

/** Static items */
export const NAV_ITEMS: NavOptions[] = [
  {
    permission: 'dashboard.read',
    label: 'Dashboard',
    href: '/dash',
    icon: Dashboard,
    alwaysShow: true,
    translateKey: 'dashboard',
  },

  { permission: '#', divider: true, translateKey: '' },

  {
    permission: 'my-account.events.read',
    label: 'My Events',
    href: '/u/events',
    icon: Calendar,
    alwaysShow: true,
    translateKey: 'my-events',
  },

  {
    permission: 'my-account.check-in.read',
    label: 'Check-in',
    href: '/u/check-in',
    icon: QrCode,
    alwaysShow: true,
    translateKey: 'check-in',
  },

  {
    permission: 'my-account.balance.read',
    label: 'Balance',
    href: '/u/balance',
    icon: Money,
    badge: {
      value: 'R$ 1.5k',
      type: 'green',
      size: 'sm',
    },
    translateKey: 'balance',
  },

  { permission: '#', divider: true, label: 'Admin', translateKey: 'admin' },

  {
    permission: 'events.read',
    label: 'Events',
    href: '/events',
    icon: Calendar,
    disabled: true,
    translateKey: 'events',
  },
  {
    permission: 'users.read',
    label: 'Users',
    href: '/users',
    icon: User,
    translateKey: 'users',
  },
  {
    permission: 'payments.read',
    label: 'Payments',
    href: '/payments',
    icon: Money,
    disabled: true,
    translateKey: 'payments',
  },

  {
    permission: 'roles.read',
    label: 'Roles',
    href: '/roles',
    icon: SecurityServices,
    translateKey: 'roles',
  },
  {
    permission: 'permissions.read',
    label: 'Permissions',
    href: '/permissions',
    icon: LicenseDraft,
    translateKey: 'permissions',
  },
];
