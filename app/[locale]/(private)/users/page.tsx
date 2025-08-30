import { auth } from '@/auth';

import UsersPage from './UsersPage';

export default async function Page() {
  /** Load user role */
  const session = await auth();

  /** Render */
  return <UsersPage currentUser={session?.user} />;
}
