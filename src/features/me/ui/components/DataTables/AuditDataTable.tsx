import {
  DataTable,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableHeader,
  TableRow,
} from '@carbon/react';
import { useTranslations } from 'next-intl';

import { DataTableLoading } from '@/shared/components';
import { useMapToDataTables } from '@/shared/hooks';

import { useMyLogs } from '../../../hooks';

export function ProfileDetailsAuditDataTable() {
  const t = useTranslations('profile');
  const { headers, logsQuery } = useMyLogs();
  const { data, isLoading, error } = logsQuery;

  const mapToDataTables = useMapToDataTables();

  if (isLoading && !data) return <DataTableLoading columns={headers} showToolbar={false} />;
  if (error || !data) return <div>Failed to load audit logs</div>;

  return (
    <DataTable rows={mapToDataTables(data?.data ?? [])} headers={headers}>
      {({ rows, getTableProps, getHeaderProps, getRowProps }) => (
        <TableContainer
          title={t('auditLogs.title')}
          description={t('auditLogs.description')}
          style={{ width: '100%' }}
        >
          <Table {...getTableProps()}>
            <colgroup></colgroup>

            <TableHead>
              <TableRow>
                {headers.map((header) => {
                  const headerProps = getHeaderProps({ header });
                  const { key: _reactKey, ...restHeaderProps } = headerProps ?? {};

                  return (
                    <TableHeader key={header.key} {...restHeaderProps}>
                      {header.header}
                      <Table {...getTableProps()} />
                    </TableHeader>
                  );
                })}
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((row) => {
                const rowProps = getRowProps({ row });
                const { key: _reactKey, ...restRowProps } = rowProps ?? {};

                return (
                  <TableRow key={row.id} {...restRowProps}>
                    {row.cells.map((cell) => {
                      return <TableCell key={cell.id}>{cell.value}</TableCell>;
                    })}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </DataTable>
  );
}
