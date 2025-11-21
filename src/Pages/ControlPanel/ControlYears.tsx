import { useState, useMemo, useCallback, type MouseEvent } from 'react';
import {
  Alert,
  Box,
  Button,
  Divider,
  Menu,
  MenuItem,
  Stack,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import ViewListIcon from '@mui/icons-material/ViewList';
import RefreshIcon from '@mui/icons-material/Refresh';
import {
  DataGrid,
  type GridCellParams,
  type GridColDef,
} from '@mui/x-data-grid';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { getYears, delYears } from '../../api/client';
import { useDebouncedValue } from '../../hooks/useDebouncedValue';
import { SearchActionBar } from './components/SearchActionBar';
import { AddYearForm } from './components/AddYearForm';
import { useStore } from '../../store/Store';

type YearRecord = {
  id?: number;
  year_number?: number;
  created_at?: string;
  updated_at?: string;
};

type YearRow = {
  id: number;
  number: number | string;
  created_at?: string;
  updated_at?: string;
};

const formatDate = (value?: string) => {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('es-AR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

const yearColumns: GridColDef[] = [
  { field: 'id', headerName: 'ID', width: 80 },
  { field: 'number', headerName: 'Año', width: 140 },
  {
    field: 'created_at',
    headerName: 'Creado',
    flex: 1,
    minWidth: 140,
    valueFormatter: (params: any) =>
      formatDate((params?.value as string | undefined) ?? undefined),
  },
  {
    field: 'updated_at',
    headerName: 'Actualizado',
    flex: 1,
    minWidth: 140,
    valueFormatter: (params: any) =>
      formatDate((params?.value as string | undefined) ?? undefined),
  },
];

export const ControlYears = () => {
  const { data, isError, refetch } = useQuery({
    queryKey: ['years'],
    queryFn: getYears,
    staleTime: 60_000,
  });
  const [searchValue, setSearchValue] = useState('');
  const debouncedSearch = useDebouncedValue(searchValue, 750);
  const queryClient = useQueryClient();
  const openDialog = useStore((state) => state.openDialog);
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedRow, setSelectedRow] = useState<YearRow | null>(null);

  const years = useMemo<YearRecord[]>(() => {
    if (!data) return [];
    if (Array.isArray(data)) return data as YearRecord[];
    const record = data as Record<string, unknown>;
    if (Array.isArray(record.years)) return record.years as YearRecord[];
    if (Array.isArray(record.data)) return record.data as YearRecord[];
    return [];
  }, [data]);

  const rows = useMemo<YearRow[]>(() => {
    return years.map((year, index) => ({
      id: year.id ?? index,
      number: year.year_number ?? '—',
      created_at: year.created_at,
      updated_at: year.updated_at,
    }));
  }, [years]);

  const normalizedSearch = debouncedSearch.trim().toLowerCase();
  const filteredRows = useMemo(() => {
    if (!normalizedSearch) return rows;
    return rows.filter((row) => {
      const candidates = [row.id, row.number];
      return candidates.some((value) =>
        String(value ?? '')
          .toLowerCase()
          .includes(normalizedSearch)
      );
    });
  }, [rows, normalizedSearch]);

  const deleteYearMutation = useMutation({
    mutationFn: (payload: number[]) => delYears(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['years'] });
      await queryClient.invalidateQueries({ queryKey: ['classrooms'] });
    },
  });

  const handleCellClick = useCallback(
    (params: GridCellParams, event: MouseEvent<HTMLElement>) => {
      event.preventDefault();
      setSelectedRow(params.row as YearRow);
      setMenuAnchorEl(event.currentTarget);
    },
    []
  );

  const handleMenuClose = () => setMenuAnchorEl(null);

  const handleOpenAddYear = () => {
    openDialog(<AddYearForm />, 'Añadir año', {
      width: 420,
      height: 320,
    });
  };

  const handleDeleteYear = async () => {
    if (!selectedRow?.id) return;
    const confirmed = window.confirm(
      `¿Eliminar el año "${selectedRow.number}"? Esta acción no se puede deshacer.`
    );
    if (!confirmed) {
      handleMenuClose();
      return;
    }
    try {
      await deleteYearMutation.mutateAsync([Number(selectedRow.id)]);
    } catch (error) {
      console.error('Error deleting year', error);
    } finally {
      handleMenuClose();
    }
  };

  return (
    <Box sx={{ paddingLeft: 2 }}>
      <Stack spacing={2}>
        <Typography variant='h5'>Años escolares</Typography>
        <Typography variant='body2' color='text.secondary'>
          Administra los años disponibles que se asignan a los cursos.
        </Typography>
        <SearchActionBar
          value={searchValue}
          onChange={setSearchValue}
          placeholder='Buscar por número o ID'
          actions={
            <>
              <Button
                variant='contained'
                startIcon={<AddIcon />}
                onClick={handleOpenAddYear}
              >
                Añadir año
              </Button>
              <Button variant='outlined' startIcon={<ViewListIcon />} disabled>
                Importar lista
              </Button>
              <Button
                variant='text'
                startIcon={<RefreshIcon />}
                onClick={() => refetch()}
              >
                Actualizar
              </Button>
            </>
          }
        />
        <Divider />
        {isError ? (
          <Alert
            severity='error'
            action={
              <Button color='inherit' onClick={() => refetch()}>
                Reintentar
              </Button>
            }
          >
            No pudimos cargar los años. Intenta nuevamente.
          </Alert>
        ) : (
          <Box
            sx={{
              width: '100%',
              minWidth: 0,
              height: { xs: 420, md: '65vh' },
              maxHeight: '65vh',
              overflowX: 'auto',
              overflowY: 'hidden',
              pr: 1,
            }}
          >
            <DataGrid
              rows={filteredRows}
              columns={yearColumns}
              disableRowSelectionOnClick
              onCellClick={handleCellClick}
              initialState={{
                pagination: { paginationModel: { pageSize: 10, page: 0 } },
              }}
              pageSizeOptions={[5, 10, 25]}
            />
          </Box>
        )}

        <Menu
          anchorEl={menuAnchorEl}
          open={Boolean(menuAnchorEl)}
          onClose={handleMenuClose}
        >
          <MenuItem
            onClick={handleDeleteYear}
            sx={{ color: 'error.main' }}
            disabled={deleteYearMutation.isPending}
          >
            Eliminar
          </MenuItem>
        </Menu>
      </Stack>
    </Box>
  );
};
