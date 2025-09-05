import { useCallback, useSyncExternalStore } from 'react';

export function useIsMobile(breakpoint = 672) {
  const getSnapshot = () => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia(`(max-width: ${breakpoint}px)`).matches;
  };

  const subscribe = useCallback(
    (cb: () => void) => {
      if (typeof window === 'undefined') return () => {};
      const mql = window.matchMedia(`(max-width: ${breakpoint}px)`);
      const handler = () => cb();
      // Modern browsers
      mql.addEventListener?.('change', handler);
      // Fallback (older Safari)
      mql.addListener?.(handler);
      return () => {
        mql.removeEventListener?.('change', handler);
        mql.removeListener?.(handler);
      };
    },
    [breakpoint],
  );

  const getServerSnapshot = () => false;
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
