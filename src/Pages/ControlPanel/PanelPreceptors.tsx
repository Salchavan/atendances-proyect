import { Stack, Typography, Button, Divider, Box } from '@mui/material';
import GroupsIcon from '@mui/icons-material/Groups';

export const PanelPreceptors = () => {
  return (
    <Box sx={{ paddingLeft: 2 }}>
      <Stack spacing={2}>
        <Typography variant='h5'>Preceptores</Typography>
        <Typography variant='body2' color='text.secondary'>
          Gestiona los preceptores del sistema. (UI decorativa)
        </Typography>
        <Stack direction='row' spacing={1}>
          <Button variant='contained' startIcon={<GroupsIcon />} disabled>
            Añadir preceptor
          </Button>
          <Button variant='outlined' disabled>
            Importar lista
          </Button>
        </Stack>
        <Divider />
        <Typography variant='body2' color='text.secondary'>
          Aquí podría ir una tabla con preceptores.
        </Typography>
      </Stack>
    </Box>
  );
};
