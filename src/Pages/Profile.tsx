import { useStore } from '../store/Store';

import {
  Box,
  Typography,
  Chip,
  Tooltip,
  IconButton,
  Paper,
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { DynamicGraph } from '../components/DynamicGraph/DynamicGraph.tsx';
import { Notes } from '../components/Notes.tsx';
import { changePageTitle } from '../Logic.ts';
import EditIcon from '@mui/icons-material/Edit';
import { ProfileSettingsModal } from '../components/ProfileSettingsModal';
import React from 'react';

const fallback = 'NO Definido';

interface PerfilUser {
  // new schema
  id?: number | string;
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
  rol?: string;
  // legacy fields
  Username?: string;
  Area?: string;
  ID?: string | number;
  DNI?: string | number;
  Role?: string;
  Active?: boolean;
}

export const Profile = () => {
  const selectedUser = useStore((s) => s.perfilUserSelected) as
    | PerfilUser
    | undefined;

  const fullName = [selectedUser?.firstName, selectedUser?.lastName]
    .filter(Boolean)
    .join(' ');
  const displayName = fullName || selectedUser?.Username || 'Usuario';
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
            <Typography variant='h4' fontWeight='bold'>
              Perfil de {displayName || fallback}
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
              <Chip
                label={
                  typeof selectedUser?.rol === 'number'
                    ? `Rol ${selectedUser.rol}`
                    : selectedUser?.Area || 'SIN ROL'
                }
                color='primary'
                variant='outlined'
              />
              {selectedUser?.Active === false && (
                <Chip label='INACTIVO' color='error' variant='filled' />
              )}
            </Box>
          </Box>
          <Box sx={{ mt: 2 }}>
            {selectedUser ? (
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                  gap: 2,
                }}
              >
                {field('Nombre', displayName, false)}
                {field('Email', selectedUser?.email, true)}
                {field('Rol', selectedUser?.rol, false)}
                {field('ID', selectedUser?.id, true)}
                {field('DNI', selectedUser?.DNI, true)}
              </Box>
            ) : (
              <Typography variant='body2' color='text.secondary'>
                No hay un usuario seleccionado actualmente.
              </Typography>
            )}
          </Box>
        </Paper>

        {/* Notas ocupan 1 fila */}
        <Notes />
      </Box>

      {/* Otras 2 columnas: gráfico ocupa ambas columnas y todo el alto */}
      <Box
        sx={{ gridColumn: '2 / 4', gridRow: '1', height: '100%', minHeight: 0 }}
      >
        <DynamicGraph
          graphName={`Actividad de ${displayName || 'Usuario'}`}
          initialAssignedDate={null}
          toolbarEnabled={true}
          grid=''
        />
      </Box>
    </Box>
  );
};
