import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { startTransition, useEffect, useMemo, useRef, useState } from 'react';

import type { RoleQueryParams } from '@idoeasy/contracts';

import { parseIntSafe } from '@/shared/helpers';
import { useDebounce } from '@/shared/hooks';

import { searchRoles } from '../api';
import { defaults, rolesQS } from './queryParams';

export function useRolesSearch() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // --- Initialize directly from URL
  const initialPage = parseIntSafe(searchParams.get('page') ?? '', defaults.page);
  const initialPageSize = parseIntSafe(searchParams.get('limit') ?? '', defaults.pageSize);
  const initialSearch = searchParams.get('search') ?? defaults.search;
  const initialIsActive = searchParams.get('isActive') ?? defaults.isActive;
  const initialSortBy = searchParams.get('sortBy') ?? defaults.sortBy;
  const initialSortOrder = searchParams.get('sortOrder') ?? defaults.sortOrder;

  const [page, setPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [search, setSearch] = useState(initialSearch);
  const [isActive, setIsActive] = useState<string>(initialIsActive);
  const [sortBy, setSortBy] = useState(initialSortBy);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>(
    (initialSortOrder as 'asc' | 'desc') ?? 'desc',
  );

  // Debounce search
  const debounced = useDebounce(search, 400);

  // Compute target URL for current state
  const targetUrl = useMemo(
    () =>
      rolesQS.build(pathname, {
        page,
        pageSize,
        search,
        isActive,
        sortBy,
        sortOrder,
      }),
    [pathname, page, pageSize, search, isActive, sortBy, sortOrder],
  );

  // Sync URL when state changes
  useEffect(() => {
    const currentQs = searchParams?.toString() ?? '';
    const targetQs = targetUrl.split('?')[1] ?? '';
    if (currentQs !== targetQs) {
      startTransition(() => {
        router.replace(targetUrl, { scroll: false });
      });
    }
  }, [targetUrl, router, searchParams]);

  // Setters
  const onSetPage = (n: number) => setPage(Math.max(1, n));

  const onSetPageSize = (n: number) => {
    setPageSize(Math.max(1, n));
  };
  const onSetSearch = (value: string) => setSearch(value);

  // Query
  const queryKey = useMemo(
    () => ['roles', page, pageSize, debounced, isActive, sortBy, sortOrder] as const,
    [page, pageSize, debounced, isActive, sortBy, sortOrder],
  );

  const rolesQuery = useQuery({
    queryKey,
    queryFn: () =>
      searchRoles({
        page,
        limit: pageSize,
        search: debounced,
        isActive: isActive === 'true' ? true : isActive === 'false' ? false : undefined,
        sortBy,
        sortOrder,
      } as RoleQueryParams),
    placeholderData: keepPreviousData,
    staleTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: false,
  });

  const searchInputRef = useRef<HTMLInputElement | null>(null);

  const handleSort = (key: string) => {
    const newDirection = sortBy === key && sortOrder === 'asc' ? 'desc' : 'asc';
    setSortBy(key);
    setSortOrder(newDirection);
  };

  return {
    page,
    pageSize,
    search,
    isActive,
    sortBy,
    sortOrder,
    debouncedSearch: debounced,
    setPage: onSetPage,
    setPageSize: onSetPageSize,
    setSearch: onSetSearch,
    setIsActive,
    rolesQuery,
    handleSort,
    searchInputRef,
  };
}
