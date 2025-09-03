'use client';

import { Content, HeaderContainer } from '@carbon/react';

import type { AuthUser } from '@idoeasy/contracts';

import { AppHeader, GlobalModal, NotificationsContainer } from '@/shared/components';
import Breadcrumb from '@/shared/components/Breadcrumb/Breadcrumb';
import { useLocaleRedirect } from '@/shared/hooks/layout';

import type { ReactNode } from 'react';

type Props = {
  user: AuthUser;
  children: ReactNode;
};

export default function AppShell({ user, children }: Props) {
  // Ensure user is on the correct locale route
  useLocaleRedirect();

  return (
    <>
      <HeaderContainer
        render={({ isSideNavExpanded, onClickSideNavExpand }) => (
          <AppHeader
            user={user}
            isSideNavExpanded={isSideNavExpanded}
            onClickSideNavExpand={onClickSideNavExpand}
          />
        )}
      />
      <Content className="app-content">
        <Breadcrumb />
        {children}
      </Content>
      <NotificationsContainer />
      <GlobalModal />
    </>
  );
}
