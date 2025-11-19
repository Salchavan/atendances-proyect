import { useStore } from '../store/Store.ts';

import {
  Box,
  Typography,
  Chip,
  Tooltip,
  IconButton,
  Paper,
  Stack,
  Button,
  Divider,
} from '@mui/material';
import {
  DataGrid,
  type GridColDef,
  type GridRowParams,
  type GridRowSelectionModel,
  type GridRowId,
} from '@mui/x-data-grid';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { MultiChart } from '../components/MultiChart/MultiChart.tsx';
import { Notes } from '../components/Notes.tsx';
import { changePageTitle } from '../Logic.ts';
import EditIcon from '@mui/icons-material/Edit';
import { ProfileSettingsModal } from '../components/ProfileSettingsModal.tsx';
import React from 'react';

const fallback = 'NO Definido';

interface PerfilUser {
  id?: number | string;
  dni?: string | number;
  role?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  rol?: string;
}

type ActivityEntry = {
  action?: string;
  type?: string;
  date?: string;
  day?: string;
  timestamp?: string;
  [key: string]: any;
};

const formatActionDate = (value?: string) => {
  if (!value) return 'Sin fecha';
  const isoCandidate = Date.parse(value);
  if (!Number.isNaN(isoCandidate)) {
    const d = new Date(isoCandidate);
    return d.toLocaleString('es-AR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }
  const parts = value.split('-');
  if (parts.length === 3) {
    const [dd, mm, yy] = parts.map((p) => Number(p));
    if (dd && mm) {
      const year = yy >= 100 ? yy : 2000 + yy;
      const d = new Date(year, mm - 1, dd);
      if (!Number.isNaN(d.getTime()))
        return d.toLocaleDateString('es-AR', {
          weekday: 'short',
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        });
    }
  }
  return value;
};

export const UserProfile = () => {
  const selectedUser = useStore((s) => s.perfilUserSelected) as
    | PerfilUser
    | undefined;

  const [resolvedUser, setResolvedUser] = React.useState<any | null>(null);

  React.useEffect(() => {
    let mounted = true;
    const su = selectedUser as any;
    if (!su) {
      setResolvedUser(null);
      return;
    }
    const hasActivity = Array.isArray(su.activity) && su.activity.length > 0;
    if (hasActivity) {
      setResolvedUser(su);
      return;
    }
    (async () => {
      try {
        const mod = await import('../data/users.json');
        const all: any[] = mod.default || mod || [];
        const id = su.id ?? su.ID ?? null;
        const dni = su.dni ?? su.DNI ?? null;
        let found = null as any | null;
        if (id != null)
          found = all.find(
            (x) => String(x.id) === String(id) || String(x.ID) === String(id)
          );
        if (!found && dni != null)
          found = all.find(
            (x) =>
              String(x.dni) === String(dni) || String(x.DNI) === String(dni)
          );
        if (!found) {
          const nameCandidate = `${su.first_name ?? ''}`.trim();
          if (nameCandidate)
            found = all.find(
              (x) => String(x.first_name ?? '').trim() === nameCandidate
            );
        }
        if (mounted) setResolvedUser(found || su);
      } catch (e) {
        if (mounted) setResolvedUser(su);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [selectedUser]);

  const staffUser = (resolvedUser ?? selectedUser) as any | null;
  const nameParts = [
    staffUser?.first_name ?? staffUser?.firstName,
    staffUser?.last_name ?? staffUser?.lastName,
  ].filter(Boolean);
  const displayName =
    nameParts.join(' ').trim() || staffUser?.first_name || 'Usuario';
  changePageTitle(`Perfil del staff - ${displayName}`);

  const roleLabelRaw =
    staffUser?.role ?? staffUser?.Role ?? staffUser?.rol ?? 'STAFF';
  const normalizedRole = String(roleLabelRaw).toUpperCase();
  const looksLikeStudent =
    normalizedRole === 'STUDENT' ||
    (!normalizedRole && Array.isArray(staffUser?.unassistences));

  const copyToClipboard = (value?: string | number) => {
    if (!value) return;
    navigator.clipboard?.writeText(String(value)).catch(() => {});
  };
  const openDialog = useStore((s) => s.openDialog);

  const field = (label: string, value?: string | number, copy?: boolean) => (
    <Box display='flex' alignItems='center' gap={1}>
      <Box>
        <Typography variant='caption' color='text.secondary'>
          {label}
        </Typography>
        <Typography variant='body1' fontWeight={500}>
          {value ?? fallback}
        </Typography>
      </Box>
      {copy && value && (
        <Tooltip title={`Copiar ${label}`}>
          <IconButton size='small' onClick={() => copyToClipboard(value)}>
            <ContentCopyIcon fontSize='inherit' />
          </IconButton>
        </Tooltip>
      )}
    </Box>
  );

  if (!staffUser || looksLikeStudent) {
    return (
      <Box
        sx={{
          p: 4,
          height: '100%',
          gridColumn: '1 / -1',
          gridRow: '1 / -1',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Paper sx={{ p: 4, maxWidth: 480, textAlign: 'center' }}>
          <Typography variant='h6' gutterBottom>
            Selecciona un preceptor o miembro del staff
          </Typography>
          <Typography color='text.secondary'>
            Usa la tabla de usuarios o el menú lateral para elegir un perfil del
            personal.
          </Typography>
        </Paper>
      </Box>
    );
  }

  const activity: ActivityEntry[] = Array.isArray(staffUser.activity)
    ? staffUser.activity
    : Array.isArray(staffUser.Activity)
    ? staffUser.Activity
    : Array.isArray(staffUser.actions)
    ? staffUser.actions
    : [];

  const totalActions = activity.length;

  const handleOpenActivityModal = () => {
    if (!activity.length) return;
    openDialog(
      React.createElement(ActivityModal, {
        actions: activity,
        displayName,
      }),
      `Actividad de ${displayName}`,
      'big'
    );
  };

  return (
    <Box
      sx={{
        p: 2,
        height: '100%',
        minHeight: 0,
        gridColumn: '1 / -1',
        gridRow: '1 / -1',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr 1fr',
        gap: 2,
      }}
    >
      <Box
        sx={{
          display: 'grid',
          gridTemplateRows: 'minmax(auto, 45vh) minmax(0, 1fr)',
          gap: 2,
          minHeight: 0,
        }}
      >
        <Paper
          variant='outlined'
          sx={{
            p: 2,
            display: 'flex',
            flexDirection: 'column',
            minHeight: 0,
            maxHeight: { lg: '52vh', md: '48vh', xs: 'none' },
            overflow: 'auto',
          }}
        >
          <Box display='flex' alignItems='center' gap={2} flexWrap='wrap'>
            <Typography
              variant='h4'
              fontWeight='bold'
              sx={{ fontSize: '1.5rem !important' }}
            >
              {displayName}
            </Typography>
            <Chip
              label={normalizedRole || 'STAFF'}
              color='primary'
              variant='outlined'
            />
            <Tooltip title='Editar perfil'>
              <IconButton
                size='small'
                onClick={() =>
                  openDialog(
                    React.createElement(ProfileSettingsModal),
                    'Opciones de perfil',
                    'small'
                  )
                }
              >
                <EditIcon sx={{ color: 'primary.main' }} />
              </IconButton>
            </Tooltip>
          </Box>

          <Stack spacing={2} sx={{ mt: 2 }}>
            {field('Nombre completo', displayName)}
            {field('Email', staffUser.email ?? staffUser.Email, true)}
            {field('ID', staffUser.id ?? staffUser.ID, true)}
            {field('DNI', staffUser.dni ?? staffUser.DNI, true)}
            {field('Acciones registradas', totalActions, false)}
          </Stack>
        </Paper>

        <Notes />
      </Box>

      <Box
        sx={{
          gridColumn: '2 / 4',
          gridRow: '1 / span 1',
          display: 'grid',
          gridTemplateRows: '1fr auto',
          gap: 2,
          minHeight: 0,
        }}
      >
        <Box sx={{ minHeight: 0 }}>
          <MultiChart
            title={`Actividad de ${displayName}`}
            toolbarEnabled
            grid=''
            selectedUser={staffUser}
            disableTableOnClick
          />
        </Box>
        <Button
          variant='contained'
          size='large'
          onClick={handleOpenActivityModal}
          disabled={!activity.length}
        >
          Ver actividad
        </Button>
      </Box>
    </Box>
  );
};

type ActivityModalProps = {
  actions: ActivityEntry[];
  displayName: string;
};

const ActivityModal: React.FC<ActivityModalProps> = ({
  actions,
  displayName,
}) => {
  const [selectedAction, setSelectedAction] =
    React.useState<ActivityEntry | null>(actions[0] ?? null);
  const buildSelectionModel = React.useCallback(
    (ids: GridRowId[]): GridRowSelectionModel => ({
      type: 'include',
      ids: new Set<GridRowId>(ids),
    }),
    []
  );
  const [selectionModel, setSelectionModel] =
    React.useState<GridRowSelectionModel>(() =>
      buildSelectionModel(selectedAction ? [0] : [])
    );

  const labelForAction = React.useCallback(
    (entry?: ActivityEntry | null) =>
      entry?.action || entry?.type || 'Actividad',
    []
  );

  const dateForAction = React.useCallback(
    (entry?: ActivityEntry | null) =>
      formatActionDate(entry?.date || entry?.day || entry?.timestamp),
    []
  );

  const rows = React.useMemo(
    () =>
      actions.map((action, index) => ({
        id: index,
        actionLabel: labelForAction(action),
        dateLabel: dateForAction(action),
        raw: action,
      })),
    [actions, labelForAction, dateForAction]
  );

  React.useEffect(() => {
    if (!selectedAction && rows.length) {
      setSelectedAction(rows[0].raw);
      setSelectionModel(buildSelectionModel([rows[0].id as GridRowId]));
    }
  }, [rows, selectedAction, buildSelectionModel]);

  const detailEntries = React.useMemo(() => {
    if (!selectedAction) return [];
    return Object.entries(selectedAction).filter(
      ([key]) => !['action', 'type', 'date', 'day', 'timestamp'].includes(key)
    );
  }, [selectedAction]);

  const columns = React.useMemo<GridColDef[]>(
    () => [
      { field: 'actionLabel', headerName: 'Acción', flex: 1, minWidth: 180 },
      { field: 'dateLabel', headerName: 'Fecha', flex: 1, minWidth: 160 },
    ],
    []
  );

  const handleRowClick = (params: GridRowParams) => {
    const raw = (params.row as any).raw as ActivityEntry;
    setSelectedAction(raw);
    setSelectionModel(buildSelectionModel([params.id]));
  };

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' },
        gap: 2,
        height: '70vh',
      }}
    >
      <Paper
        variant='outlined'
        sx={{ display: 'flex', flexDirection: 'column', minHeight: 0 }}
      >
        <Typography variant='h6' sx={{ p: 2 }}>
          Acciones registradas
        </Typography>
        <Divider />
        <Box sx={{ flex: 1, minHeight: 0 }}>
          <DataGrid
            rows={rows}
            columns={columns}
            checkboxSelection={false}
            disableColumnMenu
            disableRowSelectionOnClick
            onRowClick={handleRowClick}
            rowSelectionModel={selectionModel}
            sx={{
              height: '100%',
              border: 0,
              '& .MuiDataGrid-columnHeaders': {
                fontWeight: 600,
              },
            }}
          />
        </Box>
      </Paper>

      <Paper
        variant='outlined'
        sx={{ p: 2, display: 'flex', flexDirection: 'column', minHeight: 0 }}
      >
        <Typography variant='h6' gutterBottom>
          Detalles
        </Typography>
        {selectedAction ? (
          <Stack spacing={1.5} sx={{ overflowY: 'auto' }}>
            <Box>
              <Typography variant='subtitle2' color='text.secondary'>
                Acción
              </Typography>
              <Typography variant='body1' fontWeight={600}>
                {labelForAction(selectedAction)}
              </Typography>
            </Box>
            <Box>
              <Typography variant='subtitle2' color='text.secondary'>
                Fecha
              </Typography>
              <Typography variant='body1'>
                {dateForAction(selectedAction)}
              </Typography>
            </Box>
            {!!detailEntries.length && <Divider />}
            {detailEntries.map(([key, value]) => (
              <Box key={key}>
                <Typography variant='subtitle2' color='text.secondary'>
                  {key}
                </Typography>
                <Typography variant='body1'>
                  {typeof value === 'object'
                    ? JSON.stringify(value)
                    : String(value ?? '-')}
                </Typography>
              </Box>
            ))}
          </Stack>
        ) : (
          <Typography variant='body2' color='text.secondary'>
            Selecciona una acción de la tabla para ver sus detalles.
          </Typography>
        )}
        <Box sx={{ mt: 'auto', pt: 2 }}>
          <Typography variant='caption' color='text.secondary'>
            {displayName}
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};
