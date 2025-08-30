import { auth } from '@/auth';

import RolesPage from './RolesPage';

export default async function Page() {
  /** Load user role */
  const session = await auth();

  /** Render */
  return <RolesPage currentUser={session?.user} />;
}
