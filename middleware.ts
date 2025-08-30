// middleware.ts
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import createMiddleware from 'next-intl/middleware';

import type { AuthUser, Permission } from '@entech/contracts';

import { defaultLocale, locales, type Locale } from './i18n';

/**
 * -----------------------------------------------------------------------------
 * RBAC Middleware (Convention-first)
 * -----------------------------------------------------------------------------
 * - Public paths bypass auth
 * - Otherwise requires session
 * - Infers permission from URL:
 *     resource = first non-empty segment (must not be numeric)
 *     action   = 'create' if ends with new/create
 *              = 'update' if ends with edit/update OR trailing Mongo ObjectId
 *              = 'read'   otherwise
 * - Optional overrides (regex → permission|null)
 * - Adds `x-required-permission` header for observability
 * - Pages: redirect on 401/403 (APIs excluded by matcher)
 * -----------------------------------------------------------------------------
 */

/** Public routes (no auth) */
const PUBLIC_PATHS = new Set<string>([
  '/',
  '/pt-BR',
  '/en',
  '/pt-BR/',
  '/en/',
  '/pt-BR/login',
  '/en/login',
  '/pt-BR/403',
  '/en/403',
  '/pt-BR/404',
  '/en/404',
]);

/** Optional explicit overrides (regex → permission|null) */
const OVERRIDES: Array<{ test: RegExp; permission: string | null }> = [
  // Example: health checks anywhere -> public
  // { test: /^\/health(?:z)?$/i, permission: null },
];

/** Fast, precompiled regexes */
const RE_NUMERIC = /^\d+$/;
const RE_MONGO_OBJECTID = /^[a-f0-9]{24}$/i;

/** Asset prefixes for quick bypass */
const ASSET_PREFIXES = ['/_next', '/favicon', '/assets'] as const;

/** Allowed actions */
type Action = 'read' | 'create' | 'update';

/** Small util: normalize path (strip trailing slash except root) */
function normalizePathname(pathname: string): string {
  if (pathname.length > 1 && pathname.endsWith('/')) return pathname.slice(0, -1);
  return pathname;
}

/** Returns true if request targets framework/static assets */
function isAssetPath(pathname: string): boolean {
  if (ASSET_PREFIXES.some((p) => pathname.startsWith(p))) return true;
  // static file extensions
  if (/\.(png|jpg|jpeg|gif|webp|svg|ico|css|js|map)$/i.test(pathname)) return true;
  return false;
}

/** First non-empty segment (resource candidate) */
function inferResource(pathname: string): string | null {
  const segments = pathname.split('/').filter(Boolean);
  // Skip locale segment if present
  const firstSegment = segments[0];
  if (firstSegment && locales.includes(firstSegment as Locale)) {
    return segments[1] ?? null;
  }
  return firstSegment ?? null;
}

/**
 * Infer action by last segment:
 * - trailing Mongo ObjectId → 'update'
 * - 'edit'|'update' → 'update'
 * - 'new'|'create' → 'create'
 * - else → 'read'
 */
function inferAction(pathname: string): Action {
  const segments = pathname.split('/').filter(Boolean);
  const last = segments[segments.length - 1]?.toLowerCase();
  if (!last) return 'read';

  if (isMongoObjectId(last)) return 'update';
  if (last === 'edit' || last === 'update') return 'update';
  if (last === 'new' || last === 'create') return 'create';

  return 'read';
}

/** Guard helpers */
function isNumeric(s: string | null): boolean {
  return !!s && RE_NUMERIC.test(s);
}
function isMongoObjectId(s: string | null): boolean {
  return !!s && RE_MONGO_OBJECTID.test(s);
}

/**
 * Compute permission from path with:
 * 1) OVERRIDES (regex) taking precedence
 * 2) Public path bypass
 * 3) Convention: "<resource>.<action>"
 */
function permissionFromPath(pathname: string): string | null {
  for (const o of OVERRIDES) {
    if (o.test.test(pathname)) return o.permission; // explicit override
  }

  if (PUBLIC_PATHS.has(pathname)) return null;

  const resource = inferResource(pathname);
  if (!resource || isNumeric(resource)) return null; // ignore numeric/invalid roots

  const action = inferAction(pathname);
  return `${resource}.${action}`;
}

// Create NextIntl middleware
const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'always',
});

// Create auth middleware function
function createAuthMiddleware(req: NextRequest) {
  const pathname = normalizePathname(req.nextUrl.pathname);
  const search = req.nextUrl.search;

  // 1) Bypass static/asset requests early
  if (isAssetPath(pathname)) {
    return NextResponse.next();
  }

  // 2) Public paths bypass auth
  if (PUBLIC_PATHS.has(pathname)) {
    return NextResponse.next();
  }

  // 3) Require authenticated session
  const user = req.auth?.user as AuthUser | undefined;
  if (!user?.id) {
    // Extract locale from pathname or use default
    const segments = pathname.split('/').filter(Boolean);
    const locale =
      segments[0] && locales.includes(segments[0] as Locale) ? segments[0] : defaultLocale;
    const url = new URL(`/${locale}/login`, req.url);
    url.searchParams.set('next', `${pathname}${search || ''}`);
    return NextResponse.redirect(url);
  }

  // 4) Permission inference (+ overrides)
  const required = permissionFromPath(pathname);
  if (!required) {
    // Authenticated, but no specific permission needed
    return NextResponse.next();
  }

  // 5) Admin bypass / permission check
  const role = user.role;
  const isAdmin = Boolean(role?.isAdmin);
  if (!isAdmin) {
    const perms: Permission[] = role?.permissions ?? [];
    const has = perms.some((p) => p.name === required);
    if (!has) {
      // Extract locale from pathname or use default
      const segments = pathname.split('/').filter(Boolean);
      const locale =
        segments[0] && locales.includes(segments[0] as Locale) ? segments[0] : defaultLocale;
      return NextResponse.redirect(new URL(`/${locale}/403`, req.url));
    }
  }

  // 6) Annotate request for observability/upstream use
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set('x-required-permission', required);
  requestHeaders.set('x-auth-user-id', String(user.id));

  return NextResponse.next({ request: { headers: requestHeaders } });
}

// Combine NextIntl and auth middleware
export default function middleware(req: NextRequest) {
  // First, handle internationalization
  const intlResponse = intlMiddleware(req);
  if (intlResponse) return intlResponse;

  // Then, handle authentication and authorization
  return createAuthMiddleware(req);
}

export const config = {
  matcher: [
    // Exclude APIs and static; protect only "pages"
    '/((?!api|_next/static|_next/image|favicon.ico|assets|.*\\.(?:png|jpg|jpeg|gif|webp|svg|ico|css|js|map)).*)',
  ],
};
