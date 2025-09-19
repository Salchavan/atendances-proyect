// components/DataTable.tsx
import React, { useMemo, useState, useEffect, useTransition } from 'react';
import { Table } from 'rsuite';
import {
  TextField,
  Box,
  IconButton,
  Chip,
  Paper,
  Menu,
  MenuItem,
  Button,
  Typography,
} from '@mui/material';
import {
  Clear as ClearIcon,
  FilterList as FilterListIcon,
  ArrowDropDown as ArrowDropDownIcon,
  Search as SearchIcon,
  Event as EventIcon,
} from '@mui/icons-material';
import {
  useFilterStore,
  type DayFilter,
} from '../Store/specificStore/DataTableStore.ts';
import type { RowDataType } from 'rsuite/esm/Table';
import typeColumns from '../data/defaultDataTabletColumns.json';

type Props = {
  tableData: RowDataType[];
  /** Permite forzar la visibilidad de la barra de filtros. Si es undefined usa el valor del store. */
  filtersEnabled?: boolean;
};

export const DataTable = ({ tableData, filtersEnabled }: Props) => {
  const [defaultDataTabletColumns, setDefaultDataTabletColumns] = useState<
    typeof typeColumns
  >([]);
  useEffect(() => {
    (async () => {
      const data = (await import('../data/defaultDataTabletColumns.json'))
        .default;
      setDefaultDataTabletColumns(data);
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

  // Estado local para menú de filtro de días (antes en FilterToolbar)
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleMenuClose = () => setAnchorEl(null);
  const handleDayFilterSelect = (filter: DayFilter) => {
    setDayFilter(filter);
    handleMenuClose();
  };
  // Estado local inmediato para el input (debounce antes de impactar el store)
  const [searchInput, setSearchInput] = useState(globalSearch);
  const [isPending, startTransition] = useTransition();

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(event.target.value);
  };

  // Debounce: esperar 1000ms tras el último tecleo antes de actualizar el store
  useEffect(() => {
    const handler = setTimeout(() => {
      if (searchInput !== globalSearch) {
        // Marcar como transición para no bloquear el input durante renders pesados
        startTransition(() => setGlobalSearch(searchInput));
      }
    }, 1000);
    return () => clearTimeout(handler);
  }, [searchInput, globalSearch, setGlobalSearch]);

  const hasActiveFilters = globalSearch !== '' || dayFilter !== 'weekdays';

  const getDayFilterText = (filter: DayFilter): string => {
    const filterTexts: Record<DayFilter, string> = {
      weekdays: 'Días laborables',
      monday: 'Solo Lunes',
      tuesday: 'Solo Martes',
      wednesday: 'Solo Miércoles',
      thursday: 'Solo Jueves',
      friday: 'Solo Viernes',
    };
    return filterTexts[filter];
  };
  const getSpanishDayName = (filter: DayFilter): string => {
    const dayNames: Record<DayFilter, string> = {
      weekdays: 'Laborables',
      monday: 'Lunes',
      tuesday: 'Martes',
      wednesday: 'Miércoles',
      thursday: 'Jueves',
      friday: 'Viernes',
    };
    return dayNames[filter];
  };

  // Aplicar filtros a los datos
  const filteredData = useMemo(() => {
    return getFilteredData(tableData);
  }, [tableData, globalSearch, dayFilter, getFilteredData]);

  return (
    <div>
      {effectiveFiltersEnabled && (
        <Paper elevation={2} sx={{ p: 2, mb: 2 }}>
          <Box display='flex' alignItems='center' gap={2} flexWrap='wrap'>
            <FilterListIcon color='primary' />
            <TextField
              label='Buscar estudiantes...'
              variant='outlined'
              size='small'
              value={searchInput}
              onChange={handleSearchChange}
              sx={{ minWidth: 250 }}
              InputProps={{
                startAdornment: (
                  <SearchIcon sx={{ color: 'text.secondary', mr: 1 }} />
                ),
              }}
              placeholder='Nombre, email, aula...'
            />
            <Button
              variant='outlined'
              onClick={handleMenuOpen}
              startIcon={<EventIcon />}
              endIcon={<ArrowDropDownIcon />}
              sx={{ minWidth: 200 }}
            >
              {getDayFilterText(dayFilter)}
            </Button>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
              PaperProps={{ sx: { maxHeight: 300 } }}
            >
              <MenuItem
                onClick={() => handleDayFilterSelect('weekdays')}
                selected={dayFilter === 'weekdays'}
              >
                Días laborables (Lun-Vie)
              </MenuItem>
              <MenuItem
                onClick={() => handleDayFilterSelect('monday')}
                selected={dayFilter === 'monday'}
              >
                Solo Lunes
              </MenuItem>
              <MenuItem
                onClick={() => handleDayFilterSelect('tuesday')}
                selected={dayFilter === 'tuesday'}
              >
                Solo Martes
              </MenuItem>
              <MenuItem
                onClick={() => handleDayFilterSelect('wednesday')}
                selected={dayFilter === 'wednesday'}
              >
                Solo Miércoles
              </MenuItem>
              <MenuItem
                onClick={() => handleDayFilterSelect('thursday')}
                selected={dayFilter === 'thursday'}
              >
                Solo Jueves
              </MenuItem>
              <MenuItem
                onClick={() => handleDayFilterSelect('friday')}
                selected={dayFilter === 'friday'}
              >
                Solo Viernes
              </MenuItem>
            </Menu>
            {hasActiveFilters && (
              <IconButton
                onClick={clearAllFilters}
                color='error'
                title='Limpiar todos los filtros'
                sx={{ ml: 'auto' }}
              >
                <ClearIcon />
              </IconButton>
            )}
          </Box>
          {hasActiveFilters && (
            <Box sx={{ mt: 2 }}>
              <Typography variant='body2' color='text.secondary' gutterBottom>
                Filtros activos:
              </Typography>
              <Box display='flex' gap={1} flexWrap='wrap'>
                {globalSearch && (
                  <Chip
                    label={`Búsqueda: "${globalSearch}"`}
                    onDelete={() => setGlobalSearch('')}
                    color='primary'
                    variant='outlined'
                    size='small'
                  />
                )}
                {dayFilter !== 'weekdays' && (
                  <Chip
                    label={`Día: ${getSpanishDayName(dayFilter)}`}
                    onDelete={() => setDayFilter('weekdays')}
                    color='secondary'
                    variant='outlined'
                    size='small'
                  />
                )}
              </Box>
            </Box>
          )}
        </Paper>
      )}

      {/* Tabla rsuite (scroll interno, sin paginación) */}
      <RsuiteTable columns={defaultDataTabletColumns} data={filteredData} />
    </div>
  );
};

// Subcomponente para encapsular la Table de rsuite y su paginación
const RsuiteTable = ({
  columns,
  data,
}: {
  columns: typeof typeColumns;
  data: RowDataType[];
}) => {
  const { Column, HeaderCell, Cell } = Table;
  // Alto fijo para que el scroll sea sólo dentro de la tabla (toolbar queda fija)
  const TABLE_HEIGHT = 520; // px, ajustable si lo necesitas

  // Estado de ordenamiento
  const [sortColumn, setSortColumn] = useState<string | undefined>(undefined);
  const [sortType, setSortType] = useState<'asc' | 'desc' | undefined>(
    undefined
  );

  const sortedData = useMemo(() => {
    if (!sortColumn || !sortType) return data;
    const copy = [...data];
    copy.sort((a: any, b: any) => {
      const x = a?.[sortColumn];
      const y = b?.[sortColumn];
      if (x == null && y == null) return 0;
      if (x == null) return sortType === 'asc' ? -1 : 1;
      if (y == null) return sortType === 'asc' ? 1 : -1;
      if (typeof x === 'number' && typeof y === 'number') {
        return sortType === 'asc' ? x - y : y - x;
      }
      // Comparación como string por defecto
      const xs = String(x).toLocaleLowerCase();
      const ys = String(y).toLocaleLowerCase();
      const cmp = xs.localeCompare(ys);
      return sortType === 'asc' ? cmp : -cmp;
    });
    return copy;
  }, [data, sortColumn, sortType]);

  return (
    <Box>
      <Table
        data={sortedData}
        rowKey='id'
        height={TABLE_HEIGHT}
        bordered
        cellBordered
        headerHeight={36}
        rowHeight={30}
        virtualized
        sortColumn={sortColumn}
        sortType={sortType}
        onSortColumn={(column, type) => {
          setSortColumn(column as string);
          setSortType(type as 'asc' | 'desc');
        }}
        locale={{ emptyMessage: 'Sin datos' }}
        style={{ fontSize: '0.95rem' }}
      >
        {columns.map((col) => (
          <Column
            key={col.field}
            width={col.width || 120}
            resizable
            align='left'
            sortable
          >
            <HeaderCell style={{ fontWeight: 'bold' }}>
              {col.headerName}
            </HeaderCell>
            <Cell dataKey={col.field as string} fullText />
          </Column>
        ))}
      </Table>
    </Box>
  );
};
