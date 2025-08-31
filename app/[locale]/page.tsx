import { auth } from '@/auth';

import HomePage from './HomePage';

export default async function Page() {
  // Get user session
  const session = await auth();

  const backendUrl = process.env.BACKEND_URL;
  const nextauthTrustHost = process.env.NEXTAUTH_TRUST_HOST;
  const nextauthBasePath = process.env.NEXTAUTH_BASE_PATH;
  const nodeEnv = process.env.NODE_ENV;

  // Render
  return (
    <HomePage
      user={session?.user}
      options={{ backendUrl, nextauthTrustHost, nextauthBasePath, nodeEnv }}
    />
  );
}
