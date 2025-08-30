import { auth } from '@/auth';

import HomePage from './HomePage';

export default async function Page() {
  // Get user session
  const session = await auth();

  // Render
  return <HomePage user={session?.user} />;
}
