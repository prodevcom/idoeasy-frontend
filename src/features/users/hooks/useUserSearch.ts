'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import type { UserStatus } from '@idoeasy/contracts';

import { searchUsers } from '@/features/users';
import { useDebounce } from '@/shared/hooks/layout/useDebounce';

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;
const DEFAULT_SORT_BY = 'createdAt';
const DEFAULT_SORT_ORDER: 'asc' | 'desc' = 'desc';
const SEARCH_INPUT_ID = 'users-toolbar-search';

/* ----------------------------- helpers ----------------------------- */
function parseNumber(v: string | null | undefined, fallback: number) {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}
function parseStatus(v: string | null | undefined): UserStatus | undefined {
  return v === 'ACTIVE' || v === 'INACTIVE' ? (v as UserStatus) : undefined;
}

/**
 * Initializes from the current URL (once), then keeps state <-> URL in sync
 * without triggering a double fetch on mount.
 */
export function useUserSearch() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  /* -------------------- seed state from URL on first render -------------------- */
  // NOTE: these lazy initializers run only once (first render), so we start
  // with the *URL values* (including status), avoiding the “no-status then status” flip.
  const [page, setPage] = useState<number>(() =>
    parseNumber(searchParams.get('page'), DEFAULT_PAGE),
  );
  const [pageSize, setPageSize] = useState<number>(() =>
    parseNumber(searchParams.get('limit'), DEFAULT_LIMIT),
  );
  const [search, setSearch] = useState<string>(() => searchParams.get('search') ?? '');
  const [sortBy, setSortBy] = useState<string>(() => searchParams.get('sortBy') ?? DEFAULT_SORT_BY);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>(
    () => (searchParams.get('sortOrder') === 'asc' ? 'asc' : 'desc') as 'asc' | 'desc',
  );
  const [status, setStatus] = useState<UserStatus | undefined>(() =>
    parseStatus(searchParams.get('status')),
  );
  const [roleId, setRoleId] = useState<string | undefined>(
    () => searchParams.get('roleId') ?? undefined,
  );

  const debouncedSearch = useDebounce(search, 400);
  const mountedRef = useRef(false);

  /* ----------------------- reflect URL -> state after mount ----------------------- */
  // If the user navigates back/forward and the URL changes, update state.
  // Skip the first run (we already seeded from URL above).
  useEffect(() => {
    if (!mountedRef.current) {
      mountedRef.current = true;
      return;
    }
    const get = (k: string) => searchParams.get(k) ?? undefined;

    const nextPage = parseNumber(get('page'), DEFAULT_PAGE);
    const nextLimit = parseNumber(get('limit'), DEFAULT_LIMIT);
    const nextSearch = get('search') ?? '';
    const nextSortBy = get('sortBy') ?? DEFAULT_SORT_BY;
    const nextSortOrder = (get('sortOrder') === 'asc' ? 'asc' : 'desc') as 'asc' | 'desc';
    const nextStatus = parseStatus(get('status'));
    const nextRoleId = get('roleId');

    // Only update each piece of state if it actually changed
    setPage((v) => (v !== nextPage ? nextPage : v));
    setPageSize((v) => (v !== nextLimit ? nextLimit : v));
    setSearch((v) => (v !== nextSearch ? nextSearch : v));
    setSortBy((v) => (v !== nextSortBy ? nextSortBy : v));
    setSortOrder((v) => (v !== nextSortOrder ? nextSortOrder : v));
    setStatus((v) => (v !== nextStatus ? nextStatus : v));
    setRoleId((v) => (v !== nextRoleId ? nextRoleId : v));
  }, [searchParams]);

  /* ----------------------------- state -> URL sync ----------------------------- */
  const nextUrl = useMemo(() => {
    const params = new URLSearchParams();
    if (page !== DEFAULT_PAGE) params.set('page', String(page));
    if (pageSize !== DEFAULT_LIMIT) params.set('limit', String(pageSize));
    if (search) params.set('search', search);
    if (sortBy !== DEFAULT_SORT_BY) params.set('sortBy', sortBy);
    if (sortOrder !== DEFAULT_SORT_ORDER) params.set('sortOrder', sortOrder);
    if (status) params.set('status', status);
    if (roleId) params.set('roleId', roleId);
    const qs = params.toString();
    return qs ? `${pathname}?${qs}` : pathname;
  }, [pathname, page, pageSize, search, sortBy, sortOrder, status, roleId]);

  useEffect(() => {
    // Only replace if the URL would actually change
    const currentQS = searchParams?.toString() ?? '';
    const nextQS = nextUrl.split('?')[1] ?? '';
    if (currentQS !== nextQS) {
      router.replace(nextUrl, { scroll: false });
    }
  }, [nextUrl, router, searchParams]);

  /* ---------------------------------- query ---------------------------------- */
  const variables = useMemo(
    () => ({
      page,
      limit: pageSize,
      search: debouncedSearch,
      sortBy,
      sortOrder,
      status,
      roleId,
    }),
    [page, pageSize, debouncedSearch, sortBy, sortOrder, status, roleId],
  );

  const queryKey = useMemo(() => ['users', variables] as const, [variables]);

  const usersQuery = useQuery({
    queryKey,
    queryFn: () => searchUsers(variables),
    placeholderData: keepPreviousData,
    staleTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: false,
  });

  /* ------------------------------ handlers / UX ------------------------------ */
  const handleSort = useCallback(
    (key: string) => {
      const newDirection = sortBy === key && sortOrder === 'asc' ? 'desc' : 'asc';
      setSortBy(key);
      setSortOrder(newDirection);
      setPage(DEFAULT_PAGE);
    },
    [sortBy, sortOrder],
  );

  const hasFilters = Boolean(status || roleId || search);

  const resetFilters = useCallback(() => {
    setSearch('');
    setStatus(undefined);
    setRoleId(undefined);
    setPage(DEFAULT_PAGE);
    setTimeout(() => {
      const el = document.getElementById(SEARCH_INPUT_ID);
      if (el instanceof HTMLInputElement) el.blur();
      else el?.querySelector('input')?.blur();
    }, 0);
  }, []);

  return {
    page,
    pageSize,
    search,
    sortBy,
    sortOrder,
    status,
    roleId,
    setPage,
    setPageSize,
    setSearch,
    setSortBy,
    setSortOrder,
    setStatus,
    setRoleId,
    usersQuery,
    searchInputId: SEARCH_INPUT_ID,
    handleSort,
    hasFilters,
    resetFilters,
  } as const;
}
