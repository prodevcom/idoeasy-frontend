// app/providers/BreadcrumbProvider.tsx
'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useSyncExternalStore,
} from 'react';

type Key = string;
function makeKey(segment: string, prev?: string) {
  return prev ? `${prev}::${segment}` : segment;
}

type Store = Map<Key, string>;

function createReactiveStore(initial?: Store) {
  const store = initial ?? new Map<Key, string>();
  const listeners = new Set<() => void>();
  let tick = 0; // ← contador de versão

  return {
    get: () => store,
    getVersion: () => tick, // ← versão atual
    set: (k: Key, v: string) => {
      store.set(k, v);
      tick++; // ← incrementa versão
      listeners.forEach((l) => l());
    },
    del: (k: Key) => {
      store.delete(k);
      tick++; // ← incrementa versão
      listeners.forEach((l) => l());
    },
    subscribe: (cb: () => void) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
  };
}

type BreadcrumbContextValue = {
  getBreadcrumbLabel: (segment: string, prev?: string) => string | undefined;
  setBreadcrumbLabel: (opts: { segment: string; prev?: string; label: string }) => void;
  deleteBreadcrumbLabel: (opts: { segment: string; prev?: string }) => void;
  version: number; // ← exposto para forçar re-render dos consumers
};

const BreadcrumbContext = createContext<BreadcrumbContextValue | null>(null);

export function BreadcrumbProvider({ children }: { children: React.ReactNode }) {
  const storeRef = useRef(createReactiveStore());

  // snapshot do Mapa (não muda de identidade), e a versão (muda a cada update)
  const snapshot = useSyncExternalStore(
    storeRef.current.subscribe,
    () => storeRef.current.get(),
    () => storeRef.current.get(),
  );
  const version = useSyncExternalStore(
    storeRef.current.subscribe,
    () => storeRef.current.getVersion(),
    () => storeRef.current.getVersion(),
  );

  const getBreadcrumbLabel = useCallback(
    (segment: string, prev?: string) => {
      const s = String(segment);
      const kScoped = makeKey(s, prev);
      return snapshot.get(kScoped) ?? snapshot.get(s);
    },
    [snapshot],
  );

  const setBreadcrumbLabel = useCallback(
    (opts: { segment: string; prev?: string; label: string }) => {
      const k = makeKey(String(opts.segment), opts.prev);
      storeRef.current.set(k, opts.label);
    },
    [],
  );

  const deleteBreadcrumbLabel = useCallback((opts: { segment: string; prev?: string }) => {
    const k = makeKey(String(opts.segment), opts.prev);
    storeRef.current.del(k);
  }, []);

  const value = useMemo<BreadcrumbContextValue>(
    () => ({ getBreadcrumbLabel, setBreadcrumbLabel, deleteBreadcrumbLabel, version }),
    [getBreadcrumbLabel, setBreadcrumbLabel, deleteBreadcrumbLabel, version], // ← inclui version
  );

  return <BreadcrumbContext.Provider value={value}>{children}</BreadcrumbContext.Provider>;
}

export function useBreadcrumbs() {
  const ctx = useContext(BreadcrumbContext);
  if (!ctx) throw new Error('useBreadcrumbs must be used within <BreadcrumbProvider>');
  return ctx;
}

export function useRegisterBreadcrumbLabel(opts: {
  segment: string;
  prev?: string;
  label: string;
}) {
  const { setBreadcrumbLabel, deleteBreadcrumbLabel } = useBreadcrumbs();
  React.useEffect(() => {
    setBreadcrumbLabel(opts);
    return () => deleteBreadcrumbLabel(opts);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opts.segment, opts.prev, opts.label]);
}
