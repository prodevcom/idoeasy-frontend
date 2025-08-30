'use client';

import { useRouter } from 'next/navigation';

import { SideNavDivider, SideNavItems, SideNavLink, Tag } from '@carbon/react';
import { useTranslations } from 'next-intl';

import type { AuthUser } from '@entech/contracts';

import { useActivePath, useNav } from '@/shared/hooks';

type AppSideNavProps = {
  user: AuthUser;
  onClickSideNavExpand: () => void;
};

export function AppSideNav({ user, onClickSideNavExpand }: AppSideNavProps) {
  const router = useRouter();
  const { isActive } = useActivePath();
  const { items } = useNav({ user, includeDisabled: user.role.isAdmin });
  const t = useTranslations('navigation');

  return (
    <SideNavItems>
      {items.map((it, i) =>
        it.divider ? (
          <div key={`label-${i}`}>
            <SideNavDivider />
            {it.translateKey && <div className="nav-bar-label">{t(it.translateKey)}</div>}
          </div>
        ) : (
          <SideNavLink
            key={it.label}
            href={it.disabled ? '#' : (it.href ?? '#')}
            aria-current={isActive(it.href) ? 'page' : undefined}
            className={it.disabled ? 'disabled-sidenav-link' : undefined}
            renderIcon={it.icon}
            onClick={(e) => {
              if (!it.href || it.disabled) {
                e.preventDefault();
                return;
              }
              e.preventDefault();
              onClickSideNavExpand();
              router.push(it.href);
            }}
          >
            {t(it.translateKey)}
            {it.badge && (
              <Tag className="ml-4" size={it.badge.size ?? 'sm'} type={it.badge.type ?? 'blue'}>
                {it.badge.value}
              </Tag>
            )}
          </SideNavLink>
        ),
      )}
    </SideNavItems>
  );
}
