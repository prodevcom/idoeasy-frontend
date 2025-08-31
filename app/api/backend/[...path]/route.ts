import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { getToken } from 'next-auth/jwt';

/**
 * Base URL of your upstream API (must be provided at build/runtime).
 * Example: https://api.example.com/api/v1
 */
const BACKEND_URL = process.env.BACKEND_URL!;

/** Allowed HTTP methods for this proxy endpoint. */
const ALLOWED = new Set<Uppercase<string>>([
  'GET',
  'POST',
  'PUT',
  'PATCH',
  'DELETE',
  'OPTIONS',
  'HEAD',
]);

/** Next.js route params context. */
type RouteContext = { params: Promise<{ path?: string[] }> };

/* -------------------------------------------------------------------------- */
/*                             Utility / Type Guards                           */
/* -------------------------------------------------------------------------- */

/** Returns true if the HTTP method can include a request body. */
function methodAllowsBody(method: string): boolean {
  // GET/HEAD must not send bodies (per spec); OPTIONS typically no body.
  return !['GET', 'HEAD', 'OPTIONS'].includes(method.toUpperCase());
}

/**
 * Builds the upstream URL by joining the captured path segments and preserving
 * the original query string from the incoming request.
 */
function buildUpstreamUrl(req: NextRequest, path: string[]): string {
  // `req.nextUrl.search` already includes the leading "?" (or empty string).
  const suffix = path.join('/');
  return `${trimTrailingSlash(BACKEND_URL)}/${suffix}${req.nextUrl.search}`;
}

function trimTrailingSlash(url: string): string {
  return url.endsWith('/') ? url.slice(0, -1) : url;
}

/**
 * Selectively forward a subset of headers to the upstream.
 *  - Pass through content-type to preserve JSON/form/multipart behavior.
 *  - Pass through custom timezone header if present.
 *  - Always attach Authorization: Bearer <accessToken>.
 * Avoid forwarding hop-by-hop headers or cookies.
 */
function buildUpstreamHeaders(req: NextRequest, accessToken: string): Headers {
  const headers = new Headers();

  const contentType = req.headers.get('content-type');
  if (contentType) headers.set('content-type', contentType);

  const tz = req.headers.get('x-timezone');
  if (tz) headers.set('x-timezone', tz);

  // Forward User-Agent for backend tracking
  const userAgent = req.headers.get('user-agent');
  if (userAgent) headers.set('user-agent', userAgent);

  headers.set('authorization', `Bearer ${accessToken}`);

  return headers;
}

/* -------------------------------------------------------------------------- */
/*                                Core Forwarder                               */
/* -------------------------------------------------------------------------- */

/**
 * Forwards the incoming Next.js request to the upstream API, enforcing
 * authentication via next-auth JWT and streaming the upstream response back
 * to the client.
 */
async function forwardToUpstream(req: NextRequest, path: string[]) {
  const jwt = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const accessToken = jwt?.accessToken as string | undefined;

  if (!accessToken) {
    console.error('❌ [Backend Proxy] No access token found');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // 2) Build upstream target
  const url = buildUpstreamUrl(req, ['api', ...path]);
  const headers = buildUpstreamHeaders(req, accessToken);

  // 3) Extract request body only when allowed (avoids needless buffering)
  const includeBody = methodAllowsBody(req.method);
  const body = includeBody ? await req.arrayBuffer() : undefined;

  // 4) Forward
  let upstream: Response;
  try {
    upstream = await fetch(url, {
      method: req.method,
      headers,
      body,
      // Proxy endpoints should not cache
      cache: 'no-store',
      // Important when proxying credentials across domains is NOT intended
      // (we use Bearer tokens instead of cookies)
      redirect: 'manual',
    });
  } catch (err) {
    // Network / DNS / upstream down
    return NextResponse.json(
      { error: 'Upstream fetch failed', details: (err as Error).message },
      { status: 502 },
    );
  }

  // 5) Stream upstream response back to the client
  // Copy only relevant headers; ensure content-type is set.
  const responseHeaders = new Headers();
  const upstreamContentType = upstream.headers.get('content-type');

  if (upstreamContentType) {
    responseHeaders.set('content-type', upstreamContentType);
  } else {
    responseHeaders.set('content-type', 'application/json');
  }

  // Optionally propagate other safe headers (rate-limit, pagination, etc.)
  // Add any you need below:
  const passthroughHeaderNames = [
    'x-rate-limit-remaining',
    'x-rate-limit-limit',
    'x-rate-limit-reset',
    'content-disposition', // useful for file downloads
  ];
  for (const name of passthroughHeaderNames) {
    const v = upstream.headers.get(name);
    if (v) responseHeaders.set(name, v);
  }

  return new NextResponse(upstream.body, {
    status: upstream.status,
    headers: responseHeaders,
  });
}

/* -------------------------------------------------------------------------- */
/*                                  Handlers                                   */
/* -------------------------------------------------------------------------- */

/**
 * Generic handler that validates the method, extracts `[...path]`, and forwards.
 */
async function handler(req: NextRequest, ctx: RouteContext) {
  const { path = [] } = await ctx.params;

  const method = req.method.toUpperCase() as Uppercase<string>;
  if (!ALLOWED.has(method)) {
    return new NextResponse('Method Not Allowed', {
      status: 405,
      headers: { allow: Array.from(ALLOWED).join(', ') },
    });
  }

  // If you want to *terminate* preflight here, uncomment below:
  // if (method === "OPTIONS") {
  //   // Tailor these headers to your CORS policy as needed.
  //   return new NextResponse(null, {
  //     status: 204,
  //     headers: {
  //       "access-control-allow-origin": "*",
  //       "access-control-allow-headers": "authorization, content-type, x-timezone",
  //       "access-control-allow-methods": Array.from(ALLOWED).join(", "),
  //       "access-control-max-age": "600",
  //     },
  //   });
  // }

  return forwardToUpstream(req, path);
}

/* -------------------------------------------------------------------------- */
/*                             HTTP Method Exports                             */
/* -------------------------------------------------------------------------- */

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const PATCH = handler;
export const DELETE = handler;
export const OPTIONS = handler;
export const HEAD = handler;
