import { useStore } from '../store/Store';

import {
  Box,
  Typography,
  Chip,
  Tooltip,
  IconButton,
  Paper,
  ListItem,
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { MultiChart } from '../components/MultiChart/MultiChart.tsx';
import { Notes } from '../components/Notes.tsx';
import { changePageTitle } from '../Logic.ts';
import EditIcon from '@mui/icons-material/Edit';
import { ProfileSettingsModal } from '../components/ProfileSettingsModal';
import React from 'react';
import { List } from 'rsuite';

const fallback = 'NO Definido';

interface PerfilUser {
  // new schema
  id?: number | string;
  dni?: string | number;
  role?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  rol?: string;
}

export const Profile = () => {
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
    // try to resolve full user from Users.json when activity missing
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

  const fullName = [selectedUser?.first_name, selectedUser?.last_name]
    .filter(Boolean)
    .join(' ');
  const displayName = fullName || selectedUser?.first_name || 'Usuario';
  changePageTitle(`Perfil - ${displayName}`);

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

  return (
    <Box
      sx={{
        p: 2,
        height: '100%',
        minHeight: 0,
        gridColumn: '1 / -1', // ocupar todas las columnas del grid padre (8)
        gridRow: '1 / -1', // ocupar todas las filas del grid padre (9)
        display: 'grid',
        gridTemplateColumns: '1fr 1fr 1fr', // 3 columnas como solicitaste
        gap: 2,
      }}
    >
      {/* Columna izquierda: 3 filas, 1 columna */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateRows: '1fr 1fr 1fr',
          gap: 2,
          minHeight: 0,
        }}
      >
        {/* Datos principales ocupan 2 filas */}
        <Paper
          variant='outlined'
          sx={{
            p: 2,
            gridRow: '1 / span 2',
            display: 'flex',
            flexDirection: 'column',
            minHeight: 0,
            overflow: 'auto',
          }}
        >
          <Box display='flex' alignItems='center' gap={2}>
            <Typography
              variant='h4'
              fontWeight='bold'
              sx={{ fontSize: '1.5rem !important' }}
            >
              {displayName || fallback}
            </Typography>
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
            <Box display='flex' gap={1} flexWrap='wrap'>
              {/* Mostrar rol especificado o 'STUDENT' por defecto. Preferir resolvedUser cuando esté disponible */}
              {(() => {
                const resolvedRole =
                  (resolvedUser as any)?.role ??
                  (selectedUser as any)?.role ??
                  'STUDENT';
                return (
                  <Chip
                    label={String(resolvedRole)}
                    color='primary'
                    variant='outlined'
                  />
                );
              })()}
            </Box>
          </Box>
          <List>
            {selectedUser ? (
              <ListItem
                sx={{
                  display: 'flex',
                  gridTemplateColumns: {
                    xs: '1fr',
                    sm: '1fr 1fr',
                    flexDirection: 'column',
                    justifyContent: 'start',
                    alignItems: 'start',
                  },
                  gap: 2,
                }}
              >
                {field('Nombre', displayName, false)}
                {field('Email', (resolvedUser ?? selectedUser)?.email, true)}
                {field(
                  'Rol',
                  ((resolvedUser as any)?.role ??
                    (selectedUser as any)?.role ??
                    (selectedUser as any)?.rol ??
                    (selectedUser as any)?.Role) ||
                    'STUDENT',
                  false
                )}
                {field('ID', (resolvedUser ?? selectedUser)?.id, true)}
                {field('DNI', (resolvedUser ?? selectedUser)?.dni, true)}
                {/* New summary field: total absences for students, total contributions for users. Prefer resolvedUser when available */}
                {(() => {
                  const su = (resolvedUser ?? selectedUser) as any;
                  const hasRole = su && (su.role || su.Role || su.rol);
                  if (hasRole) {
                    const contribs = Array.isArray(su.activity)
                      ? su.activity.length
                      : 0;
                    return field('Contribuciones totales', contribs, false);
                  } else {
                    const abs = Array.isArray(su?.unassistences)
                      ? su.unassistences.length
                      : 0;
                    return field('Faltas totales', abs, false);
                  }
                })()}
              </ListItem>
            ) : (
              <Typography variant='body2' color='text.secondary'>
                No hay un usuario seleccionado actualmente.
              </Typography>
            )}
          </List>
        </Paper>

        {/* Notas ocupan 1 fila */}
        <Notes />
      </Box>

      {/* Otras 2 columnas: gráfico ocupa ambas columnas y todo el alto */}
      <Box
        sx={{ gridColumn: '2 / 4', gridRow: '1', height: '100%', minHeight: 0 }}
      >
        <MultiChart
          title={`Actividad de ${displayName || 'Usuario'}`}
          toolbarEnabled={true}
          grid=''
          selectedUser={resolvedUser ?? selectedUser}
        />
      </Box>
    </Box>
  );
};
