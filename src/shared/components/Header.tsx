'use client';

import { useRouter } from 'next/navigation';

import { Close, Notification, UserAvatar } from '@carbon/icons-react';
import {
  Header,
  HeaderGlobalAction,
  HeaderGlobalBar,
  HeaderMenuButton,
  HeaderPanel,
  SideNav,
  SkipToContent,
  Switcher,
  SwitcherDivider,
  SwitcherItem,
} from '@carbon/react';
import { signOut } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

import type { AuthUser } from '@entech/contracts';

import { AppLogo, AppSideNav, LOGO_SIZE } from '@/shared/components';

interface AppHeaderProps {
  user: AuthUser;
  isSideNavExpanded: boolean;
  onClickSideNavExpand: () => void;
}

export function AppHeader({ user, isSideNavExpanded, onClickSideNavExpand }: AppHeaderProps) {
  const router = useRouter();
  const [userOpen, setUserOpen] = useState(false);
  const t = useTranslations('appHeader');

  return (
    <Header className="app-header" aria-label="Enhance">
      <SkipToContent />

      {/* SideNavToggle */}
      <HeaderMenuButton
        aria-label={isSideNavExpanded ? 'Close menu' : 'Open menu'}
        onClick={onClickSideNavExpand}
        isActive={isSideNavExpanded}
      />

      {/* Logo */}
      <AppLogo href="/" size={LOGO_SIZE.SMALL} />

      {/* HeaderGlobalBar */}
      <HeaderGlobalBar>
        <HeaderGlobalAction aria-label="Notifications">
          <Notification size={20} />
        </HeaderGlobalAction>

        {/* Use a global action to toggle a HeaderPanel */}
        <HeaderGlobalAction
          aria-label="User menu"
          onClick={() => setUserOpen((v) => !v)}
          tooltipAlignment="end"
        >
          {userOpen ? <Close size={20} /> : <UserAvatar size={20} />}
        </HeaderGlobalAction>

        {/* Right-aligned sliding panel – avoids layout jump */}
        <HeaderPanel expanded={userOpen} aria-label="User panel">
          <Switcher aria-label="User menu">
            <SwitcherItem
              aria-labelledby="profile"
              onClick={() => {
                setUserOpen(false);
                router.push('/me');
              }}
            >
              {t('userProfile', { name: user.name.split(' ')[0] })}
            </SwitcherItem>
            <SwitcherDivider />
            <SwitcherItem
              aria-labelledby="logout"
              onClick={() => {
                setUserOpen(false);
                signOut({ callbackUrl: '/login' });
              }}
            >
              {t('logout')}
            </SwitcherItem>
          </Switcher>
        </HeaderPanel>
      </HeaderGlobalBar>

      {/* SideNav */}
      <SideNav aria-label="Side navigation" expanded={isSideNavExpanded}>
        <AppSideNav user={user} onClickSideNavExpand={onClickSideNavExpand} />
      </SideNav>
    </Header>
  );
}
