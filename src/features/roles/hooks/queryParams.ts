import { createQueryHelpers, type Schema } from '@/shared/helpers';

export const defaults = {
  page: 1,
  pageSize: 10,
  search: '',
  isActive: '',
  sortBy: 'createdAt',
  sortOrder: 'desc',
} as {
  page: number;
  pageSize: number;
  search: string;
  isActive: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
};

export type RoleQueryShape = {
  page: number;
  pageSize: number;
  search: string;
  isActive: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
};

const schema: Schema<RoleQueryShape> = {
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

export const rolesQS = createQueryHelpers<RoleQueryShape>(schema);
