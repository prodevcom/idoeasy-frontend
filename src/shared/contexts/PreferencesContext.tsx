'use client';

import { usePathname } from 'next/navigation';

import { signOut } from 'next-auth/react';
import { createContext, memo, useContext, useEffect, useMemo, useState } from 'react';

import type { UserPreferences } from '@entech/contracts';

import { useCurrentUser } from '@/features/me';

import { getUserPreferences } from '../helpers';

import type { ReactNode } from 'react';

interface PreferencesContextType {
  preferences: UserPreferences;
  isLoading: boolean;
  isInitialized: boolean;
}

const PreferencesContext = createContext<PreferencesContextType | undefined>(undefined);

interface PreferencesProviderProps {
  children: ReactNode;
}

export const PreferencesProvider = memo(function PreferencesProvider({
  children,
}: PreferencesProviderProps) {
  const pathname = usePathname();
  const [isClient, setIsClient] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Memoize shouldFetchUser to prevent unnecessary hook calls
  const shouldFetchUser = useMemo(() => {
    // Se já deu erro ou está fazendo logout, não tenta mais buscar dados
    return isClient && !hasError && !isLoggingOut;
  }, [isClient, hasError, isLoggingOut]);

  // Only call useCurrentUser when we actually need user data
  const { data: userData, isLoading, isSuccess, isError, error } = useCurrentUser(shouldFetchUser);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Se der erro 401/403, executa logout completo
  useEffect(() => {
    if (isError && error && !hasError && !isLoggingOut) {
      const status = (error as { response?: { status?: number } })?.response?.status;

      if (status === 401 || status === 403) {
        // Não executa logout se ainda está carregando inicialmente
        if (isLoading) {
          return;
        }

        // Adiciona delay para evitar logout prematuro durante login inicial
        const timeoutId = setTimeout(() => {
          // Verifica se ainda está com erro após o delay e não está carregando
          if (isError && !isSuccess && !isLoading) {
            setHasError(true);
            setIsLoggingOut(true);
            executeLogout(pathname);
          }
        }, 2000); // 2 segundos de delay

        // Cleanup do timeout se o componente for desmontado
        return () => clearTimeout(timeoutId);
      }
    }
  }, [isError, error, hasError, isLoggingOut, pathname, isSuccess, isLoading]);

  // Memoize preferences to prevent unnecessary recalculations
  const preferences = useMemo(() => {
    if (!isClient) {
      // Return default preferences on server side
      return {
        locale: 'en', // Use default locale from i18n config
        timeZone: 'UTC',
        showTimezoneOffset: false,
      };
    }

    // Se deu erro, usa preferências padrão
    if (hasError) {
      return getUserPreferences(null);
    }

    return getUserPreferences(userData?.data);
  }, [isClient, userData?.data, hasError]);

  // Check if preferences have been initialized (either from API or local storage)
  const isInitialized = useMemo(() => {
    if (hasError) return true; // Se deu erro, considera inicializado
    return isClient && (isSuccess || preferences.locale !== 'en'); // Check if we have real data
  }, [isClient, isSuccess, preferences.locale, hasError]);

  // Memoize the context value to prevent unnecessary re-renders
  const value = useMemo<PreferencesContextType>(
    () => ({
      preferences,
      isLoading: isLoading && !hasError, // No loading state when there's an error
      isInitialized,
    }),
    [preferences, isLoading, isInitialized, hasError],
  );

  // Se está fazendo logout, não renderiza nada
  if (isLoggingOut) {
    return <div>Logging out...</div>;
  }

  return <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>;
});

/**
 * Hook to access user preferences from context
 * This replaces the old useUserPreferences hook for getting preferences
 */
export function usePreferences(): PreferencesContextType {
  const context = useContext(PreferencesContext);

  if (context === undefined) {
    throw new Error('usePreferences must be used within a PreferencesProvider');
  }

  return context;
}

/**
 * Hook to access just the preferences object (most common use case)
 */
export function useUserPreferencesContext(): UserPreferences {
  const { preferences } = usePreferences();
  return preferences;
}

/**
 * Hook to check if preferences have been initialized
 * Useful for showing loading states or fallbacks
 */
export function usePreferencesInitialized(): boolean {
  const { isInitialized } = usePreferences();
  return isInitialized;
}

/**
 * Executa logout completo
 * @param pathname - Pathname to redirect to login
 */
const executeLogout = async (pathname: string) => {
  try {
    // 1. Limpa cookies manualmente
    document.cookie.split(';').forEach((c) => {
      const eqPos = c.indexOf('=');
      const name = eqPos > -1 ? c.substring(0, eqPos) : c;
      document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/';
    });

    // 2. Limpa localStorage
    localStorage.clear();

    // 3. Limpa sessionStorage
    sessionStorage.clear();

    // 4. Executa signOut do NextAuth
    await signOut({
      redirect: false,
      callbackUrl: '/login',
    });

    // 5. Redireciona para login com locale correto
    const segments = pathname.split('/').filter(Boolean);
    const locale = segments[0] && ['en', 'pt-BR'].includes(segments[0]) ? segments[0] : 'en';
    const nextPath = encodeURIComponent(pathname);
    const loginUrl = `/${locale}/login?next=${nextPath}`;

    window.location.href = loginUrl;
  } catch {
    const segments = pathname.split('/').filter(Boolean);
    const locale = segments[0] && ['en', 'pt-BR'].includes(segments[0]) ? segments[0] : 'en';
    const nextPath = encodeURIComponent(pathname);
    const loginUrl = `/${locale}/login?next=${nextPath}`;
    window.location.href = loginUrl;
  }
};
