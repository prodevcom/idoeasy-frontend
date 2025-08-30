import { redirect } from 'next/navigation';

import { auth } from '@/auth';

import LoginPage from './LoginPage';

export default async function Page() {
  // Get user session
  const session = await auth();
  if (session?.user) {
    redirect('/dash');
  }

  // Render
  return <LoginPage />;
}
