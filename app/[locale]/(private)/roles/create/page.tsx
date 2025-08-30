import { auth } from '@/auth';

import CreateRolePage from './createRolePage';

export default async function Page() {
  /** Load user role */
  const session = await auth();

  /** Render */
  return <CreateRolePage userRole={session?.user?.role} />;
}
