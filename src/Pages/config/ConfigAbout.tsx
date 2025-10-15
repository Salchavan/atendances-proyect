import { changePageTitle } from '../../Logic';
import { Box, Chip, Divider, Paper, Stack, Typography } from '@mui/material';

import { ChipAcount } from '../../components/ChipAcount';

type Contributor = {
  name: string;
  role: string;
  avatar?: string; // public path
};

const contributors: Contributor[] = [
  {
    name: 'Salvador Castellanos',
    role: 'Desarrollador',
    avatar: '/school_logo.jpg', // placeholder; reemplazar por /team/salvador.jpg si existe
  },
  {
    name: 'Agustin Turchetti',
    role: 'Desarrollador',
    avatar: '',
  },
  // Agrega más integrantes aquí si corresponde
];

export const ConfigAbout = () => {
  changePageTitle('Configuración - Acerca de');
  return (
    <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Typography variant='h3'>Acerca del proyecto</Typography>

      <Paper sx={{ p: 2 }}>
        <Typography variant='h6' gutterBottom>
          Objetivo y finalidad
        </Typography>
        <Typography variant='body1' color='text.secondary'>
          Sistema web para la gestión y visualización de asistencias e
          inasistencias de estudiantes. Su finalidad es facilitar el seguimiento
          diario, brindar una vista mensual clara del calendario escolar y
          ofrecer herramientas de análisis para comprender patrones de
          inasistencias (por ejemplo, justificadas vs. no justificadas) en
          rangos de fechas seleccionados.
        </Typography>
        <Divider sx={{ my: 2 }} />
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
          <Box sx={{ flex: 1 }}>
            <Typography variant='subtitle1' fontWeight={700} gutterBottom>
              Características destacadas
            </Typography>
            <Stack spacing={1}>
              <Chip
                label='Calendario mensual con totales por día'
                variant='outlined'
              />
              <Chip
                label='Gráficos de asistencia (barras, torta, líneas)'
                variant='outlined'
              />
              <Chip
                label='Rango de fechas y vista en pantalla completa'
                variant='outlined'
              />
              <Chip label='Tabla con búsqueda y filtros' variant='outlined' />
              <Chip
                label='Rutas protegidas y modal global'
                variant='outlined'
              />
            </Stack>
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography variant='subtitle1' fontWeight={700} gutterBottom>
              ¿Para quién está pensado?
            </Typography>
            <Typography variant='body2' color='text.secondary'>
              Para equipos escolares (preceptores, directivos) que necesitan
              registrar y consultar inasistencias de forma rápida, segura y
              visualmente clara, con foco en la lectura diaria y el análisis por
              periodos.
            </Typography>
          </Box>
        </Stack>
      </Paper>

      <Paper sx={{ p: 2 }}>
        <Typography variant='h6' gutterBottom>
          Licencia
        </Typography>
        <Typography variant='body2' color='text.secondary'>
          Sin licencia explícita definida. Consulta a los autores si vas a
          reutilizar o distribuir.
        </Typography>
      </Paper>

      <Paper sx={{ p: 2 }}>
        <Typography variant='h6' gutterBottom>
          Equipo / Colaboradores
        </Typography>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
            gap: 2,
          }}
        >
          {contributors.map((c) => (
            <Box key={c.name}>
              <Stack direction='row' spacing={1.5} alignItems='center'>
                <ChipAcount
                  size={40}
                  nameAcount={c.name}
                  roleAcount={c.role}
                  avatarAcount={c.avatar}
                />
              </Stack>
            </Box>
          ))}
        </Box>
      </Paper>
    </Box>
  );
};
