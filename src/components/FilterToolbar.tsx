// components/FilterToolbar.tsx
import React from 'react';
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

export const FilterToolbar: React.FC = () => {
  const {
    globalSearch,
    dayFilter,
    setGlobalSearch,
    setDayFilter,
    clearAllFilters,
  } = useFilterStore();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [showOnlyWithAbsences] = React.useState(false);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleDayFilterSelect = (filter: DayFilter) => {
    setDayFilter(filter);
    handleMenuClose();
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setGlobalSearch(event.target.value);
  };

  const hasActiveFilters =
    globalSearch !== '' || dayFilter !== 'weekdays' || showOnlyWithAbsences;

  // Texto descriptivo para el filtro de día
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

  // Función para obtener el nombre del día en español
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

  return (
    <Paper elevation={2} sx={{ p: 2, mb: 2 }}>
      <Box display='flex' alignItems='center' gap={2} flexWrap='wrap'>
        <FilterListIcon color='primary' />

        {/* Búsqueda global */}
        <TextField
          label='Buscar estudiantes...'
          variant='outlined'
          size='small'
          value={globalSearch}
          onChange={handleSearchChange}
          sx={{ minWidth: 250 }}
          InputProps={{
            startAdornment: (
              <SearchIcon sx={{ color: 'text.secondary', mr: 1 }} />
            ),
          }}
          placeholder='Nombre, email, aula...'
        />

        {/* Selector de días */}
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
          PaperProps={{
            sx: { maxHeight: 300 },
          }}
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

        {/* Botón limpiar filtros */}
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

      {/* Mostrar filtros activos */}
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
  );
};
