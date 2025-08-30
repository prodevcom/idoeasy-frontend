import type { LoginInput, LoginResponse } from '@/features/auth/api/dto';

export async function login(data: LoginInput): Promise<LoginResponse> {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    throw new Error('Failed to login');
  }

  return (await res.json()) as LoginResponse;
}
