// components/DataTable.tsx
import React, { useMemo } from 'react';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import { FilterToolbar } from './FilterToolbar';
import { useFilterStore } from '../store/Store.ts';
import { defaultDataTabletColumns } from '../data/Data';
import type { RowDataType } from 'rsuite/esm/Table';
import { Box, Typography } from '@mui/material';

type Props = {
  tableData: RowDataType[];
};

export const DataTable = ({ tableData }: Props) => {
  const { getFilteredData, globalSearch, dayFilter } = useFilterStore();

  // Aplicar filtros a los datos
  const filteredData = useMemo(() => {
    return getFilteredData(tableData);
  }, [tableData, globalSearch, dayFilter, getFilteredData]);

  return (
    <div>
      <FilterToolbar />

      <DataGrid
        columns={defaultDataTabletColumns}
        rows={filteredData}
        rowHeight={25}
        columnHeaderHeight={36}
        initialState={{
          pagination: { paginationModel: { pageSize: 15 } },
        }}
        pageSizeOptions={[15, 25, 50]}
        slots={{
          toolbar: GridToolbar, // Toolbar de DataGrid para columnas, export, etc.
        }}
        sx={{
          '& .MuiDataGrid-cell': {
            fontSize: '0.875rem',
          },
          '& .MuiDataGrid-columnHeader': {
            fontSize: '0.875rem',
            fontWeight: 'bold',
          },
        }}
      />

      {/* Contador de resultados */}
      <Box sx={{ mt: 1, p: 1, backgroundColor: 'grey.50', borderRadius: 1 }}>
        <Typography variant='body2' color='text.secondary'>
          Mostrando {filteredData.length} de {tableData.length} registros
          {(globalSearch || dayFilter !== 'all') && ' (filtrados)'}
        </Typography>
      </Box>
    </div>
  );
};
