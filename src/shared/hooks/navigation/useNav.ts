import { useMemo } from 'react';

import type { AuthUser, Permission } from '@idoeasy/contracts';

import { NAV_ITEMS, type NavOptions } from './constants';

/** Types */
type UseNavProps = {
  user: AuthUser;
  items?: NavOptions[];
  includeDisabled?: boolean;
};

export function useNav({ user, items = NAV_ITEMS, includeDisabled = false }: UseNavProps) {
  const isAdmin = !!user?.role?.isAdmin;

  const granted = useMemo(
    () => new Set<string>((user?.role?.permissions ?? []).map((p: Permission) => p.name)),
    [user?.role?.permissions],
  );

  const check = useMemo(
    () => (permission: string) => {
      if (permission === '#') return true;
      if (isAdmin) return true;
      return granted.has(permission);
    },
    [isAdmin, granted],
  );

  const filtered = useMemo<NavOptions[]>(() => {
    const out: NavOptions[] = [];
    let lastWasDivider = true;

    for (const it of items) {
      const isDivider = !!it.divider || it.permission === '#';

      // Always allow a divider through only if previous wasn't divider
      if (isDivider) {
        if (!lastWasDivider) {
          out.push({ ...it, divider: true, permission: '#' });
          lastWasDivider = true;
        }
        continue;
      }

      // Admin sees everything enabled
      if (isAdmin) {
        out.push({ ...it, disabled: it.disabled });
        lastWasDivider = false;
        continue;
      }

      // Non-admin flow
      const allowed = check(it.permission);
      if (allowed || it.alwaysShow) {
        out.push({ ...it, disabled: it.disabled });
        lastWasDivider = false;
      } else if (includeDisabled) {
        out.push({ ...it, disabled: true });
        lastWasDivider = false;
      }
    }

    // drop trailing divider
    if (out.length && out[out.length - 1].divider) out.pop();
    return out;
  }, [items, check, includeDisabled, isAdmin]);

  return { items: filtered, can: check, granted };
}
