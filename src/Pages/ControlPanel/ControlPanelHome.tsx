import { Box, Stack, Typography, Paper } from '@mui/material';

export const ControlPanelHome = () => {
  return (
    <Box sx={{ paddingLeft: 2 }}>
      <Stack spacing={3}>
        <Stack spacing={1}>
          <Typography variant='h4'>Panel de control</Typography>
          <Typography variant='body1' color='text.secondary'>
            Esta sección concentra las herramientas administrativas para
            mantener actualizados los datos de estudiantes, cursos y catálogos
            académicos. Usa el menú lateral o los accesos rápidos para abrir
            cada módulo y realizar altas, bajas o ediciones sin salir de la
            vista.
          </Typography>
        </Stack>

        <Paper sx={{ p: 3 }} elevation={0} variant='outlined'>
          <Typography variant='subtitle1'>Consejos de uso</Typography>
          <Typography variant='body2' color='text.secondary'>
            - Actualiza el listado con el botón “Actualizar” después de crear o
            eliminar registros. - Usa la barra de búsqueda con debounce
            incorporado para encontrar rápidamente un curso o estudiante. - Las
            acciones disponibles en cada tabla aparecen al hacer clic sobre la
            fila.
          </Typography>
        </Paper>
      </Stack>
    </Box>
  );
};
