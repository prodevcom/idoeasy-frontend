import type { AuthUser } from '@idoeasy/contracts';

import 'next-auth';
import 'next-auth/jwt';
import 'next/server';

// Extends the Session type (from `next-auth`)
// to include the `auth` property injected by `auth()` from NextAuth v5.
declare module 'next-auth' {
  interface Session {
    user?: AuthUser;
    accessToken?: string;
    refreshToken?: string;
    expiresAt?: number;
    hasAccess?: boolean;
  }
}

// Extends the JWT type (from `next-auth/jwt`)
// to include the `auth` property injected by `auth()` from NextAuth v5.
declare module 'next-auth/jwt' {
  interface JWT {
    user?: AuthUser;
    accessToken?: string;
    refreshToken?: string;
    expiresAt?: number;
    rolesSyncedAt?: number;
  }
}

/**
 * Extends the NextRequest type (from `next/server`)
 * to include the `auth` property injected by `auth()` from NextAuth v5.
 */
declare module 'next/server' {
  interface NextRequest {
    auth?: Session;
  }
}
