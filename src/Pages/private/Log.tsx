import { Box, Paper, Typography, Chip } from '@mui/material';
import { DataTable } from '../../components/DataTable/DataTable';
import ChipAcount from '../../components/ChipAcount';
import { SafeBoundary } from '../../components/SafeBoundary';
import { useStudents } from '../../hooks/useStudents';

export const Log = () => {
  const { data: students = [] } = useStudents();

  return (
    <SafeBoundary>
      <Box
        sx={{
          gridColumn: 'span 8',
          gridRow: 'span 9',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 1,
          minWidth: 0,
          minHeight: 0,
          height: '100%',
        }}
      >
        <Box sx={{ minWidth: 0, minHeight: 0, height: '100%' }}>
          <DataTable tableData={students} toolbarEnabled={false} />
        </Box>

        <Paper
          sx={{
            p: 2,
            height: '100%',
            minHeight: 0,
            overflow: 'auto',
            minWidth: 0,
          }}
        >
          <Typography variant='h4' gutterBottom>
            Detalle de la operación
          </Typography>
          <Typography variant='body2' color='text.secondary'>
            Selecciona una fila en la tabla para ver más detalles aquí. (Vista
            decorativa por ahora)
          </Typography>
          <Box sx={{ mt: 2 }}>
            <Typography variant='subtitle1'>Fecha y hora emitida</Typography>
            <Typography variant='body2' color='text.secondary'>
              --/--/----
            </Typography>

            <Typography variant='subtitle1' sx={{ mt: 1 }}>
              Acción
            </Typography>
            <Typography variant='body2' color='text.secondary'>
              ---
            </Typography>

            <Typography variant='subtitle1' sx={{ mt: 1 }}>
              Detalles
            </Typography>
            <Typography variant='body2' color='text.secondary'>
              ---
            </Typography>

            <Typography variant='subtitle1' sx={{ mt: 2 }}>
              Tipo de operacion
            </Typography>
            <Typography variant='body2' color='text.secondary'>
              ---{' '}
            </Typography>

            <Typography variant='subtitle1' sx={{ mt: 1 }}>
              Cambios
            </Typography>
            <Typography variant='body2' color='text.secondary'>
              ---{' '}
            </Typography>

            <Typography variant='subtitle1' sx={{ mt: 1 }}>
              Estado de la accion
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 0.5 }}>
              <Chip
                size='small'
                label='Pendiente'
                color='warning'
                variant='outlined'
              />
              <Chip
                size='small'
                label='Correcto'
                color='success'
                variant='outlined'
              />
              <Chip
                size='small'
                label='Error'
                color='error'
                variant='outlined'
              />
              <Chip
                size='small'
                label='Rechazada'
                color='error'
                variant='outlined'
              />
            </Box>

            <Typography variant='subtitle1' sx={{ mt: 1 }}>
              Objetivo de la accion
            </Typography>
            <Typography variant='body2' color='text.secondary'>
              ---{' '}
            </Typography>
            <Typography variant='subtitle1' sx={{ mt: 1 }}>
              ID de la operacion
            </Typography>
            <Typography variant='body2' color='text.secondary'>
              ---{' '}
            </Typography>

            <Typography variant='h6' sx={{ mt: 1 }}>
              Emitida por:
            </Typography>
            <ChipAcount />
          </Box>
        </Paper>
      </Box>
    </SafeBoundary>
  );
};
