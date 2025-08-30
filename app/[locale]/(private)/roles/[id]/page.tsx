import { auth } from '@/auth';

import UpdateRolePage from './updateRolePage';

export default async function Page() {
  /** Load user role */
  const session = await auth();

  /** Render */
  return <UpdateRolePage userRole={session?.user?.role} />;
}
