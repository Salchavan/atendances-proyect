import { useEffect, useRef, useState, useTransition, useMemo } from 'react';
import type { RowDataType } from 'rsuite/esm/Table';
import { typeColumns } from '../../types/generalTypes.ts';
import { useFilterStore } from '../../store/specificStore/DataTableStore.ts';
import { useStore } from '../../store/Store';
import { useNavigateTo } from '../../Logic.ts';
import FilterWorker from './filterWorker.ts?worker';

export const useDataTableLogic = ({
  tableData,
  filtersEnabled,
}: {
  tableData: RowDataType[];
  filtersEnabled?: boolean;
}) => {
  // Initialize columns from the shared `typeColumns` definition.
  // Previously this code called `setColumns(columns)` which re-set the
  // state to the empty initial value — leaving `columns` empty and
  // producing a table with rows but no visible columns. Use the
  // canonical `typeColumns` here so the grid receives the proper defs.
  // Columns canonical defined in shared types
  const columns = useMemo(() => typeColumns, []);

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

  // search debounce (input controlled locally), and keep it in sync with store
  const [searchInput, setSearchInput] = useState(globalSearch);
  const [, startTransition] = useTransition();
  useEffect(() => {
    // When store globalSearch changes externally (e.g., clearAll), reflect it here
    setSearchInput(globalSearch);
  }, [globalSearch]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(event.target.value);
  };

  useEffect(() => {
    const handler = setTimeout(() => {
      if (searchInput !== globalSearch) {
        startTransition(() => setGlobalSearch(searchInput));
      }
    }, 400);
    return () => clearTimeout(handler);
  }, [searchInput, globalSearch, setGlobalSearch]);

  // Async filtering in a Web Worker to avoid freezing UI
  const [filteredData, setFilteredData] = useState<RowDataType[]>(
    () => tableData as RowDataType[]
  );
  const [loading, setLoading] = useState(false);
  const workerRef = useRef<Worker | null>(null);
  const requestIdRef = useRef(0);

  // Init worker once
  useEffect(() => {
    try {
      workerRef.current = new FilterWorker();
    } catch (e) {
      // If worker fails (CSP, dev env, or bundler), fallback to sync mode
      workerRef.current = null;
      // console.warn('FilterWorker unavailable, using sync filtering.', e);
    }
    return () => {
      try {
        workerRef.current?.terminate();
      } catch {
        // ignore
      }
      workerRef.current = null;
    };
  }, []);

  // Whenever inputs change, post to worker; cancel stale responses via id
  useEffect(() => {
    const w = workerRef.current;
    if (!w) {
      // Fallback sync filtering if worker unavailable
      setLoading(true);
      try {
        setFilteredData(getFilteredData(tableData) as RowDataType[]);
      } finally {
        setLoading(false);
      }
      return;
    }
    const id = ++requestIdRef.current;
    setLoading(true);
    const onMessage = (e: MessageEvent<any>) => {
      const msg = e.data as { id: number; type: 'result'; rows: any[] };
      if (!msg || msg.type !== 'result' || msg.id !== id) return; // ignore stale
      setFilteredData(msg.rows as RowDataType[]);
      setLoading(false);
      w.removeEventListener('message', onMessage);
    };
    w.addEventListener('message', onMessage);
    w.postMessage({
      id,
      type: 'filter',
      data: tableData,
      globalSearch,
      dayFilter,
    });

    return () => {
      w.removeEventListener('message', onMessage);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tableData, globalSearch, dayFilter]);

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
    loading,
    globalSearch,
    dayFilter,
    setGlobalSearch,
    setDayFilter,
    clearAllFilters,
    effectiveFiltersEnabled,
    // search input
    searchInput,
    handleSearchChange,
    clearSearchInput: () => setSearchInput(''),
    // actions
    onRowClick,
  };
};
