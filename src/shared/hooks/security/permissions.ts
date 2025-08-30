import type { Authorizer } from '@/shared/domain';
import { PermissionActions } from '@/shared/domain';

import type { AuthUser, Permission } from '@entech/contracts';

export function createAuthorizer(moduleKey: string, currentUser?: AuthUser): Authorizer {
  const perms = currentUser?.role?.permissions ?? [];

  const matches = (p: Permission, action: string) =>
    p.name === `${moduleKey}.${action}` ||
    p.name === `${moduleKey}:${action}` ||
    (p.module === moduleKey &&
      (p.action === action || (Array.isArray(p.action) && p.action.includes(action))));

  const check = (action: string) =>
    currentUser?.role?.isAdmin || perms.some((p: Permission) => matches(p, action));

  return {
    isAdmin: () => currentUser?.role?.isAdmin ?? false,
    canCreate: () => check(PermissionActions.Create),
    canRead: () => check(PermissionActions.Read),
    canUpdate: () => check(PermissionActions.Update),
    canDelete: () => check(PermissionActions.Delete),
    can: check,
    has: (actionName: string) => perms.some((p: Permission) => p.name === actionName),
    raw: perms,
  };
}
