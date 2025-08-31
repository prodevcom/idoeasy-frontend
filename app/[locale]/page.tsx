import { auth } from '@/auth';

import HomePage from './HomePage';

export default async function Page() {
  // Get user session
  const session = await auth();

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
  const nextauthTrustHost = process.env.NEXT_PUBLIC_NEXTAUTH_TRUST_HOST;
  const nextauthBasePath = process.env.NEXT_PUBLIC_NEXTAUTH_BASE_PATH;
  const nodeEnv = process.env.NODE_ENV;

  // Render
  return (
    <HomePage
      user={session?.user}
      options={{ backendUrl, nextauthTrustHost, nextauthBasePath, nodeEnv }}
    />
  );
}
