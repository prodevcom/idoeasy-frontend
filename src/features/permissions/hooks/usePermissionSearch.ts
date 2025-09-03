import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { startTransition, useEffect, useMemo, useRef, useState } from 'react';

import { searchPermissions } from '@/features/permissions';
import type { ApiSuccess } from '@/shared/api';
import { parseIntSafe } from '@/shared/helpers';
import { useDebounce } from '@/shared/hooks';

import { defaults, permissionsQS } from './queryParams';

import type { Permission, PermissionQueryParams } from '@idoeasy/contracts';

export function usePermissionSearch() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // --- Initialize directly from URL
  const initialPage = parseIntSafe(searchParams.get('page') ?? '', defaults.page);
  const initialPageSize = parseIntSafe(searchParams.get('limit') ?? '', defaults.pageSize);
  const initialSearch = searchParams.get('search') ?? defaults.search;
  const initialModule = searchParams.get('module') ?? defaults.module;
  const initialAction = searchParams.get('action') ?? defaults.action;
  const initialIsActive = searchParams.get('isActive') ?? defaults.isActive;
  const initialSortBy = searchParams.get('sortBy') ?? defaults.sortBy;
  const initialSortOrder = searchParams.get('sortOrder') ?? defaults.sortOrder;

  const [page, setPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [search, setSearch] = useState(initialSearch);
  const [module, setModule] = useState(initialModule);
  const [action, setAction] = useState(initialAction);
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
      permissionsQS.build(pathname, {
        page,
        pageSize,
        search,
        module,
        action,
        isActive,
        sortBy,
        sortOrder,
      }),
    [pathname, page, pageSize, search, module, action, isActive, sortBy, sortOrder],
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
    () =>
      [
        'permissions',
        page,
        pageSize,
        debounced,
        module,
        action,
        isActive,
        sortBy,
        sortOrder,
      ] as const,
    [page, pageSize, debounced, module, action, isActive, sortBy, sortOrder],
  );

  const permissionsQuery = useQuery({
    queryKey,
    queryFn: (): Promise<ApiSuccess<Permission[]>> =>
      searchPermissions({
        page,
        limit: pageSize,
        search: debounced,
        module: module || undefined,
        action: action || undefined,
        isActive: isActive === 'true' ? true : isActive === 'false' ? false : undefined,
        sortBy,
        sortOrder,
      } as PermissionQueryParams),
    placeholderData: keepPreviousData,
    refetchOnWindowFocus: false,
    staleTime: 30_000,
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
    module,
    action,
    isActive,
    sortBy,
    sortOrder,
    debouncedSearch: debounced,
    setPage: onSetPage,
    setPageSize: onSetPageSize,
    setSearch: onSetSearch,
    setModule,
    setAction,
    setIsActive,
    permissionsQuery,
    handleSort,
    searchInputRef,
  };
}
