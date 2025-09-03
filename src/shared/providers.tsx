'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { memo, useState } from 'react';

import { PreferencesInitializer } from './components';
import {
  BreadcrumbProvider,
  ModalProvider,
  NotificationsProvider,
  PreferencesProvider,
} from './contexts';

import type { ReactNode } from 'react';

// Shared QueryClient configuration to prevent unnecessary API calls
const createQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        // Prevent unnecessary re-fetches
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        refetchOnReconnect: false,
        // Retry only on network errors, not on 4xx responses
        retry: (failureCount, error: unknown) => {
          if ((error as { response?: { status?: number } })?.response?.status) {
            return false; // Don't retry on HTTP errors
          }
          return failureCount < 2;
        },
        // Add stale time to prevent unnecessary re-fetches
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
      },
      mutations: {
        // Retry mutations only on network errors
        retry: (failureCount, error: unknown) => {
          if ((error as { response?: { status?: number } })?.response?.status) {
            return false;
          }
          return failureCount < 1; // Only retry once for mutations
        },
      },
    },
  });

/**
 * Basic providers for public routes (login, etc.)
 * Does NOT include PreferencesProvider to avoid API calls
 */
export const ExternalProviders = memo(function ExternalProviders({
  children,
}: {
  children: ReactNode;
}) {
  const [client] = useState(createQueryClient);

  return (
    <QueryClientProvider client={client}>
      <NotificationsProvider>
        <ModalProvider>{children}</ModalProvider>
      </NotificationsProvider>
    </QueryClientProvider>
  );
});

/**
 * Full providers for private routes (dashboard, etc.)
 * Includes all providers including PreferencesProvider and SessionProvider
 */
export const InternalProviders = memo(function InternalProviders({
  children,
}: {
  children: ReactNode;
}) {
  const [client] = useState(createQueryClient);

  return (
    <QueryClientProvider client={client}>
      <NotificationsProvider>
        <PreferencesProvider>
          <PreferencesInitializer>
            <ModalProvider>
              <BreadcrumbProvider>{children}</BreadcrumbProvider>
            </ModalProvider>
          </PreferencesInitializer>
        </PreferencesProvider>
      </NotificationsProvider>
    </QueryClientProvider>
  );
});
