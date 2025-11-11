import React, { useMemo } from 'react';
import { Box, useTheme } from '@mui/material';
import {
  DataGrid,
  type GridColDef,
  type GridRowParams,
} from '@mui/x-data-grid';
import { typeColumns } from '../../types/generalTypes.ts';
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
    const fit = !!fitColumns; // default to fixed layout unless explicitly true
    return columns.map((c) => {
      const col: GridColDef = {
        field: String((c as any).field),
        headerName: (c as any).headerName,
        sortable: (c as any).sortable !== false,
      } as GridColDef;
      if (fit) {
        // Flexible layout: columns expand to fill available width
        col.flex = 1;
        const defaultMin = 80;
        const maxClamp = 160;
        col.minWidth = Math.min(maxClamp, (c as any).minWidth ?? defaultMin);
      } else {
        // Fixed layout: no flex; avoid other columns growing when one shrinks
        col.flex = undefined;
        const fallbackWidth = (c as any).width ?? (c as any).minWidth ?? 140;
        const fallbackMin = 100;
        col.width = fallbackWidth;
        col.minWidth =
          (c as any).minWidth ?? Math.min(fallbackWidth, fallbackMin);
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
        getRowId={(row: any) =>
          row.id ?? row.ID ?? row.email ?? JSON.stringify(row)
        }
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
