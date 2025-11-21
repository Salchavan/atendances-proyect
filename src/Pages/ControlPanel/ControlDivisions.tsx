import { useMemo, useState, useCallback, type MouseEvent } from 'react';
import {
  Stack,
  Typography,
  Button,
  Divider,
  Box,
  Alert,
  Menu,
  MenuItem,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import ViewListIcon from '@mui/icons-material/ViewList';
import RefreshIcon from '@mui/icons-material/Refresh';
import {
  DataGrid,
  type GridColDef,
  type GridCellParams,
} from '@mui/x-data-grid';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { getDivisions, delDivisions } from '../../api/client';
import { SearchActionBar } from './components/SearchActionBar';
import { useDebouncedValue } from '../../hooks/useDebouncedValue';
import { AddDivisionForm } from './components/AddDivisionForm';
import { useStore } from '../../store/Store';

type DivisionRecord = {
  id?: number;
  division_letter?: string;
  char?: string;
  created_at?: string;
  updated_at?: string;
};

type DivisionRow = {
  id: number;
  letter: string;

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

const divisionColumns: GridColDef[] = [
  { field: 'id', headerName: 'ID', width: 80 },
  { field: 'letter', headerName: 'División', width: 140 },
  {
    field: 'created_at',
    headerName: 'Creado',
    flex: 1,
    minWidth: 120,
    valueFormatter: (params: any) =>
      formatDate((params?.value as string | undefined) ?? undefined),
  },
  {
    field: 'updated_at',
    headerName: 'Actualizado',
    flex: 1,
    minWidth: 120,
    valueFormatter: (params: any) =>
      formatDate((params?.value as string | undefined) ?? undefined),
  },
];

export const ControlDivisions = () => {
  const { data, isError, refetch } = useQuery({
    queryKey: ['divisions'],
    queryFn: getDivisions,
    staleTime: 60_000,
  });
  const [searchValue, setSearchValue] = useState('');
  const debouncedSearch = useDebouncedValue(searchValue, 750);
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedRow, setSelectedRow] = useState<DivisionRow | null>(null);
  const queryClient = useQueryClient();
  const openDialog = useStore((s) => s.openDialog);

  const divisions = useMemo<DivisionRecord[]>(() => {
    if (!data) return [];
    if (Array.isArray(data)) return data as DivisionRecord[];
    if (Array.isArray((data as Record<string, unknown>)?.divisions)) {
      return (data as Record<string, DivisionRecord[]>).divisions ?? [];
    }
    if (Array.isArray((data as Record<string, unknown>)?.data)) {
      return (data as Record<string, DivisionRecord[]>).data ?? [];
    }
    return [];
  }, [data]);

  const rows = useMemo<DivisionRow[]>(() => {
    return divisions.map((division, index) => ({
      id: division.id ?? index,
      letter: division.division_letter ?? '—',
      created_at: division.created_at,
      updated_at: division.updated_at,
    }));
  }, [divisions]);

  const normalizedSearch = debouncedSearch.trim().toLowerCase();
  const filteredRows = useMemo(() => {
    if (!normalizedSearch) return rows;
    return rows.filter((row) => {
      const candidates = [row.letter, row.id];
      return candidates.some((value) =>
        String(value ?? '')
          .toLowerCase()
          .includes(normalizedSearch)
      );
    });
  }, [rows, normalizedSearch]);

  const deleteDivisionMutation = useMutation({
    mutationFn: (payload: number[]) => delDivisions(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['divisions'] });
      await queryClient.invalidateQueries({ queryKey: ['classrooms'] });
    },
  });

  const handleCellClick = useCallback(
    (params: GridCellParams, event: MouseEvent<HTMLElement>) => {
      event.preventDefault();
      setSelectedRow(params.row as DivisionRow);
      setMenuAnchorEl(event.currentTarget);
    },
    []
  );

  const handleMenuClose = () => setMenuAnchorEl(null);

  const handleOpenAddDivision = () => {
    openDialog(<AddDivisionForm />, 'Añadir división', {
      width: 420,
      height: 320,
    });
  };

  const handleDeleteDivision = async () => {
    if (!selectedRow?.id) return;
    const confirmed = window.confirm(
      `¿Eliminar la división "${selectedRow.letter}"? Esta acción no se puede deshacer.`
    );
    if (!confirmed) {
      handleMenuClose();
      return;
    }
    try {
      await deleteDivisionMutation.mutateAsync([Number(selectedRow.id)]);
    } catch (error) {
      console.error('Error deleting division', error);
    } finally {
      handleMenuClose();
    }
  };

  return (
    <Box sx={{ paddingLeft: 2 }}>
      <Stack spacing={2}>
        <Typography variant='h5'>Divisiones</Typography>
        <Typography variant='body2' color='text.secondary'>
          Gestiona las divisiones disponibles para los cursos del sistema.
        </Typography>
        <SearchActionBar
          value={searchValue}
          onChange={setSearchValue}
          placeholder='Buscar por letra o ID'
          actions={
            <>
              <Button
                variant='contained'
                startIcon={<AddIcon />}
                onClick={handleOpenAddDivision}
              >
                Añadir división
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
            No pudimos cargar las divisiones. Intenta nuevamente.
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
              columns={divisionColumns}
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
            onClick={handleDeleteDivision}
            sx={{ color: 'error.main' }}
            disabled={deleteDivisionMutation.isPending}
          >
            Eliminar
          </MenuItem>
        </Menu>
      </Stack>
    </Box>
  );
};
