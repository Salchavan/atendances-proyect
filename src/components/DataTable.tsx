// components/DataTable.tsx
import React, { useMemo } from 'react';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import { FilterToolbar } from './FilterToolbar';
import { useFilterStore } from '../Store/specificStore/DataTableStore.ts';
import { defaultDataTabletColumns } from '../data/Data';
import type { RowDataType } from 'rsuite/esm/Table';

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
          pagination: { paginationModel: { pageSize: 10 } },
        }}
        pageSizeOptions={[]}
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
    </div>
  );
};
