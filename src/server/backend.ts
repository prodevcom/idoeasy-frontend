import { headers } from 'next/headers';

import 'server-only';

async function getBaseUrl() {
  try {
    const h = await headers();
    const host = h.get('x-forwarded-host') ?? h.get('host');
    if (host) {
      const proto = h.get('x-forwarded-proto') ?? 'http';
      return `${proto}://${host}`;
    }
  } catch {}
  const fromEnv =
    process.env.NEXT_PUBLIC_APP_URL ??
    process.env.APP_URL ??
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null);

  if (!fromEnv) throw new Error('Could not resolve base URL.');
  return fromEnv.replace(/\/+$/, '');
}

function buildUrl(base: string, path: string, searchParams?: Record<string, unknown>) {
  const url = new URL(`/api/backend/${path.replace(/^\/+/, '')}`, base);
  if (searchParams) {
    for (const [k, v] of Object.entries(searchParams)) {
      if (v === undefined || v === null) continue;
      if (Array.isArray(v)) v.forEach((vv) => url.searchParams.append(k, String(vv)));
      else url.searchParams.set(k, String(v));
    }
  }
  return url.toString();
}

function isRawBody(body: unknown): body is ArrayBuffer | Blob | FormData | ReadableStream {
  return (
    body instanceof ArrayBuffer ||
    body instanceof Blob ||
    (typeof FormData !== 'undefined' && body instanceof FormData) ||
    (typeof ReadableStream !== 'undefined' && body instanceof ReadableStream)
  );
}

async function requestBackend<T>(
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE',
  path: string,
  opts?: { searchParams?: Record<string, unknown>; body?: unknown; init?: RequestInit },
): Promise<T> {
  const base = await getBaseUrl();
  const url = buildUrl(base, path, opts?.searchParams);

  const h = await headers();
  const cookie = h.get('cookie') ?? '';

  const initHeaders: HeadersInit = { ...(opts?.init?.headers || {}) };

  let body: BodyInit | undefined;
  if (opts?.body !== undefined) {
    if (isRawBody(opts.body)) {
      body = opts.body as BodyInit;
    } else {
      body = JSON.stringify(opts.body);
      if (!('Content-Type' in initHeaders)) {
        initHeaders['Content-Type' as keyof HeadersInit] = 'application/json';
      }
    }
  }

  const res = await fetch(url, {
    method,
    cache: 'no-store',
    ...opts?.init,
    headers: {
      ...initHeaders,
      cookie,
    },
    body: method === 'GET' || method === 'DELETE' ? undefined : body,
  });

  if (res.status === 204) return undefined as T;
  if (res.status === 401) {
    window.location.href = '/login';
  }
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Backend ${res.status} for ${url}: ${text}`);
  }

  const contentType = res.headers.get('content-type') ?? '';
  if (contentType.includes('application/json')) {
    return res.json() as Promise<T>;
  }
  return res.text() as unknown as T;
}

export const backend = {
  get: <T = unknown>(
    path: string,
    opts?: { searchParams?: Record<string, unknown>; init?: RequestInit },
  ) => requestBackend<T>('GET', path, opts),
  post: <T = unknown>(
    path: string,
    body?: unknown,
    opts?: { searchParams?: Record<string, unknown>; init?: RequestInit },
  ) => requestBackend<T>('POST', path, { ...opts, body }),
  patch: <T = unknown>(
    path: string,
    body?: unknown,
    opts?: { searchParams?: Record<string, unknown>; init?: RequestInit },
  ) => requestBackend<T>('PATCH', path, { ...opts, body }),
  delete: <T = unknown>(
    path: string,
    opts?: { searchParams?: Record<string, unknown>; init?: RequestInit },
  ) => requestBackend<T>('DELETE', path, opts),
};
