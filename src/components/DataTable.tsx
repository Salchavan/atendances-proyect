// components/DataTable.tsx
import React, { useMemo, useState, useEffect } from 'react';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
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

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(event.target.value);
  };

  // Debounce: esperar 500ms tras el último tecleo antes de actualizar el store
  useEffect(() => {
    const handler = setTimeout(() => {
      if (searchInput !== globalSearch) {
        setGlobalSearch(searchInput);
      }
    }, 500);
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
