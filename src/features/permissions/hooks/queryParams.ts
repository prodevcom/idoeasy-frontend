import { createQueryHelpers, type Schema } from '@/shared/helpers';

export const defaults = {
  page: 1,
  pageSize: 10,
  search: '',
  module: '',
  action: '',
  isActive: '',
  sortBy: 'createdAt',
  sortOrder: 'desc',
} as {
  page: number;
  pageSize: number;
  search: string;
  module: string;
  action: string;
  isActive: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
};

export type PermissionQueryShape = {
  page: number;
  pageSize: number;
  search: string;
  module: string;
  action: string;
  isActive: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
};

const schema: Schema<PermissionQueryShape> = {
  page: {
    qs: 'page',
    default: defaults.page,
    serialize: (n) => (n > 1 ? String(n) : null),
    deserialize: (v) => {
      const s = Array.isArray(v) ? v[0] : v;
      const n = Number(s);
      return Number.isFinite(n) && n > 0 ? n : defaults.page;
    },
  },
  pageSize: {
    qs: 'limit',
    default: defaults.pageSize,
    deserialize: (v) => {
      const s = Array.isArray(v) ? v[0] : v;
      const n = Number(s);
      return Number.isFinite(n) && n > 0 ? n : defaults.pageSize;
    },
  },
  search: {
    qs: 'search',
    default: defaults.search,
    serialize: (s) => (s ? s : null),
    deserialize: (v) => (Array.isArray(v) ? (v[0] ?? '') : (v ?? '')),
  },
  module: {
    qs: 'module',
    default: defaults.module,
    serialize: (s) => (s ? s : null),
    deserialize: (v) => (Array.isArray(v) ? (v[0] ?? '') : (v ?? '')),
  },
  action: {
    qs: 'action',
    default: defaults.action,
    serialize: (s) => (s ? s : null),
    deserialize: (v) => (Array.isArray(v) ? (v[0] ?? '') : (v ?? '')),
  },
  isActive: {
    qs: 'isActive',
    default: defaults.isActive,
    serialize: (s) => (s ? s : null),
    deserialize: (v) => (Array.isArray(v) ? (v[0] ?? '') : (v ?? '')),
  },
  sortBy: {
    qs: 'sortBy',
    default: defaults.sortBy,
    serialize: (s) => (s ? s : null),
    deserialize: (v) => (Array.isArray(v) ? (v[0] ?? '') : (v ?? '')),
  },
  sortOrder: {
    qs: 'sortOrder',
    default: defaults.sortOrder,
    serialize: (s) => (s ? s : null),
    deserialize: (v) =>
      (Array.isArray(v) ? (v[0] ?? '') : (v ?? '')).toLowerCase() as 'asc' | 'desc',
  },
};

export const permissionsQS = createQueryHelpers<PermissionQueryShape>(schema);
