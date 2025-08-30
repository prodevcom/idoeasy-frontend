import { auth } from '@/auth';

import CreateUserPage from './CreateUserPage';

export default async function Page() {
  /** Load user role */

  const session = await auth();
  /** Render */

  return <CreateUserPage currentUser={session?.user} />;
}
