import React, { useMemo, useState } from 'react';
import { Table } from 'rsuite';
import { Box } from '@mui/material';
import typeColumns from '../../data/defaultDataTabletColumns.json';
import type { RowDataType } from 'rsuite/esm/Table';

interface Props {
  columns: typeof typeColumns;
  data: RowDataType[];
  onRowClick: (row: RowDataType) => void;
}

export const RsuiteDataTable: React.FC<Props> = ({
  columns,
  data,
  onRowClick,
}) => {
  const { Column, HeaderCell, Cell } = Table;
  const TABLE_HEIGHT = 520;

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
    <Box>
      <Table
        data={sortedData}
        rowKey='id'
        height={TABLE_HEIGHT}
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
  );
};
