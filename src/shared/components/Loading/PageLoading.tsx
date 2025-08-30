'use client';

import { Loading } from '@carbon/react';

export function PageLoading({
  description = 'Loading...',
  withOverlay = false,
  scale = 0.6,
}: {
  description?: string;
  withOverlay?: boolean;
  scale?: number;
}) {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
        paddingTop: '30vh',
      }}
    >
      <div style={{ transform: `scale(${scale})` }}>
        <Loading withOverlay={withOverlay} description={description} />
      </div>
    </div>
  );
}
