import { Work_Sans } from 'next/font/google';

export const workSans = Work_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-work-sans',
  // If you need specific weights, list them; variable font will handle ranges.
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
  style: ['normal', 'italic'], // variable axis covers ital as well
});
