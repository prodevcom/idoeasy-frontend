import { auth } from '@/auth';

export default async function Page() {
  /** Load user role */
  const session = await auth();

  /** Render */
  return (
    <div>
      <h1>User</h1>
    </div>
  );
}
