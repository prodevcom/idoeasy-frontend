'use client';

import { useRouter } from 'next/navigation';

import { Button, Stack } from '@carbon/react';

import type { AuthUser } from '@idoeasy/contracts';

import { AppLogo, LOGO_SIZE } from '@/shared/components';

type HomePageProps = {
  user?: AuthUser;
};

export default function HomePage({ user }: HomePageProps) {
  const router = useRouter();

  const handleDashboardClick = () => {
    router.push('/dash');
  };

  const handleLoginClick = () => {
    router.push('/login');
  };

  return (
    <div
      style={{
        display: 'flex',
        minHeight: '100vh',
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'var(--cds-background)',
      }}
    >
      <div
        style={{
          textAlign: 'center',
          maxWidth: '600px',
          padding: '2rem',
        }}
      >
        <Stack gap={6}>
          <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>
            🚀 Bem-vindo ao <AppLogo size={LOGO_SIZE.MEDIUM} />
          </h1>
          <p style={{ fontSize: '1.2rem', color: 'var(--cds-text-secondary)' }}>
            Sua plataforma completa para gerenciamento de eventos
          </p>

          <div>
            <p style={{ marginBottom: '2rem' }}>
              {user
                ? `Olá, ${user.name || user.email}! Você está logado.`
                : 'Faça login para acessar o dashboard e começar a usar a plataforma.'}
            </p>
          </div>

          <Stack gap={4} style={{ alignItems: 'center' }}>
            {user ? (
              <Button size="lg" onClick={handleDashboardClick}>
                Acessar Dashboard
              </Button>
            ) : (
              <Button size="lg" onClick={handleLoginClick}>
                Fazer Login
              </Button>
            )}
          </Stack>

          <div style={{ marginTop: '2rem' }}>
            <p style={{ fontSize: '0.9rem', color: 'var(--cds-text-secondary)' }}>
              © 2025 iDoEasy. Todos os direitos reservados.
            </p>
          </div>
        </Stack>
      </div>
    </div>
  );
}
