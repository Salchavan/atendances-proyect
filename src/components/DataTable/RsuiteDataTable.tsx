import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Table } from 'rsuite';
import { Box } from '@mui/material';
import typeColumns from '../../data/defaultDataTabletColumns.json';
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
    <ErrorBoundary fallback={<div>Error loading table.</div>}>
      <Box
        ref={containerRef}
        className={(className ? className + ' ' : '') + 'h-full min-h-0'}
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
          style={{ fontSize: '0.95rem' }}
        >
          {columns.map((col) => (
            <Column
              key={col.field}
              width={col.width || 120}
              resizable
              align='left'
              sortable
            >
              <HeaderCell style={{ fontWeight: 'bold' }}>
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
