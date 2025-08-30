export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface StatusResponse {
  status: string;
  message: string;
  timestamp: string;
  path: string;
}

export interface ApiSuccess<T> {
  success: true;
  status: StatusResponse;
  data: T;
  pagination?: Pagination;
}

export interface ApiError {
  success: false;
  status: StatusResponse;
  data: null | Record<string, string[]> | unknown;
  error?: string;
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError;

export class ApiClientError extends Error {
  status: number;
  payload?: ApiError;

  constructor(message: string, status: number, payload?: ApiError) {
    super(message);
    this.name = 'ApiClientError';
    this.status = status;
    this.payload = payload;
  }
}
