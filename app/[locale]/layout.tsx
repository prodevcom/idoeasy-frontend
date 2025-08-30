import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';

import { ExternalProviders } from '@/shared/providers';

import type { ReactNode } from 'react';

interface LocaleLayoutProps {
  children: ReactNode;
  params: Promise<{
    locale: string;
  }>;
}

export default async function LocaleLayout({ children, params }: LocaleLayoutProps) {
  const { locale } = await params;

  const messages = await getMessages({ locale });

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <ExternalProviders>{children}</ExternalProviders>
    </NextIntlClientProvider>
  );
}
