import { Stack } from '@carbon/react';

import { LoginForm } from '@/features/auth/ui/LoginForm';
import { AppLogo } from '@/shared/components/Logos/AppLogo';

export function MobileLoginLayout() {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        width: '100%',
        backgroundColor: 'var(--cds-background)',
      }}
    >
      {/* Logo at the top */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          padding: '2rem 1rem 1rem 1rem',
        }}
      >
        <AppLogo standalone />
      </div>

      {/* Login Form Content - Mobile */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '1rem',
        }}
      >
        <div
          style={{
            width: '100%',
            maxWidth: '400px',
          }}
        >
          <Stack gap={6}>
            <div style={{ textAlign: 'center' }}>
              <h2 style={{ marginBottom: '0.5rem' }}>Welcome back!</h2>
              <p style={{ color: 'var(--cds-text-secondary)' }}>
                Enter your credentials to continue
              </p>
            </div>
            <LoginForm />
          </Stack>
        </div>
      </div>
    </div>
  );
}
