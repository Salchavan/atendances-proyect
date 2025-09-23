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
import { DynamicGraph } from '../components/DynamicGraph/DynamicGraph.tsx';
import { BoxNull } from '../components/BoxNull.tsx';
import { changePageTitle } from '../Logic.ts';

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
    <Box className='col-span-8 row-span-9 p-4 grid grid-cols-2 grid-rows-2 gap-2'>
      <Box className='col-start-1'>
        <Box className='flex flex-row items-center '>
          <Typography variant='h4' fontWeight='bold'>
            Perfil de {displayName || fallback}
          </Typography>
          <Box display='flex' gap={1} flexWrap='wrap' className='ml-2'>
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
        {selectedUser && (
          <Box className='flex flex-col'>
            <Grid container spacing={2}>
              {field('Nombre', displayName, false)}
              {field('Email', selectedUser?.email, true)}
              {field('Rol', selectedUser?.rol, false)}
              {field('ID', selectedUser?.id, true)}
              {field('DNI', selectedUser?.DNI, true)}
              {field('Email', selectedUser?.email, true)}
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
      <DynamicGraph
        dataTableName={`Datos de ${displayName || 'Usuario'}`}
        initialAssignedDate={null}
        grid='row-start-2'
        toolbarEnabled={true}
      />
      <BoxNull className='col-start-2 row-start-1' />
      <BoxNull className='col-start-2 row-start-2' />
    </Box>
  );
};
