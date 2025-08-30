'use client';

import type { AuthUser } from '@entech/contracts';

import { RoleDataTables } from '@/features/roles';
import { createAuthorizer } from '@/shared/hooks';

const ROLES_KEY = 'roles';

type RolePageProps = {
  currentUser?: AuthUser;
};

export default function RolesPage({ currentUser }: RolePageProps) {
  const authorizer = createAuthorizer(ROLES_KEY, currentUser);

  return <RoleDataTables authorizer={authorizer} />;
}
