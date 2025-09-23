// components/DataTable.tsx (UI only)
import type { RowDataType } from 'rsuite/esm/Table';
import { ErrorBoundary } from 'react-error-boundary';
import { DataTableToolbar } from './DataTableToolbar';
import { RsuiteDataTable } from './RsuiteDataTable';
import { useDataTableLogic } from './DataTable.logic';

type Props = {
  tableData: RowDataType[];
  /** Permite forzar la visibilidad de la barra de filtros. Si es undefined usa el valor del store. */
  filtersEnabled?: boolean;
};

export const DataTable = ({ tableData, filtersEnabled }: Props) => {
  const logic = useDataTableLogic({ tableData, filtersEnabled });

  return (
    <ErrorBoundary fallback={<div>Error loading table.</div>}>
      <div>
        {logic.effectiveFiltersEnabled && (
          <DataTableToolbar
            globalSearch={logic.globalSearch}
            searchInput={logic.searchInput}
            onSearchChange={logic.handleSearchChange}
            dayFilter={logic.dayFilter}
            setDayFilter={logic.setDayFilter}
            setGlobalSearch={logic.setGlobalSearch}
            clearAllFilters={logic.clearAllFilters}
          />
        )}

        <RsuiteDataTable
          columns={logic.columns}
          data={logic.filteredData}
          onRowClick={logic.onRowClick}
        />
      </div>
    </ErrorBoundary>
  );
};
