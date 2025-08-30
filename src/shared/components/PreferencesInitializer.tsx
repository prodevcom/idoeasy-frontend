'use client';

import { memo } from 'react';

import { usePreferencesInitialized } from '@/shared/contexts/PreferencesContext';

import type { ReactNode } from 'react';

interface PreferencesInitializerProps {
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * Component that ensures user preferences are initialized before rendering children
 * This is particularly useful for private routes where we need user data
 */
export const PreferencesInitializer = memo(function PreferencesInitializer({
  children,
  fallback = <div>Loading preferences...</div>,
}: PreferencesInitializerProps) {
  const isInitialized = usePreferencesInitialized();

  // Show fallback while preferences are being initialized
  if (!isInitialized) {
    return <>{fallback}</>;
  }

  // Render children once preferences are initialized
  return <>{children}</>;
});
