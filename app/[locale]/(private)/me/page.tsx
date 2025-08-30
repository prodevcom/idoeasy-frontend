import '@/features/me/ui/scss/profile.custom.scss';

import { auth } from '@/auth';

import ProfilePage from './ProfilePage';

export default async function Page() {
  /** Load user role */
  const session = await auth();

  /** Render */
  return <ProfilePage currentUser={session?.user} />;
}
