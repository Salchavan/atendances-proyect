import { useStore } from '../store/Store.ts';
import { useRef, useState } from 'react';
import {
  Box,
  Typography,
  Chip,
  Tooltip,
  IconButton,
  Paper,
  TextField,
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { DynamicGraph } from '../components/DynamicGraph/DynamicGraph.tsx';
import { changePageTitle } from '../Logic.ts';
import EditIcon from '@mui/icons-material/Edit';

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
  const [notes, setNotes] = useState<string>('');
  const notesRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null);
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
        <Paper
          variant='outlined'
          sx={{
            p: 2,
            overflow: 'auto',
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            minHeight: 0,
          }}
          onClick={() => notesRef.current?.focus()}
        >
          <Typography variant='h6' gutterBottom>
            Notas y Observaciones
          </Typography>
          <IconButton
            size='small'
            sx={{ position: 'absolute', top: 8, right: 8 }}
            onClick={(e) => e.stopPropagation()}
          >
            <Tooltip title='Editar Notas'>
              <EditIcon fontSize='inherit' sx={{ color: 'primary.main' }} />
            </Tooltip>
          </IconButton>
          <TextField
            inputRef={notesRef}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder='Escribe tus notas aquí...'
            variant='outlined'
            fullWidth
            multiline
            minRows={3}
            sx={{
              mt: 1,
              flex: 1,
              minHeight: 0,
              display: 'flex',
              '& .MuiInputBase-root': {
                height: '100%',
                alignItems: 'stretch',
              },
              '& .MuiInputBase-inputMultiline': {
                height: '100%',
                overflow: 'auto',
              },
              '& textarea': {
                height: '100% !important',
                resize: 'none',
              },
            }}
          />
        </Paper>
      </Box>

      {/* Otras 2 columnas: gráfico ocupa ambas columnas y todo el alto */}
      <Box
        sx={{ gridColumn: '2 / 4', gridRow: '1', height: '100%', minHeight: 0 }}
      >
        <Paper
          variant='outlined'
          sx={{
            p: 2,
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            minHeight: 0,
          }}
        >
          <Box sx={{ flex: 1, minHeight: 0 }}>
            <DynamicGraph
              graphName={`Actividad de ${displayName || 'Usuario'}`}
              initialAssignedDate={null}
              toolbarEnabled={true}
              grid=''
            />
          </Box>
        </Paper>
      </Box>
    </Box>
  );
};
