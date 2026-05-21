import { Stack, Typography, Button, Box } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

export const PanelUpload = () => {
  return (
    <Box sx={{ paddingLeft: 2 }}>
      <Stack spacing={2}>
        <Typography variant='h5'>Subir datos</Typography>
        <Typography variant='body2' color='text.secondary'>
          Selecciona un archivo para subir los datos al sistema. (UI decorativa)
        </Typography>
        <Stack direction='row' spacing={1}>
          <Button variant='contained' startIcon={<CloudUploadIcon />} disabled>
            Elegir archivo
          </Button>
          <Button variant='outlined' disabled>
            Subir
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
};
