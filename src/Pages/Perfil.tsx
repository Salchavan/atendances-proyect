import { useEffect } from 'react';
import { useStore } from '../Store/Store.ts';
import {
  Box,
  Typography,
  Grid,
  Divider,
  Chip,
  Tooltip,
  IconButton,
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';

const fallback = 'NO Definido';

interface PerfilUser {
  Username: string;
  Password?: string;
  Area?: string;
  ID?: string | number;
  DNI?: string | number;
  Email?: string;
  Role?: string;
  Active?: boolean;
}

export const Perfil = () => {
  const selectedUser = useStore((s) => s.perfilUserSelected) as
    | PerfilUser
    | undefined;

  useEffect(() => {
    document.title = `Perfil - ${selectedUser?.Username || 'Usuario'}`;
  }, [selectedUser]);

  const copyToClipboard = (value?: string | number) => {
    if (!value) return;
    navigator.clipboard?.writeText(String(value)).catch(() => {});
  };

  const field = (label: string, value?: string | number, copy?: boolean) => (
    <Grid>
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
    </Grid>
  );

  return (
    <Box className='col-span-4 row-span-9 p-4'>
      <Box className='flex flex-row items-center '>
        <Typography variant='h4' fontWeight='bold'>
          Perfil de {selectedUser?.Username || fallback}
        </Typography>
        <Box display='flex' gap={1} flexWrap='wrap' className='ml-2'>
          <Chip
            label={selectedUser?.Area || 'SIN ROL'}
            color='primary'
            variant='outlined'
          />
          {selectedUser?.Active === false && (
            <Chip label='INACTIVO' color='error' variant='filled' />
          )}
        </Box>
      </Box>

      {selectedUser && (
        <Box className='flex flex-col'>
          <Grid container spacing={2}>
            {field('Username', selectedUser?.Username, true)}
            {field('Área', selectedUser?.Area, false)}
            {field('ID', selectedUser?.ID, true)}
            {field('DNI', selectedUser?.DNI, true)}
            {field('Email', selectedUser?.Email, true)}
          </Grid>
          <Divider sx={{ my: 2 }} />
        </Box>
      )}

      {!selectedUser && (
        <Typography variant='body2' color='text.secondary'>
          No hay un usuario seleccionado actualmente.
        </Typography>
      )}
    </Box>
  );
};
