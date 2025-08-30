import { auth } from '@/auth';

import UpdateUserPage from './UpdateUserPage';

export default async function Page() {
  /** Load user role */

  const session = await auth();
  /** Render */

  return <UpdateUserPage currentUser={session?.user} />;
}
