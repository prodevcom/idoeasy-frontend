import type { ReactNode } from 'react';

import { workSans } from '../src/fonts';

import '../src/scss/styles.scss';

export const metadata = {
  title: 'iDoEasy Platform',
  description: 'iDoEasy Platform - Admin',
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/favicon.ico',
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html suppressHydrationWarning>
      <body suppressHydrationWarning className={workSans.variable}>
        {children}
      </body>
    </html>
  );
}
