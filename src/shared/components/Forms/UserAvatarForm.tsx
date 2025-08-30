'use client';

import { User } from '@carbon/icons-react';

export const UserAvatarForm = () => {
  return (
    <div
      style={{
        width: '128px',
        height: '128px',
        borderRadius: '50%',
        backgroundColor: 'var(--cds-interactive)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <User size={64} color="white" />
    </div>
  );
};
