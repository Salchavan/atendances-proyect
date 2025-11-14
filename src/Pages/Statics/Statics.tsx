import {
  Box,
  Card,
  CardContent,
  IconButton,
  Paper,
  Typography,
} from '@mui/material';
import { changePageTitle } from '../../Logic';
import { DataTable } from '../../components/DataTable/DataTable';
import Students from '../../data/Students.json';
import useStaticsLogic from './Statics.logic';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import BuildIcon from '@mui/icons-material/Build';
import LocationSearchingIcon from '@mui/icons-material/LocationSearching';
import { MultiChart } from '../../components/MultiChart/MultiChart';

type Student = {
  id: number | string;
  firstName?: string;
  lastName?: string;
  email?: string;
  course?: string;
  unassistences?: Array<{ day: string; isJustified?: boolean }>;
  [key: string]: any;
};

export const Statics = () => {
  changePageTitle('Estadisticas');
  // Datos base
  const tableData = Students as unknown as Student[];

  // use logic hook for Statics
  const logic = useStaticsLogic();
  return (
    <Box
      className='col-span-8 row-span-9 grid grid-cols-20 grid-rows-9 gap-2'
      sx={{ minWidth: 0 }}
    >
      {/* Toolbar de la página: iconos sin funcionalidad por ahora */}
      <Box className='col-span-1 col-start-20 row-span-9 row-start-1'>
        <Paper
          elevation={1}
          sx={{
            height: '100%',
            p: 2,
            display: 'flex',
            flexDirection: 'column',
            gap: 1.5,
            alignItems: 'center',
          }}
        >
          <IconButton aria-label='Localizar' size='medium'>
            <LocationSearchingIcon fontSize='medium' />
          </IconButton>
          <IconButton aria-label='Descargar' size='medium'>
            <FileDownloadIcon fontSize='medium' />
          </IconButton>
          <IconButton aria-label='Herramientas' size='medium'>
            <BuildIcon fontSize='medium' />
          </IconButton>
        </Paper>
      </Box>

      {/* Área principal en dos columnas con grid Tailwind existente */}
      <Box
        className='col-span-19 col-start-1 row-span-9 row-start-1 grid grid-cols-3 grid-rows-1 gap-2'
        sx={{ minWidth: 0 }}
      >
        {/* Columna izquierda: 3 mini-cards + gráfico grande */}
        <Box className='col-span-2 col-start-1 row-span-1 row-start-1 grid grid-rows-3 gap-2'>
          {/* Fila de 3 cards */}
          <Box className='row-span-1 grid grid-cols-3 gap-2'>
            <Box className='col-span-1 col-start-1 row-span-1 row-start-1'>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant='overline' color='text.secondary'>
                    Estudiantes
                  </Typography>
                  <Typography variant='h6' fontWeight={700}>
                    {logic.periodSummary}
                  </Typography>
                  <Typography variant='body2' color='text.secondary'>
                    Comparación con periodo anterior
                  </Typography>
                </CardContent>
              </Card>
            </Box>
            <Box className='col-span-1 col-start-2 row-span-1 row-start-1'>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant='overline' color='text.secondary'>
                    Inasistencias
                  </Typography>
                  <Typography
                    variant='h4'
                    sx={{
                      fontSize: '2rem !important',
                      color: 'error.main',
                    }}
                    fontWeight={700}
                  >
                    {logic.totalAbsences}
                  </Typography>
                  <Typography variant='body2' color='text.secondary'>
                    Inasistencias en el periodo
                  </Typography>
                </CardContent>
              </Card>
            </Box>
            <Box className='col-span-1 col-start-3 row-span-1 row-start-1'>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant='subtitle2'>
                    Alumno con más faltas:
                  </Typography>
                  <Typography variant='body2' color='text.secondary'>
                    {logic.topStudent.id ?? 'N/A'} ({logic.topStudent.count})
                  </Typography>
                  <Typography variant='subtitle2' sx={{ mt: 1 }}>
                    Curso con más faltas:
                  </Typography>
                  <Typography variant='body2' color='text.secondary'>
                    {logic.topClass.name ?? 'N/A'} ({logic.topClass.count})
                  </Typography>
                  <Typography variant='subtitle2' sx={{ mt: 1 }}>
                    Turno con más faltas:
                  </Typography>
                  <Typography variant='body2' color='text.secondary'>
                    {logic.topShift.name} ({logic.topShift.count})
                  </Typography>
                </CardContent>
              </Card>
            </Box>
          </Box>
          {/* Gráfico principal ocupando 2 filas */}

          <MultiChart
            title='Asistencias'
            grid='row-span-2'
            toolbarPosition='bottom'
            disabledControls={{ date: true }}
          />
        </Box>

        {/* Columna derecha: gráfico pequeño + DataTable */}
        <Box
          className='col-span-1 col-start-3 row-span-1 row-start-1  gap-2'
          sx={{ minWidth: 0, overflow: 'hidden' }}
        >
          <Paper
            elevation={1}
            sx={{
              height: '100%',
              p: 1.5,
              display: 'flex',
              flexDirection: 'column',
              minHeight: 0,
              minWidth: 0,
              overflow: 'hidden',
              contain: 'layout paint',
            }}
          >
            <Box sx={{ flex: 1, minHeight: 0, minWidth: 0, overflow: 'auto' }}>
              <DataTable
                tableData={tableData as any}
                toolbarEnabled={false}
                visibleFields={['first_name', 'last_name', 'classroom']}
                fitColumns={true}
              />
            </Box>
          </Paper>
        </Box>
      </Box>
    </Box>
  );
};
