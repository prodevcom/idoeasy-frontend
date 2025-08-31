import NextAuth, { type NextAuthConfig, type Session } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';

import type { Authentication, AuthUser, User } from '@entech/contracts';

import { backend } from '@/server';
import type { ApiSuccess } from '@/shared/api';
import { ENDPOINTS } from '@/shared/api';

import type { JWT } from 'next-auth/jwt';

const ROLES_SYNC_INTERVAL_MS = 15 * 60 * 1000;

/**
 * Appends user token to JWT
 *
 * @param token - JWT
 * @param authUser - AuthUser
 * @returns JWT
 */
const appendUserToken = ({ token, authUser }: { token: JWT; authUser: AuthUser }) => {
  token.user = authUser;
  token.accessToken = authUser.accessToken;
  token.refreshToken = authUser.refreshToken;
  token.expiresAt = Date.now() + (authUser.expiresIn ?? 3600) * 1000;
  token.rolesSyncedAt = 0;

  return token;
};

/**
 * Refreshes token if needed
 *
 * @param token - JWT
 * @returns JWT
 */
const performRefreshTokenIfNeeded = async (token: JWT) => {
  const expiresAt = token.expiresAt ?? 0;
  const shouldRefresh = expiresAt - Date.now() < 1000;

  if (!shouldRefresh) return token;

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/auth/refresh`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ refreshToken: token.refreshToken }),
    });

    if (!res.ok) throw new Error('Failed to refresh');
    const data = await res.json();

    return {
      ...token,
      accessToken: data.data.accessToken,
      refreshToken: data.data.refreshToken ?? token.refreshToken,
      expiresAt: Date.now() + data.data.expiresIn * 1000,
    };
  } catch {
    return { ...token, error: 'RefreshAccessTokenError' };
  }
};

/**
 * Syncs roles if needed
 *
 * @param token - JWT
 * @returns JWT
 */
const performSyncRolesIfNeeded = async (token: JWT) => {
  const last = token.rolesSyncedAt ?? 0;
  const shouldSync = Date.now() - last > ROLES_SYNC_INTERVAL_MS;

  // Only sync if we have a valid token and user
  if (shouldSync && token.accessToken && token.user?.id) {
    try {
      const response = await backend.get<ApiSuccess<User>>(ENDPOINTS.ME.PROFILE);
      const me = response.data;

      const role = me.role
        ? {
            id: me.role.id,
            name: me.role.name,
            isAdmin: me.role.isAdmin ?? false,
            permissions: me.role.permissions ?? [],
          }
        : undefined;

      token.user = {
        ...(token.user as AuthUser | undefined),
        id: token.user?.id ?? me.id,
        name: me.name ?? token.user?.name,
        email: me.email ?? token.user?.email,
        role,
      } as AuthUser;

      token.rolesSyncedAt = Date.now();
    } catch {
      // If sync fails, don't retry immediately
      token.rolesSyncedAt = Date.now() + 60_000;
    }
  }

  return token;
};

/**
 * Authentication Configuration
 *
 * @see https://next-auth.js.org/configuration/options
 */
export const authConfig = {
  providers: [
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const email = credentials?.email as string;
        const password = credentials?.password as string;
        if (!email || !password) return null;

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api${ENDPOINTS.AUTH.LOGIN}`,
          {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ email, password }),
            cache: 'no-store',
          },
        );
        if (!res.ok) return null;

        const response = (await res.json()) as ApiSuccess<Authentication>;

        const authUser = {
          ...response.data.user,
          accessToken: response.data.accessToken,
          refreshToken: response.data.refreshToken,
          expiresIn: response.data.expiresIn,
        } as AuthUser;

        return authUser;
      },
    }),
  ],
  pages: { signIn: '/login' },

  // Fix for UntrustedHost error in production
  trustHost: process.env.NEXT_PUBLIC_NEXTAUTH_TRUST_HOST === 'true',

  // Fix for localhost redirects in production
  basePath: process.env.NEXT_PUBLIC_NEXTAUTH_BASE_PATH || '/api/auth',

  // Fix for session persistence in production
  ...(process.env.NODE_ENV === 'production' && {
    cookies: {
      sessionToken: {
        name: '__Secure-next-auth.session-token',
        options: {
          httpOnly: true,
          sameSite: 'lax',
          path: '/',
          secure: true,
          ...(process.env.NODE_ENV === 'production' ? { domain: '.idoeasy.net' } : {}),
        },
      },
      callbackUrl: {
        name: 'next-auth.callback-url',
        options: {
          httpOnly: false,
          sameSite: 'lax',
          path: '/',
          secure: true,
          ...(process.env.NODE_ENV === 'production' ? { domain: '.idoeasy.net' } : {}),
        },
      },
      csrfToken: {
        name: 'next-auth.csrf-token',
        options: {
          httpOnly: false,
          sameSite: 'lax',
          path: '/',
          secure: true,
          ...(process.env.NODE_ENV === 'production' ? { domain: '.idoeasy.net' } : {}),
        },
      },
    },
  }),

  // Optimize session handling to reduce unnecessary calls
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // 24 hours - only update session once per day
  },

  // Reduce JWT callback frequency
  jwt: {
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  // Enable debug only in development
  debug: process.env.NODE_ENV === 'development',

  // Secret key for NextAuth
  secret: process.env.NEXT_PUBLIC_NEXTAUTH_SECRET,

  // Add events for better control
  events: {
    async signIn({ user }) {
      console.debug('NextAuth: User signed in', user.email);
    },
    async signOut() {
      console.debug('NextAuth: User signed out');
    },
  },

  callbacks: {
    async jwt({ token, user }) {
      const authUser = user as AuthUser;

      // Injecting User into JWT only on sign in
      if (user) {
        token = appendUserToken({ token, authUser });
      }

      // Only perform expensive operations on specific triggers or when needed
      if (token.accessToken && token.user?.id) {
        // Only refresh token when it's about to expire (within 5 minutes)
        const expiresAt = token.expiresAt ?? 0;
        const shouldRefresh = expiresAt - Date.now() < 5 * 60 * 1000; // 5 minutes

        if (shouldRefresh) {
          token = await performRefreshTokenIfNeeded(token);
        }

        // Only sync roles when needed (every 15 minutes instead of every call)
        const lastSync = token.rolesSyncedAt ?? 0;
        const shouldSync = Date.now() - lastSync > ROLES_SYNC_INTERVAL_MS;

        if (shouldSync) {
          token = await performSyncRolesIfNeeded(token);
        }
      }

      return token;
    },

    async session({ session, token }: { session: Session; token: JWT }) {
      if (token?.user) session.user = token.user as AuthUser;
      session.accessToken = token.accessToken;
      session.refreshToken = token.refreshToken;
      session.expiresAt = token.expiresAt;
      session.hasAccess = Boolean(token?.accessToken);

      return session;
    },
  },
} satisfies NextAuthConfig;

export const { auth, handlers, signIn, signOut } = NextAuth(authConfig);
