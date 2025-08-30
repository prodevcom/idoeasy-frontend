import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { useEffect, useMemo, useRef, useState } from 'react';

import type { UserStatus } from '@entech/contracts';

import { searchUsers } from '@/features/users';
import { useDebounce } from '@/shared/hooks/layout/useDebounce';

/**
 * Encapsulates all state, URL synchronization, and data fetching for the user list.
 * Keeps the {@link UserList} component focused on rendering while this hook
 * manages pagination, filtering, and sorting logic.
 */
export function useUserSearch() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [status, setStatus] = useState<UserStatus | undefined>();
  const [roleId, setRoleId] = useState<string | undefined>();

  const debouncedSearch = useDebounce(search, 400);

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const didInitFromUrl = useRef(false);
  const searchInputId = 'users-toolbar-search';

  // Initialize state from URL on first mount
  useEffect(() => {
    if (didInitFromUrl.current) return;
    if (!searchParams) return;
    didInitFromUrl.current = true;
    const get = (k: string) => searchParams.get(k) || undefined;
    const pageQ = Number(get('page') || 1);
    const limitQ = Number(get('limit') || 10);
    setPage(Number.isFinite(pageQ) && pageQ > 0 ? pageQ : 1);
    setPageSize(Number.isFinite(limitQ) && limitQ > 0 ? limitQ : 10);
    setSearch(get('search') ?? '');
    setSortBy(get('sortBy') ?? 'createdAt');
    const so = get('sortOrder') ?? 'desc';
    setSortOrder(so === 'asc' ? 'asc' : 'desc');
    const statusQ = get('status') ?? 'all';
    setStatus(statusQ === 'ACTIVE' || statusQ === 'INACTIVE' ? (statusQ as UserStatus) : undefined);
    setRoleId(get('roleId') ?? undefined);
  }, [searchParams]);

  // Build URL with current state
  const urlWithParams = useMemo(() => {
    const params = new URLSearchParams();
    if (page !== 1) params.set('page', String(page));
    if (pageSize !== 10) params.set('limit', String(pageSize));
    if (search) params.set('search', search);
    if (sortBy !== 'createdAt') params.set('sortBy', sortBy);
    if (sortOrder !== 'desc') params.set('sortOrder', sortOrder);
    if (status) params.set('status', status);
    if (roleId) params.set('roleId', roleId);
    const qs = params.toString();
    return qs ? `${pathname}?${qs}` : pathname;
  }, [pathname, page, pageSize, search, sortBy, sortOrder, status, roleId]);

  // Reflect state changes into URL
  useEffect(() => {
    if (!didInitFromUrl.current) return; // avoid replacing before init
    router.replace(urlWithParams, { scroll: false });
  }, [urlWithParams, router]);

  // Query
  const queryKey = useMemo(
    () => ['users', page, pageSize, debouncedSearch, sortBy, sortOrder, status, roleId],
    [page, pageSize, debouncedSearch, sortBy, sortOrder, status, roleId],
  );

  const usersQuery = useQuery({
    queryKey,
    queryFn: () =>
      searchUsers({
        page,
        limit: pageSize,
        search: debouncedSearch,
        sortBy,
        sortOrder,
        status,
        roleId,
      }),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });

  const handleSort = (key: string) => {
    const newDirection = sortBy === key && sortOrder === 'asc' ? 'desc' : 'asc';
    setSortBy(key);
    setSortOrder(newDirection);
  };

  const hasFilters = status !== undefined || roleId !== undefined || search;

  const resetFilters = () => {
    setSearch('');
    setStatus(undefined);
    setRoleId(undefined);
    setPage(1);
    setTimeout(() => {
      const el = document.getElementById(searchInputId);
      if (el instanceof HTMLInputElement) el.blur();
      else el?.querySelector('input')?.blur();
    }, 0);
  };

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
    searchInputId,
    handleSort,
    hasFilters,
    resetFilters,
  } as const;
}
