import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Table } from 'rsuite';
import { Box, useTheme, Paper, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import typeColumns from '../../../public/data/defaultDataTabletColumns.json';
import type { RowDataType } from 'rsuite/esm/Table';
import { ErrorBoundary } from 'react-error-boundary';

interface Props {
  columns: typeof typeColumns;
  data: RowDataType[];
  onRowClick: (row: RowDataType) => void;
  className?: string;
}

export const RsuiteDataTable: React.FC<Props> = ({
  columns,
  data,
  onRowClick,
  className,
}) => {
  const theme = useTheme();
  const { Column, HeaderCell, Cell } = Table;
  // Medir altura disponible del contenedor para ajustar la tabla
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [containerHeight, setContainerHeight] = useState<number>(320);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const compute = () => {
      // Altura total disponible del contenedor
      const h = el.clientHeight;
      // Mínimo seguro para que rsuite-table no colapse
      setContainerHeight(Math.max(160, h));
    };
    compute();
    const ro = new ResizeObserver(compute);
    ro.observe(el);
    window.addEventListener('resize', compute);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', compute);
    };
  }, []);

  const [sortColumn, setSortColumn] = useState<string | undefined>(undefined);
  const [sortType, setSortType] = useState<'asc' | 'desc' | undefined>(
    undefined
  );

  const sortedData = useMemo(() => {
    if (!sortColumn || !sortType) return data;
    const copy = [...data];
    copy.sort((a: any, b: any) => {
      const x = a?.[sortColumn];
      const y = b?.[sortColumn];
      if (x == null && y == null) return 0;
      if (x == null) return sortType === 'asc' ? -1 : 1;
      if (y == null) return sortType === 'asc' ? 1 : -1;
      if (typeof x === 'number' && typeof y === 'number') {
        return sortType === 'asc' ? x - y : y - x;
      }
      const xs = String(x).toLocaleLowerCase();
      const ys = String(y).toLocaleLowerCase();
      const cmp = xs.localeCompare(ys);
      return sortType === 'asc' ? cmp : -cmp;
    });
    return copy;
  }, [data, sortColumn, sortType]);

  return (
    <ErrorBoundary
      fallback={
        <Paper sx={{ p: 2 }}>
          <Typography color='error'>Error loading table.</Typography>
        </Paper>
      }
    >
      <Box
        ref={containerRef}
        sx={{
          height: '100%',
          minHeight: 0,
          // Base colors
          '& .rs-table': {
            backgroundColor: theme.palette.background.paper,
            color: theme.palette.text.primary,
          },
          // Header row and cells
          '& .rs-table-row-header, & .rs-table-cell-header': {
            backgroundColor: theme.palette.background.paper,
            color: theme.palette.text.secondary,
            borderColor: theme.palette.divider,
            fontWeight: 600,
          },
          // Cell borders and text
          '& .rs-table-cell': {
            borderColor: theme.palette.divider,
            color: theme.palette.text.primary,
          },
          // Body rows base background
          '& .rs-table-row': {
            backgroundColor: theme.palette.background.paper,
          },
          // Zebra (suave)
          '& .rs-table-row:nth-of-type(even) .rs-table-cell': {
            backgroundColor: alpha(theme.palette.action.hover, 0.25),
          },
          // Hover row
          '& .rs-table-row:hover .rs-table-cell, & .rs-table-row.rs-table-row-hover .rs-table-cell':
            {
              backgroundColor: theme.palette.action.hover,
            },
          // Scrollbars (WebKit)
          '& ::-webkit-scrollbar': { width: 8, height: 8 },
          '& ::-webkit-scrollbar-thumb': {
            backgroundColor: alpha(theme.palette.text.primary, 0.25),
            borderRadius: 8,
          },
          '& ::-webkit-scrollbar-thumb:hover': {
            backgroundColor: alpha(theme.palette.text.primary, 0.4),
          },
        }}
        className={className}
      >
        <Table
          data={sortedData}
          rowKey='id'
          height={containerHeight}
          bordered
          cellBordered
          headerHeight={36}
          rowHeight={30}
          virtualized
          sortColumn={sortColumn}
          sortType={sortType}
          onSortColumn={(column, type) => {
            setSortColumn(column as string);
            setSortType(type as 'asc' | 'desc');
          }}
          onRowClick={onRowClick}
          locale={{ emptyMessage: 'Sin datos' }}
          style={{
            fontSize: '0.95rem',
            backgroundColor: theme.palette.background.paper,
            color: theme.palette.text.primary,
          }}
        >
          {columns.map((col) => (
            <Column
              key={col.field}
              width={col.width || 120}
              resizable
              align='left'
              sortable
            >
              <HeaderCell
                style={{
                  fontWeight: 700,
                  backgroundColor: theme.palette.background.paper,
                  color: theme.palette.text.secondary,
                  borderColor: theme.palette.divider,
                }}
              >
                {col.headerName}
              </HeaderCell>
              <Cell dataKey={col.field as string} fullText />
            </Column>
          ))}
        </Table>
      </Box>
    </ErrorBoundary>
  );
};
