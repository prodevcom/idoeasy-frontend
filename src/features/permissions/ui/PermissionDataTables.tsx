'use client';

import {
  DataTable,
  Pagination,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableHeader,
  TableRow,
  TableToolbar,
  TableToolbarContent,
  TableToolbarSearch,
} from '@carbon/react';
import { useTranslations } from 'next-intl';
import { useMemo } from 'react';

import { DataTableLoading } from '@/shared/components';
import { getDirection, mapToDataTables } from '@/shared/helpers';

import { usePermissionSearch } from '../hooks/usePermissionSearch';

export function PermissionDataTables() {
  const t = useTranslations('permissions');

  const {
    page,
    pageSize,
    search,
    setSearch,
    setPage,
    setPageSize,
    permissionsQuery,
    searchInputRef,
    sortBy,
    sortOrder,
    handleSort,
  } = usePermissionSearch();

  const { data, isLoading, error } = permissionsQuery;

  // Memoize headers with translations
  const headers = useMemo(
    () => [
      { key: 'name', header: t('headers.name') },
      { key: 'description', header: t('headers.description') },
      { key: 'module', header: t('headers.module') },
      { key: 'action', header: t('headers.action') },
    ],
    [t],
  );

  if (isLoading && !data) return <DataTableLoading columns={headers} />;
  if (error) return <div>{t('errors.loadFailed')}</div>;

  const allowedSortKeys = ['name', 'description', 'module', 'action'];

  return (
    <>
      <DataTable rows={mapToDataTables(data?.data ?? [])} headers={headers} useZebraStyles>
        {({ rows, headers, getTableProps, getHeaderProps, getRowProps }) => (
          <TableContainer
            title={t('title')}
            description={t('description')}
            style={{ width: '100%' }}
          >
            <TableToolbar>
              <TableToolbarContent>
                <TableToolbarSearch
                  id={searchInputRef.current?.id}
                  placeholder={t('searchPlaceholder')}
                  value={search}
                  onChange={(e) => {
                    if (e && typeof e === 'object' && 'target' in e) {
                      setSearch(e.target.value);
                    }
                  }}
                  persistent
                />
              </TableToolbarContent>
            </TableToolbar>
            <div className="table-responsive">
              <Table {...getTableProps()} size="lg">
                <colgroup></colgroup>
                <TableHead>
                  <TableRow>
                    {headers.map((header) => {
                      const sortable = allowedSortKeys.includes(header.key);
                      const headerProps = getHeaderProps({
                        header,
                        isSortable: sortable,
                      });

                      const {
                        key: _reactKey,
                        onClick: carbonOnClick,
                        ...restHeaderProps
                      } = headerProps ?? {};

                      const isSorted = sortable && sortBy === header.key;
                      const direction = getDirection(isSorted, sortOrder);

                      return (
                        <TableHeader
                          key={header.key}
                          {...restHeaderProps}
                          isSortable={sortable}
                          isSortHeader={isSorted}
                          sortDirection={direction}
                          onClick={
                            sortable
                              ? (e) => {
                                  carbonOnClick?.(e);
                                  handleSort(header.key);
                                }
                              : undefined
                          }
                        >
                          {header.header}
                        </TableHeader>
                      );
                    })}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows.map((row) => {
                    const { key: _key, ...rowProps } = getRowProps({ row }) || {};

                    return (
                      <TableRow key={row.id} {...rowProps}>
                        {row.cells.map((cell) => (
                          <TableCell key={cell.id}>{cell.value}</TableCell>
                        ))}
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </TableContainer>
        )}
      </DataTable>

      <Pagination
        page={page}
        pageSize={pageSize}
        pageSizes={[10, 25, 50]}
        totalItems={data?.pagination?.total || 0}
        itemsPerPageText={t('perPage')}
        itemRangeText={(min, max, total) => t('showingRange', { min, max, total })}
        pageRangeText={(min, max) => t('pageRange', { min, max })}
        onChange={({ page, pageSize }) => {
          setPage(page);
          setPageSize(pageSize);
        }}
      />
    </>
  );
}
