import Image from 'next/image';
import Link from 'next/link';

export enum LOGO_SIZE {
  SMALL = 'small',
  MEDIUM = 'medium',
  LARGE = 'large',
}

interface AppLogoProps {
  href?: string;
  standalone?: boolean;
  size?: LOGO_SIZE;
  priority?: boolean;
}

const HEIGHTS: Record<LOGO_SIZE, number> = {
  [LOGO_SIZE.SMALL]: 25,
  [LOGO_SIZE.MEDIUM]: 35,
  [LOGO_SIZE.LARGE]: 45,
};

export function AppLogo({
  href,
  standalone = false,
  size = LOGO_SIZE.MEDIUM,
  priority = false,
}: AppLogoProps) {
  const height = HEIGHTS[size];

  const logo = (
    <Image
      src="/assets/logo-vertical-01.svg"
      alt="iDoEasy"
      width={0} // required by TS, but we'll override with CSS
      height={height} // fixed height
      priority={priority}
      style={{ height, width: 'auto' }} // width auto keeps aspect ratio
    />
  );

  if (standalone) return logo;

  return (
    <Link href={href ?? '/'} aria-label="Go to home">
      <div style={{ marginLeft: '1rem', lineHeight: 0 }}>{logo}</div>
    </Link>
  );
}
