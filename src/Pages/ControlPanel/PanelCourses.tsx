import { Stack, Typography, Button, Divider, Box } from '@mui/material';
import SchoolIcon from '@mui/icons-material/School';

export const PanelCourses = () => {
  return (
    <Box sx={{ paddingLeft: 2 }}>
      <Stack spacing={2}>
        <Typography variant='h5'>Cursos y estudiantes</Typography>
        <Typography variant='body2' color='text.secondary'>
          Agrega, edita o elimina cursos y estudiantes. (UI decorativa)
        </Typography>
        <Stack direction='row' spacing={1}>
          <Button variant='contained' startIcon={<SchoolIcon />} disabled>
            Añadir curso
          </Button>
          <Button variant='outlined' disabled>
            Añadir estudiante
          </Button>
        </Stack>
        <Divider />
        <Typography variant='body2' color='text.secondary'>
          Aquí podría ir una tabla con cursos/estudiantes.
        </Typography>
      </Stack>
    </Box>
  );
};
