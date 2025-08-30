import { Stack } from '@carbon/react';
import { useTranslations } from 'next-intl';
import { Suspense } from 'react';

import { LoginForm } from '@/features/auth/ui/LoginForm';
import { DesktopLoginImage } from '@/shared/components/Images/DesktopLoginImage';
import { AppLogo, LOGO_SIZE } from '@/shared/components/Logos/AppLogo';

export function DesktopLoginLayout() {
  const t = useTranslations('login');

  return (
    <div
      style={{
        display: 'flex',
        minHeight: '100vh',
        width: '100%',
      }}
    >
      {/* Left side - Image (70%) */}
      <div
        style={{
          flex: '0 0 70%',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <DesktopLoginImage />
      </div>

      {/* Right side - Login Form (30%) */}
      <div
        style={{
          flex: '0 0 30%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '2rem',
          backgroundColor: 'var(--cds-background)',
          position: 'relative',
        }}
      >
        {/* Logo at the top */}
        <div
          style={{
            position: 'absolute',
            top: '2rem',
            left: '50%',
            transform: 'translateX(-50%)',
          }}
        >
          <AppLogo standalone size={LOGO_SIZE.LARGE} />
        </div>

        {/* Login Form Content */}
        <div
          style={{
            width: '100%',
            maxWidth: '400px',
            marginTop: '4rem',
          }}
        >
          <Stack gap={6}>
            <div style={{ textAlign: 'center' }}>
              <h2 style={{ marginBottom: '0.5rem' }}>{t('subtitle')}</h2>
              <p style={{ color: 'var(--cds-text-secondary)' }}>{t('description')}</p>
            </div>
            <Suspense fallback={<div>{t('loading')}</div>}>
              <LoginForm />
            </Suspense>
          </Stack>
        </div>
      </div>
    </div>
  );
}
