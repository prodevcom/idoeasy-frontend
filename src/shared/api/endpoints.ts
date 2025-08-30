export const ENDPOINTS = {
  AUTH: {
    LOGIN: '/v1/auth/login',
  },
  SESSIONS: {
    LOGOUT: '/v1/sessions/logout',
  },
  HEALTH: {
    STATUS: '/v1/health',
  },
  ME: {
    PROFILE: '/v1/me',
    CHANGE_PASSWORD: `/v1/me/change-password`,
    AUDIT_LOGS: `/v1/me/my-logs`,
    PREFERENCES: `/v1/me/preferences`,
  },
  USERS: {
    LIST: '/v1/users',
    DETAIL: (id: string) => `/v1/users/${id}`,
    ENROLL_ROLE: (id: string) => `/v1/users/${id}/enroll-role`,
  },
  ROLES: {
    LIST: '/v1/roles',
    DETAIL: (id: string) => `/v1/roles/${id}`,
  },
  PERMISSIONS: {
    LIST: '/v1/permissions',
  },
  ORGANIZATIONS: {
    LIST: '/v1/organizations',
    DETAIL: (id: string) => `/v1/organizations/${id}`,
    CHILDREN: (id: string) => `/v1/organizations/${id}/children`,
  },
  CLIENTS: {
    LIST: '/v1/clients',
    DETAIL: (id: string) => `/v1/clients/${id}`,
  },
  INTERNAL: {
    LIST: '/v1/internal',
    DETAIL: (id: string) => `/v1/internal/${id}`,
  },
};

export type Endpoints = typeof ENDPOINTS;
