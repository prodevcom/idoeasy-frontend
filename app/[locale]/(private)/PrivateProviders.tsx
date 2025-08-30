'use client';

import { memo } from 'react';

import { InternalProviders } from '@/shared/providers';

import type { ReactNode } from 'react';

/**
 * Private providers for authenticated routes
 * Uses shared Providers to avoid duplicate SessionProvider
 */
export const PrivateProviders = memo(function PrivateProviders({
  children,
}: {
  children: ReactNode;
}) {
  return <InternalProviders>{children}</InternalProviders>;
});
