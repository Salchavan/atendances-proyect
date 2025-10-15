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
  /** Clase(s) para integrarlo en un grid externo (por ejemplo Tailwind). */
  grid?: string;
  /** Habilita/Deshabilita el toolbar explícitamente (tiene prioridad sobre filtersEnabled). */
  toolbarEnabled?: boolean;
  /** Lista de fields a mostrar (filtra las columnas definidas por defecto). */
  visibleFields?: string[];
  /** Si true, las columnas se estiran para ocupar el ancho disponible (flex). Si false, respetan width/minWidth y no crecen al achicar otra. */
  fitColumns?: boolean;
};

export const DataTable = ({
  tableData,
  filtersEnabled,
  grid,
  toolbarEnabled,
  visibleFields,
  fitColumns,
}: Props) => {
  const effectiveFilters =
    typeof toolbarEnabled === 'boolean' ? toolbarEnabled : filtersEnabled;
  const logic = useDataTableLogic({
    tableData,
    filtersEnabled: effectiveFilters,
  });

  return (
    <ErrorBoundary
      fallback={
        <Paper sx={{ p: 2 }}>
          <Typography color='error'>Error loading table.</Typography>
        </Paper>
      }
    >
      <Box
        className={grid}
        sx={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          minHeight: 0,
          width: '100%',
          maxWidth: '100%',
          minWidth: 0,
          overflow: 'hidden',
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
              onClearInput={logic.clearSearchInput}
            />
          </Box>
        )}

        <Box
          sx={{
            flex: 1,
            minHeight: 0,
            width: '100%',
            maxWidth: '100%',
            minWidth: 0,
            overflow: 'auto',
          }}
        >
          <MuiDataTable
            columns={
              Array.isArray(visibleFields) && visibleFields.length
                ? (logic.columns || []).filter((c: any) =>
                    visibleFields.includes(String(c.field))
                  )
                : logic.columns
            }
            data={logic.filteredData}
            onRowClick={logic.onRowClick}
            loading={logic.loading}
            fitColumns={fitColumns}
          />
        </Box>
      </Box>
    </ErrorBoundary>
  );
};
