// components/DataTable.tsx (UI only)
import type { RowDataType } from 'rsuite/esm/Table';
import { ErrorBoundary } from 'react-error-boundary';
import { DataTableToolbar } from './DataTableToolbar';
// Reemplazo basado en MUI (mantiene el RsuiteDataTable por si hay que volver)
import { MuiDataTable } from './MuiDataTable';
import { useDataTableLogic } from './DataTable.logic';
import { Box, Paper, Typography } from '@mui/material';

type Props = {
  tableData: RowDataType[];
  /** Permite forzar la visibilidad de la barra de filtros. Si es undefined usa el valor del store. */
  filtersEnabled?: boolean;
};

export const DataTable = ({ tableData, filtersEnabled }: Props) => {
  const logic = useDataTableLogic({ tableData, filtersEnabled });

  return (
    <ErrorBoundary
      fallback={
        <Paper sx={{ p: 2 }}>
          <Typography color='error'>Error loading table.</Typography>
        </Paper>
      }
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          minHeight: 0,
        }}
      >
        {logic.effectiveFiltersEnabled && (
          <Box sx={{ flexShrink: 0 }}>
            <DataTableToolbar
              globalSearch={logic.globalSearch}
              searchInput={logic.searchInput}
              onSearchChange={logic.handleSearchChange}
              dayFilter={logic.dayFilter}
              setDayFilter={logic.setDayFilter}
              setGlobalSearch={logic.setGlobalSearch}
              clearAllFilters={logic.clearAllFilters}
            />
          </Box>
        )}

        <Box sx={{ flex: 1, minHeight: 0 }}>
          <MuiDataTable
            columns={logic.columns}
            data={logic.filteredData}
            onRowClick={logic.onRowClick}
          />
        </Box>
      </Box>
    </ErrorBoundary>
  );
};
