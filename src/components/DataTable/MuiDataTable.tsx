import React, { useMemo } from 'react';
import { Box, useTheme } from '@mui/material';
import {
  DataGrid,
  type GridColDef,
  type GridRowParams,
} from '@mui/x-data-grid';
import typeColumns from '../../../public/data/defaultDataTabletColumns.json';
import type { RowDataType } from 'rsuite/esm/Table';

interface Props {
  columns: typeof typeColumns;
  data: RowDataType[];
  onRowClick: (row: RowDataType) => void;
  className?: string;
  loading?: boolean;
  fitColumns?: boolean;
}

export const MuiDataTable: React.FC<Props> = ({
  columns,
  data,
  onRowClick,
  className,
  loading,
  fitColumns,
}) => {
  const theme = useTheme();

  const gridColumns: GridColDef[] = useMemo(() => {
    const fit = !!fitColumns;
    return columns.map((c) => {
      const field = String(c.field);
      const isFixed = !fit && (field === 'id' || field === 'age');
      const col: GridColDef = {
        field,
        headerName: c.headerName,
        sortable: c.sortable !== false,
      } as GridColDef;
      if (isFixed) {
        col.width = c.width ?? 60;
        col.minWidth = c.minWidth ?? c.width ?? 60;
      } else {
        // Make most columns flexible to adapt to container width
        col.flex = 1;
        // Allow shrink while keeping readability
        const defaultMin = fit ? 80 : 100;
        const maxClamp = fit ? 160 : 180;
        col.minWidth = Math.min(maxClamp, c.minWidth ?? defaultMin);
      }
      return col;
    });
  }, [columns, fitColumns]);

  const rows = useMemo(() => data as any[], [data]);

  return (
    <Box
      className={className}
      sx={{
        height: '100%',
        minHeight: 0,
        width: '100%',
        minWidth: 0,
        fontFamily:
          'system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif',
      }}
    >
      <DataGrid
        rows={rows}
        columns={gridColumns}
        getRowId={(row: any) => row.id}
        onRowClick={(params: GridRowParams) =>
          onRowClick(params.row as RowDataType)
        }
        sortingOrder={['asc', 'desc']}
        disableColumnMenu
        loading={!!loading}
        // Virtualization is built-in; adjust buffer in pixels for smoother scroll
        rowBufferPx={300}
        sx={{
          width: '100%',
          maxWidth: '100%',
          minWidth: 0,
          overflowX: 'auto',
          border: 0,
          fontFamily:
            'system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif',
          '&.MuiDataGrid-root': {
            backgroundColor: theme.palette.background.paper,
            color: theme.palette.text.primary,
          },
          '& .MuiDataGrid-columnHeaders': {
            backgroundColor: theme.palette.background.paper,
            color: theme.palette.text.secondary,
            borderColor: theme.palette.divider,
            fontWeight: 600,
            whiteSpace: 'nowrap',
            '& .MuiDataGrid-columnHeaderTitle': {
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            },
          },
          '& .MuiDataGrid-cell': {
            borderColor: theme.palette.divider,
            minWidth: 0,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          },
          '& .MuiDataGrid-virtualScroller': {
            minWidth: 0,
          },
        }}
      />
    </Box>
  );
};
