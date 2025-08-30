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
import { useMemo, useState } from 'react';

import { DataTableLoading } from '@/shared/components';
import type { Authorizer } from '@/shared/domain';
import { capitalizeWords, getDirection, onSetTextFieldValueChanged } from '@/shared/helpers';
import { useMapToDataTables } from '@/shared/hooks';

import { useUserFiltersOptions, useUserSearch } from '../hooks';
import { AddNewUser, Filters, UserUpdateAction } from './DataTables';
import { FilterDrawer } from './FilterDrawer';

type UserDataTableProps = {
  authorizer: Authorizer;
};

export function UserDataTable({ authorizer }: UserDataTableProps) {
  const t = useTranslations('users');
  const {
    page,
    pageSize,
    search,
    sortBy,
    sortOrder,
    status,
    roleId,
    setSearch,
    setStatus,
    setRoleId,
    setPage,
    setPageSize,
    handleSort,
    hasFilters,
    resetFilters,
    usersQuery,
    searchInputId,
  } = useUserSearch();

  const { tableHeaders, keyHeaderActions, sortableKeys } = useUserFiltersOptions();
  const mapToDataTables = useMapToDataTables();

  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);

  const handleFilterOpen = () => setIsFilterDrawerOpen(true);
  const handleFilterClose = () => setIsFilterDrawerOpen(false);

  const { data, isLoading, error } = usersQuery;
  const users = useMemo(() => data?.data ?? [], [data]);

  if (isLoading && !data) return <DataTableLoading columns={tableHeaders} />;
  if (error) return <div>{t('errors.loadFailed')}</div>;

  const renderCell = (cell: { info: { header: string }; value: string }) => {
    switch (cell.info.header) {
      case 'status':
        return cell.value ? capitalizeWords(cell.value) : '-';
      default:
        return cell.value;
    }
  };

  const disableActionByAdminRules = (userId: string) => {
    if (authorizer.isAdmin()) return false;
    const user = users.find((u) => u.id === userId);
    if (user?.role?.isAdmin) return true;
    return false;
  };

  return (
    <>
      <DataTable
        rows={mapToDataTables(users, {
          role: (_, row) => row.role?.name ?? '',
        })}
        headers={tableHeaders}
        useZebraStyles
      >
        {({ rows, headers, getTableProps, getHeaderProps, getRowProps }) => (
          <TableContainer
            title={t('view.title')}
            description={t('view.description')}
            style={{ width: '100%' }}
          >
            <TableToolbar>
              <TableToolbarContent>
                <TableToolbarSearch
                  persistent
                  placeholder={t('view.searchPlaceholder')}
                  value={search}
                  onChange={(e) => setSearch(onSetTextFieldValueChanged(e))}
                  id={searchInputId}
                />
                <Filters
                  hasFilters={Boolean(hasFilters)}
                  onReset={resetFilters}
                  onOpen={handleFilterOpen}
                />

                {authorizer.canCreate() && <AddNewUser />}
              </TableToolbarContent>
            </TableToolbar>
            <div className="table-responsive">
              <Table {...getTableProps()} size="lg">
                <colgroup></colgroup>
                <TableHead>
                  <TableRow>
                    {headers.map((header) => {
                      const sortable = sortableKeys.includes(header.key);
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
                          colSpan={header.key === keyHeaderActions ? 2 : 1}
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
                          return (
                            <TableCell key={cell.id} className="no-wrap">
                              {renderCell(cell)}
                            </TableCell>
                          );
                        })}
                        <UserUpdateAction
                          userId={row.id}
                          authorizer={authorizer}
                          forceDisabled={disableActionByAdminRules(row.id)}
                        />
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </TableContainer>
        )}
      </DataTable>

      {/* Pagination */}

      <Pagination
        page={page}
        pageSize={pageSize}
        pageSizes={[10, 20, 50, 100]}
        totalItems={data?.pagination?.total || 0}
        itemsPerPageText={t('pagination.perPage')}
        itemRangeText={(min, max, total) => t('pagination.showingRange', { min, max, total })}
        pageRangeText={(min, max) => t('pagination.pageRange', { min, max })}
        onChange={({ page, pageSize }) => {
          setPage(page);
          setPageSize(pageSize);
        }}
      />

      {/* Filter Drawer */}

      <FilterDrawer
        isOpen={isFilterDrawerOpen}
        onClose={handleFilterClose}
        status={status}
        roleId={roleId}
        onStatusChange={(value) => {
          setStatus(value);
          setPage(1);
        }}
        onRoleChange={(value) => {
          setRoleId(value);
          setPage(1);
        }}
        onReset={resetFilters}
        hasFilters={Boolean(hasFilters)}
      />
    </>
  );
}
