'use client';

import { Stack } from '@carbon/react';
import { useEffect } from 'react';

import type { AuthUser } from '@idoeasy/contracts';

import { ProfileBoard, ProfileDetails } from '@/features/me/ui/components';
import { useNotificationHelpers } from '@/shared/contexts';

type ProfilePageProps = {
  currentUser?: AuthUser;
};

export default function ProfilePage({ currentUser }: ProfilePageProps) {
  const { showSuccess } = useNotificationHelpers();

  useEffect(() => {
    const data = sessionStorage.getItem('successMessage');
    if (data) {
      const { title, msg } = JSON.parse(data);
      showSuccess(title, msg);
      sessionStorage.removeItem('successMessage');
    }
  }, [showSuccess]);

  if (!currentUser) {
    return <div>Unable to load profile</div>;
  }

  return (
    <Stack className="cds--profile-layout">
      <ProfileBoard currentUser={currentUser} />
      <ProfileDetails currentUser={currentUser} />
    </Stack>
  );
}
