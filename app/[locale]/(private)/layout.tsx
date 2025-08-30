import { redirect } from 'next/navigation';

import { auth } from '@/auth';

import AppShell from './AppShell';
import { PrivateProviders } from './PrivateProviders';

interface PrivateLayoutProps {
  children: React.ReactNode;
  params: Promise<{
    locale: string;
  }>;
}

export default async function PrivateLayout({ children, params }: PrivateLayoutProps) {
  const { locale } = await params;
  const session = await auth();

  if (!session?.user) {
    redirect(`/${locale}/login`);
  }

  return (
    <PrivateProviders>
      <AppShell user={session.user}>{children}</AppShell>
    </PrivateProviders>
  );
}
