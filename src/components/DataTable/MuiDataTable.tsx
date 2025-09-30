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
}

export const MuiDataTable: React.FC<Props> = ({
  columns,
  data,
  onRowClick,
  className,
}) => {
  const theme = useTheme();

  const gridColumns: GridColDef[] = useMemo(
    () =>
      columns.map((c) => ({
        field: String(c.field),
        headerName: c.headerName,
        width: c.width,
        minWidth: c.minWidth,
        sortable: c.sortable !== false,
        flex: c.width ? undefined : 1,
      })),
    [columns]
  );

  const rows = useMemo(() => data as any[], [data]);

  return (
    <Box className={className} sx={{ height: '100%', minHeight: 0 }}>
      <DataGrid
        rows={rows}
        columns={gridColumns}
        getRowId={(row: any) => row.id}
        onRowClick={(params: GridRowParams) =>
          onRowClick(params.row as RowDataType)
        }
        sortingOrder={['asc', 'desc']}
        disableColumnMenu
        // Virtualization is built-in; adjust buffer in pixels for smoother scroll
        rowBufferPx={300}
        sx={{
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
          },
          '& .MuiDataGrid-cell': {
            borderColor: theme.palette.divider,
          },
        }}
      />
    </Box>
  );
};
