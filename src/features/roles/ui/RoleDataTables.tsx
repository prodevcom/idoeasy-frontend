'use client';

import { useRouter } from 'next/navigation';

import { Add } from '@carbon/icons-react';
import {
  Button,
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
import type { Authorizer } from '@/shared/domain';
import { getDirection } from '@/shared/helpers';
import { useMapToDataTables } from '@/shared/hooks';

import { RoleUpdateActions } from '../components';
import { useRolesSearch } from '../hooks';

type RoleDataTableProps = {
  authorizer: Authorizer;
};

export function RoleDataTables({ authorizer }: RoleDataTableProps) {
  const router = useRouter();
  const t = useTranslations('roles');
  const mapToDataTables = useMapToDataTables();

  const {
    page,
    pageSize,
    search,
    setSearch,
    setPage,
    setPageSize,
    rolesQuery,
    searchInputRef,
    sortBy,
    sortOrder,
    handleSort,
  } = useRolesSearch();

  const { data, isLoading, error } = rolesQuery;

  // Memoize headers with translations
  const headers = useMemo(
    () => [
      { key: 'name', header: t('view.headers.name') },
      { key: 'description', header: t('view.headers.description') },
      { key: 'isActive', header: t('view.headers.isAdmin') },
    ],
    [t],
  );

  if (isLoading && !data) return <DataTableLoading columns={headers} showTitle showToolbar />;
  if (error || !data) return <div>{t('errors.loadFailed')}</div>;

  const keyHeaderActions = 'isActive';
  const allowedSortKeys = ['name', 'description', 'isActive'];

  const renderCell = (cell: { info: { header: string }; value: string }) => {
    switch (cell.info.header) {
      case 'isActive':
        return cell.value ? t('status.active') : t('status.inactive');
      default:
        return cell.value;
    }
  };

  return (
    <>
      <DataTable rows={mapToDataTables(data?.data ?? [])} headers={headers} useZebraStyles>
        {({ rows, getTableProps, getHeaderProps, getRowProps }) => (
          <TableContainer
            title={t('view.title')}
            description={t('view.description')}
            style={{ width: '100%' }}
          >
            <TableToolbar>
              <TableToolbarContent>
                <TableToolbarSearch
                  id={searchInputRef.current?.id}
                  placeholder={t('view.searchPlaceholder')}
                  value={search}
                  onChange={(e) => {
                    if (e && typeof e === 'object' && 'target' in e) {
                      setSearch(e.target.value);
                    }
                  }}
                  persistent
                />
                {authorizer.canCreate() && (
                  <Button
                    renderIcon={Add}
                    onClick={() => router.push('/roles/create')}
                    style={{ marginLeft: 'auto' }}
                  >
                    {t('actions.create')}
                  </Button>
                )}
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
                          colSpan={header.key === keyHeaderActions ? 2 : 1}
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
                        {row.cells.map((cell) => {
                          const noWrap = cell.info.header === 'name';
                          const noWrapEllipsis = cell.info.header === 'description';

                          return (
                            <TableCell
                              key={cell.id}
                              className={
                                noWrap ? 'no-wrap' : noWrapEllipsis ? 'no-wrap-ellipsis' : ''
                              }
                            >
                              {renderCell(cell)}
                            </TableCell>
                          );
                        })}
                        {(authorizer.canUpdate() || authorizer.canDelete()) && (
                          <RoleUpdateActions roleId={row.id} authorizer={authorizer} />
                        )}
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
        itemsPerPageText={t('pagination.perPage')}
        itemRangeText={(min, max, total) => t('pagination.showingRange', { min, max, total })}
        pageRangeText={(min, max) => t('pagination.pageRange', { min, max })}
        onChange={({ page, pageSize }) => {
          setPage(page);
          setPageSize(pageSize);
        }}
      />
    </>
  );
}
