import { cache } from 'react';

import { api } from '@/shared/api';
import { ENDPOINTS } from '@/shared/api/endpoints';

export const getHealth = cache(async () =>
  api<{ status: 'OK'; timestamp: string }>(ENDPOINTS.HEALTH.STATUS),
);
