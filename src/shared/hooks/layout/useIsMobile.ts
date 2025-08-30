import { useSyncExternalStore } from 'react';

export function useIsMobile(breakpoint = 672) {
  const subscribe = (cb: () => void) => {
    const onChange = () => cb();
    window.addEventListener('resize', onChange);
    window.addEventListener('orientationchange', onChange);
    return () => {
      window.removeEventListener('resize', onChange);
      window.removeEventListener('orientationchange', onChange);
    };
  };

  const getSnapshot = () => typeof window !== 'undefined' && window.innerWidth < breakpoint;

  const getServerSnapshot = () => false; // SSR default

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
