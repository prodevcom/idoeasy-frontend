'use client';

import { usePathname } from 'next/navigation';

// define the locales that your app uses
const LOCALES = ['en', 'pt-BR'] as const;

function stripLocale(pathname: string): string {
  const segments = pathname.split('/').filter(Boolean);
  if (segments.length > 0 && LOCALES.includes(segments[0] as (typeof LOCALES)[number])) {
    return '/' + segments.slice(1).join('/');
  }
  return pathname;
}

export function useActivePath() {
  const pathname = usePathname();
  const cleanPathname = stripLocale(pathname);

  const isActive = (href?: string) =>
    !!href && (cleanPathname === href || (href !== '/' && cleanPathname.startsWith(href)));

  return { pathname: cleanPathname, isActive };
}
