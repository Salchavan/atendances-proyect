import { useEffect, useMemo, useState, useTransition } from 'react';
import type { RowDataType } from 'rsuite/esm/Table';
import typeColumns from '../../../public/data/defaultDataTabletColumns.json';
import { useFilterStore } from '../../store/specificStore/DataTableStore.ts';
import { useStore } from '../../Store/Store.ts';
import { useNavigateTo } from '../../Logic.ts';

export const useDataTableLogic = ({
  tableData,
  filtersEnabled,
}: {
  tableData: RowDataType[];
  filtersEnabled?: boolean;
}) => {
  const [columns, setColumns] = useState<typeof typeColumns>([]);
  useEffect(() => {
    (async () => {
      const data = (
        await import('../../../public/data/defaultDataTabletColumns.json')
      ).default;
      setColumns(data);
    })();
  }, []);

  const {
    getFilteredData,
    globalSearch,
    dayFilter,
    setGlobalSearch,
    setDayFilter,
    clearAllFilters,
    filtersEnabled: storeFiltersEnabled,
  } = useFilterStore();

  const effectiveFiltersEnabled =
    typeof filtersEnabled === 'boolean' ? filtersEnabled : storeFiltersEnabled;

  // search debounce
  const [searchInput, setSearchInput] = useState(globalSearch);
  const [, startTransition] = useTransition();

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(event.target.value);
  };

  useEffect(() => {
    const handler = setTimeout(() => {
      if (searchInput !== globalSearch) {
        startTransition(() => setGlobalSearch(searchInput));
      }
    }, 1000);
    return () => clearTimeout(handler);
  }, [searchInput, globalSearch, setGlobalSearch]);

  const filteredData = useMemo(() => {
    return getFilteredData(tableData);
  }, [tableData, globalSearch, dayFilter, getFilteredData]);

  // row click: select and navigate
  const setPerfilUserSelected = useStore((s) => s.setPerfilUserSelected);
  const closeDialog = useStore((s) => s.closeDialog);
  const navigateTo = useNavigateTo();

  const onRowClick = (row: RowDataType) => {
    setPerfilUserSelected(row as any);
    closeDialog();
    navigateTo('/home/profile');
  };

  return {
    // state for UI
    columns,
    filteredData,
    globalSearch,
    dayFilter,
    setGlobalSearch,
    setDayFilter,
    clearAllFilters,
    effectiveFiltersEnabled,
    // search input
    searchInput,
    handleSearchChange,
    // actions
    onRowClick,
  };
};
