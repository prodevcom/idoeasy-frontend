import { cache } from 'react';
import 'server-only';

import type { Permission, RoleWithPermissions } from '@entech/contracts';

import { ENDPOINTS } from '@/shared/api/endpoints';

import { backend } from '../backend';

/** === Types returned by your /me endpoint (adjust if needed) === */
type MeProfile = { role?: RoleWithPermissions };
type MeResponse = { data: MeProfile };

/** === Per-request memoized fetch of the profile ===
 * Ensures a single /me call per request lifecycle.
 */
const getProfile = cache(async (): Promise<MeProfile> => {
  const json = await backend.get<MeResponse>(ENDPOINTS.ME.PROFILE);
  return json?.data ?? {};
});

/** Build a fast lookup Set (active permissions only) */
function toPermissionSet(role?: RoleWithPermissions): Set<string> {
  const list = role?.permissions ?? [];
  const names = list.filter((p) => p?.name && (p.isActive ?? true)).map((p) => p.name);
  return new Set(names);
}

/** === Public API === */

/** Returns the current user's role */
export async function getRole(): Promise<RoleWithPermissions | undefined> {
  const { role } = await getProfile();
  return role;
}

/** Checks if the current user has a specific permission (or is admin). */
export async function validatePermission(permission: string): Promise<boolean> {
  const { role } = await getProfile();
  if (role?.isAdmin) return true;
  if (!permission) return false;
  return toPermissionSet(role).has(permission);
}

/** Checks if the user has ANY of the listed permissions (or is admin). */
export async function validateAnyPermission(perms: string[]): Promise<boolean> {
  const { role } = await getProfile();
  if (role?.isAdmin) return true;
  if (!perms?.length) return false;
  const set = toPermissionSet(role);
  for (const p of perms) if (p && set.has(p)) return true;
  return false;
}

/** Checks if the user has ALL of the listed permissions (or is admin). */
export async function validateAllPermissions(perms: string[]): Promise<boolean> {
  const { role } = await getProfile();
  if (role?.isAdmin) return true;
  if (!perms?.length) return false;
  const set = toPermissionSet(role);
  for (const p of perms) if (!p || !set.has(p)) return false;
  return true;
}

/** Returns all permission IDs for the current user */
export async function getAllPermissionsIds(): Promise<string[]> {
  const { role } = await getProfile();
  return role?.permissions?.map((p) => p.id) ?? [];
}

/** Return all roles by module */
export async function getRolesByModule(module: string): Promise<Permission[]> {
  const { role } = await getProfile();
  return role?.permissions?.filter((p) => p.module === module) ?? [];
}
