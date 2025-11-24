import {
  useMemo,
  useState,
  useCallback,
  type FormEvent,
  type MouseEvent,
  type ChangeEvent,
} from 'react';
import {
  Stack,
  Typography,
  Button,
  Divider,
  Box,
  Alert,
  Menu,
  MenuItem,
  TextField,
  FormControl,
  InputLabel,
  Select,
  ListItemIcon,
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material/Select';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import RefreshIcon from '@mui/icons-material/Refresh';
import EditIcon from '@mui/icons-material/Edit';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import DeleteIcon from '@mui/icons-material/Delete';
import {
  DataGrid,
  type GridColDef,
  type GridCellParams,
} from '@mui/x-data-grid';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { getStaff, postStaff, putStaff, delStaff } from '../../api/client';
import { useStore } from '../../store/Store';
import { useCachedStore } from '../../store/CachedStore';
import { useDebouncedValue } from '../../hooks/useDebouncedValue';
import { SearchActionBar } from './components/SearchActionBar';

const ROLE_FILTER = 'STAFF';

const roleOptions = [
  { label: 'Administrador', value: 'ADMIN' },
  { label: 'Staff', value: 'STAFF' },
  { label: 'Preceptor', value: 'PRECEPTOR' },
];

const formatRoleLabel = (value: string | number | undefined) => {
  if (!value) return '—';
  const match = roleOptions.find(
    (option) => option.value.toString() === value.toString()
  );
  return match?.label ?? String(value);
};

const staffColumns: GridColDef[] = [
  { field: 'id', headerName: 'DNI', width: 110 },
  { field: 'first_name', headerName: 'Nombre', flex: 1, minWidth: 140 },
  { field: 'last_name', headerName: 'Apellido', flex: 1, minWidth: 140 },
  { field: 'role', headerName: 'Rol', width: 140 },
];

type StaffRecord = {
  id?: number | string;
  dni?: string;
  first_name?: string;
  last_name?: string;
  role?: string | number;
};

const extractStaffArray = (payload: unknown): StaffRecord[] => {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload as StaffRecord[];
  const source = payload as Record<string, unknown>;
  const candidateKeys = ['staff', 'data', 'items', 'results'];
  for (const key of candidateKeys) {
    const maybeArray = source[key];
    if (Array.isArray(maybeArray)) return maybeArray as StaffRecord[];
  }
  return [];
};

export const ControlSecretary = () => {
  const [searchValue, setSearchValue] = useState('');
  const debouncedSearch = useDebouncedValue(searchValue, 500);
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedRow, setSelectedRow] = useState<StaffRecord | null>(null);
  const openDialog = useStore((s) => s.openDialog);
  const closeDialog = useStore((s) => s.closeDialog);
  const queryClient = useQueryClient();
  const setAlert = useCachedStore((s) => s.setAlert);

  const staffQuery = useQuery({
    queryKey: ['staff', ROLE_FILTER, debouncedSearch],
    queryFn: () =>
      getStaff({
        page: 1,
        pageSize: 100,
        role: ROLE_FILTER,
        q: debouncedSearch || undefined,
      }),
  });

  const staffRows = useMemo(() => {
    const records = extractStaffArray(staffQuery.data);
    return records
      .filter(
        (record) => String(record.role ?? '').toUpperCase() === ROLE_FILTER
      )
      .map((record, index) => ({
        id: record.id ?? record.dni ?? index,
        dni: record.dni ?? String(record.id ?? ''),
        first_name: record.first_name ?? '—',
        last_name: record.last_name ?? '—',
        role: formatRoleLabel(record.role ?? ROLE_FILTER),
        raw: record,
      }));
  }, [staffQuery.data]);

  const handleCellClick = useCallback(
    (params: GridCellParams, event: MouseEvent<HTMLElement>) => {
      event.preventDefault();
      setSelectedRow((params.row as { raw?: StaffRecord })?.raw ?? null);
      setMenuAnchorEl(event.currentTarget);
    },
    []
  );

  const invalidateStaff = async () => {
    await queryClient.invalidateQueries({ queryKey: ['staff'] });
  };

  const createMutation = useMutation({
    mutationFn: postStaff,
    onSuccess: async (response: any) => {
      await invalidateStaff();
      const message =
        response?.message ?? 'Miembro de secretaría creado correctamente.';
      setAlert({ type: 'success', text: message });
    },
    onError: (error: unknown) => {
      console.error('Error creating staff member', error);
      setAlert({
        type: 'error',
        text: 'No pudimos crear el registro. Intenta nuevamente.',
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string | number;
      payload: Partial<StaffRecord> & { role?: string | number };
    }) =>
      putStaff(id, {
        first_name: payload.first_name,
        last_name: payload.last_name,
        role: payload.role,
      }),
    onSuccess: async (response: any) => {
      await invalidateStaff();
      const message =
        response?.message ?? 'Registro actualizado correctamente.';
      setAlert({ type: 'success', text: message });
    },
    onError: (error: unknown) => {
      console.error('Error updating staff member', error);
      setAlert({
        type: 'error',
        text: 'No pudimos actualizar el registro. Intenta nuevamente.',
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string | number) => delStaff(id),
    onSuccess: async (response: any) => {
      await invalidateStaff();
      const message = response?.message ?? 'Registro eliminado correctamente.';
      setAlert({ type: 'success', text: message });
    },
    onError: (error: unknown) => {
      console.error('Error deleting staff member', error);
      setAlert({
        type: 'error',
        text: 'No pudimos eliminar el registro. Intenta nuevamente.',
      });
    },
  });

  const handleOpenCreate = () => {
    openDialog(
      <CreateStaffForm
        onSubmit={async (values) => {
          await createMutation.mutateAsync(values);
          closeDialog();
        }}
        onCancel={closeDialog}
      />,
      'Nuevo registro de secretaría',
      { width: 420, height: 480 }
    );
  };

  const resolveIdentifier = (record: StaffRecord | null) => {
    if (!record) return undefined;
    return record.id ?? record.dni;
  };

  const handleOpenEdit = () => {
    const identifier = resolveIdentifier(selectedRow);
    if (!selectedRow || identifier === undefined) return;
    openDialog(
      <EditStaffForm
        staff={selectedRow}
        onSubmit={async (values) => {
          await updateMutation.mutateAsync({ id: identifier, payload: values });
          closeDialog();
        }}
        onCancel={closeDialog}
      />,
      'Editar registro',
      { width: 420, height: 420 }
    );
  };

  const handleDelete = async () => {
    const identifier = resolveIdentifier(selectedRow);
    if (identifier === undefined || !selectedRow) return;
    const confirmed = window.confirm(
      `¿Eliminar al miembro del staff ${selectedRow.first_name ?? ''} ${
        selectedRow.last_name ?? ''
      }?`
    );
    if (!confirmed) {
      setMenuAnchorEl(null);
      return;
    }
    try {
      await deleteMutation.mutateAsync(identifier);
    } catch (error) {
      console.error('Error deleting staff', error);
    } finally {
      setMenuAnchorEl(null);
    }
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
  };

  const refetch = () => {
    void staffQuery.refetch();
  };

  return (
    <Box sx={{ paddingLeft: 2 }}>
      <Stack spacing={2}>
        <Typography variant='h5'>Secretaría</Typography>
        <Typography variant='body2' color='text.secondary'>
          Gestiona las cuentas con rol STAFF encargadas de la secretaría.
        </Typography>
        <SearchActionBar
          value={searchValue}
          onChange={setSearchValue}
          placeholder='Buscar por nombre, apellido o DNI'
          actions={
            <>
              <Button
                variant='contained'
                startIcon={<PersonAddIcon />}
                onClick={handleOpenCreate}
              >
                Nuevo staff
              </Button>
              <Button
                variant='text'
                startIcon={<RefreshIcon />}
                onClick={refetch}
                disabled={staffQuery.isLoading}
              >
                Actualizar
              </Button>
            </>
          }
        />
        <Divider />

        {staffQuery.isError ? (
          <Alert
            severity='error'
            action={
              <Button color='inherit' onClick={refetch}>
                Reintentar
              </Button>
            }
          >
            No pudimos cargar los registros de secretaría.
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
              rows={staffRows}
              columns={staffColumns}
              loading={staffQuery.isLoading}
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
          <MenuItem onClick={handleOpenEdit}>
            <ListItemIcon>
              <EditIcon fontSize='small' />
            </ListItemIcon>
            Editar
          </MenuItem>
          <MenuItem sx={{ color: 'error.main' }} onClick={handleDelete}>
            <ListItemIcon>
              <DeleteIcon fontSize='small' />
            </ListItemIcon>
            Eliminar
          </MenuItem>
        </Menu>
      </Stack>
    </Box>
  );
};

type CreateStaffFormValues = {
  dni: string;
  password: string;
  first_name: string;
  last_name: string;
  role: string;
};

type CreateStaffFormProps = {
  onSubmit: (values: CreateStaffFormValues) => Promise<void>;
  onCancel: () => void;
};

const CreateStaffForm = ({ onSubmit, onCancel }: CreateStaffFormProps) => {
  const [formValues, setFormValues] = useState<CreateStaffFormValues>({
    dni: '',
    password: '',
    first_name: '',
    last_name: '',
    role: ROLE_FILTER,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);
    try {
      await onSubmit(formValues);
    } catch (submissionError) {
      console.error('Error creating staff member', submissionError);
      setError('No pudimos crear el registro. Intenta nuevamente.');
      return;
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateField =
    (field: keyof CreateStaffFormValues) =>
    (event: ChangeEvent<HTMLInputElement>) => {
      setFormValues((prev) => ({ ...prev, [field]: event.target.value }));
    };

  return (
    <Box component='form' onSubmit={handleSubmit} sx={{ mt: 1 }}>
      <Stack spacing={2}>
        <TextField
          label='DNI'
          value={formValues.dni}
          onChange={updateField('dni')}
          required
        />
        <TextField
          label='Contraseña'
          type='password'
          value={formValues.password}
          onChange={updateField('password')}
          required
        />
        <TextField
          label='Nombre'
          value={formValues.first_name}
          onChange={updateField('first_name')}
          required
        />
        <TextField
          label='Apellido'
          value={formValues.last_name}
          onChange={updateField('last_name')}
          required
        />
        <FormControl fullWidth>
          <InputLabel id='staff-role-label'>Rol</InputLabel>
          <Select
            labelId='staff-role-label'
            label='Rol'
            value={formValues.role}
            onChange={(event: SelectChangeEvent) =>
              setFormValues((prev) => ({ ...prev, role: event.target.value }))
            }
          >
            {roleOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        {error ? <Alert severity='error'>{error}</Alert> : null}
        <Stack direction='row' spacing={1} justifyContent='flex-end'>
          <Button onClick={onCancel} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button
            type='submit'
            variant='contained'
            startIcon={<ManageAccountsIcon />}
            disabled={isSubmitting}
          >
            Guardar
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
};

type EditStaffFormValues = {
  first_name: string;
  last_name: string;
  role: string;
};

type EditStaffFormProps = {
  staff: StaffRecord;
  onSubmit: (values: EditStaffFormValues) => Promise<void>;
  onCancel: () => void;
};

const EditStaffForm = ({ staff, onSubmit, onCancel }: EditStaffFormProps) => {
  const [formValues, setFormValues] = useState<EditStaffFormValues>({
    first_name: staff.first_name ?? '',
    last_name: staff.last_name ?? '',
    role: staff.role?.toString() ?? ROLE_FILTER,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);
    try {
      await onSubmit(formValues);
    } catch (submissionError) {
      console.error('Error updating staff member', submissionError);
      setError('No pudimos actualizar los datos. Intenta nuevamente.');
      return;
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateField =
    (field: keyof EditStaffFormValues) =>
    (event: ChangeEvent<HTMLInputElement>) => {
      setFormValues((prev) => ({ ...prev, [field]: event.target.value }));
    };

  return (
    <Box component='form' onSubmit={handleSubmit} sx={{ mt: 1 }}>
      <Stack spacing={2}>
        <TextField
          label='Nombre'
          value={formValues.first_name}
          onChange={updateField('first_name')}
          required
        />
        <TextField
          label='Apellido'
          value={formValues.last_name}
          onChange={updateField('last_name')}
          required
        />
        <FormControl fullWidth>
          <InputLabel id='staff-role-edit-label'>Rol</InputLabel>
          <Select
            labelId='staff-role-edit-label'
            label='Rol'
            value={formValues.role}
            onChange={(event: SelectChangeEvent) =>
              setFormValues((prev) => ({ ...prev, role: event.target.value }))
            }
          >
            {roleOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        {error ? <Alert severity='error'>{error}</Alert> : null}
        <Stack direction='row' spacing={1} justifyContent='flex-end'>
          <Button onClick={onCancel} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button
            type='submit'
            variant='contained'
            startIcon={<EditIcon />}
            disabled={isSubmitting}
          >
            Guardar cambios
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
};
