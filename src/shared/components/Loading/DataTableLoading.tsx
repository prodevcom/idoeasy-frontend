'use client';

import {
  SkeletonText,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableHeader,
  TableRow,
  TableToolbar,
  TableToolbarContent,
} from '@carbon/react';
import { useMemo } from 'react';

export type ColumnSpec = {
  /** unique key / field name */
  key: string;
  /** header label (falls back to Start Case of key) */
  header?: string;
  /** example text just to size the skeleton width better (optional) */
  example?: string;
  /** fixed width percentage for the skeleton (optional, overrides example) */
  widthPct?: number;
};

export function DataTableLoading({
  columns,
  rowCount = 10,
  showTitle = true,
  showToolbar = true,
  size = 'lg',
}: {
  columns: ColumnSpec[];
  rowCount?: number;
  showTitle?: boolean;
  showToolbar?: boolean;

  size?: 'sm' | 'md' | 'lg';
}) {
  const widths = useMemo(() => {
    const fallback = [70, 40, 55, 30, 60, 45, 35, 50];
    return columns.map((c, i) => {
      if (typeof c.widthPct === 'number') return Math.max(15, Math.min(90, c.widthPct));
      if (c.example) {
        const len = c.example.length;
        // crude mapping from text length to %
        if (len <= 6) return 30;
        if (len <= 12) return 45;
        if (len <= 20) return 60;
        return 75;
      }
      return fallback[i % fallback.length];
    });
  }, [columns]);

  const headers = columns.map((c) => c.header ?? startCase(c.key));

  return (
    <TableContainer
      title={
        showTitle ? (
          <span style={{ display: 'inline-block', width: '15%', height: '0.75rem' }} />
        ) : (
          ''
        )
      }
      description={
        showTitle ? (
          <span style={{ display: 'inline-block', width: '45%', height: '0.50rem' }} />
        ) : (
          ''
        )
      }
      style={{ width: '100%' }}
    >
      {showToolbar && (
        <TableToolbar>
          <TableToolbarContent>
            <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.5rem' }}>
              <SkeletonText width="8rem" className="fake-action-button" />
            </div>
          </TableToolbarContent>
        </TableToolbar>
      )}

      <div className="table-responsive">
        <Table size={size}>
          <TableHead>
            <TableRow>
              {headers.map((h, idx) => (
                <TableHeader key={`${columns[idx].key}-header`}>
                  <SkeletonText heading={false} width={`${widths[idx]}%`} />
                </TableHeader>
              ))}
            </TableRow>
          </TableHead>

          <TableBody>
            {Array.from({ length: rowCount }).map((_, rIdx) => (
              <TableRow key={`row-${rIdx}`}>
                {columns.map((col, cIdx) => (
                  <TableCell key={`${col.key}-${rIdx}`}>
                    <SkeletonText heading={false} width={`${widths[cIdx]}%`} />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </TableContainer>
  );
}

/** tiny helper: "createdAt" -> "Created At" */
function startCase(str: string) {
  return str
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/[_\-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/^./, (s) => s.toUpperCase());
}
