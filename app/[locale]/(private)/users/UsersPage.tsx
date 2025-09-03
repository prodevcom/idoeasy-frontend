'use client';

import type { AuthUser } from '@idoeasy/contracts';

import { UserDataTable } from '@/features/users';
import { createAuthorizer } from '@/shared/hooks';

const USERS_KEY = 'users';

type UsersPageProps = {
  currentUser?: AuthUser;
};
export default function UsersPage({ currentUser }: UsersPageProps) {
  const authorizer = createAuthorizer(USERS_KEY, currentUser);

  return <UserDataTable authorizer={authorizer} />;
}
