'use client';

import Image from 'next/image';

export function DesktopLoginImage() {
  return (
    <Image
      src={'/assets/login-vertical-side.png'}
      alt="Login Background"
      fill
      style={{ objectFit: 'cover', objectPosition: 'right' }}
      priority
    />
  );
}
