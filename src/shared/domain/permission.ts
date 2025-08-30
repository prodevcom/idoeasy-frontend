import type { Permission } from '@entech/contracts';

/**
 * This PermissionActions is used only for navigation purposes.
 * We use the raw permission list to check if the user has the permission.
 */
export enum PermissionActions {
  Create = 'create',
  Update = 'update',
  Delete = 'delete',
  Read = 'read',
}

/**
 * Permissions actions for the role.
 */
export type Authorizer = {
  /** Check if the user has the admin role */
  isAdmin(): boolean;
  /** Create permission */
  canCreate(): boolean;
  /** Read permission */
  canRead(): boolean;
  /** Update permission */
  canUpdate(): boolean;
  /** Delete permission */
  canDelete(): boolean;
  /** Generic checker for custom actions (e.g. "read", "export", ...). */
  can(action: string): boolean;
  /** Direct name lookup, e.g. "roles.create" */
  has(fullName: string): boolean;
  /** Raw list, in case you need to debug/show badges */
  raw: Permission[];
};
