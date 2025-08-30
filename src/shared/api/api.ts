import type { AxiosRequestHeaders } from 'axios';
import axios from 'axios';

import { ApiClientError } from './types';

import type { ApiError, ApiResponse } from './types';

export const api = axios.create({
  baseURL: '/api/backend',
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (tz) (config.headers ??= {} as AxiosRequestHeaders)['X-Timezone'] = tz;
  } catch {}
  return config;
});

api.interceptors.response.use(
  (response) => {
    const body = response.data as ApiResponse<unknown>;
    if (body?.success === false) {
      const err = body as ApiError;
      throw new ApiClientError(err.status.message, response.status, err);
    }
    return response;
  },
  (error) => {
    const status = error.response?.status;
    if (status === 401) {
      window.location.href = '/login';
      return Promise.reject(error);
    }

    if (error.response) {
      const body = error.response.data as ApiError;
      throw new ApiClientError(body?.status?.message || error.message, error.response.status, body);
    }
    throw error;
  },
);
