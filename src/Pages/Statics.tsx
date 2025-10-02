import { Box, Card, CardContent, Paper, Typography } from '@mui/material';
import { useMemo } from 'react';
import { changePageTitle } from '../Logic';
import { DynamicGraph } from '../components/DynamicGraph/DynamicGraph';
import { DataTable } from '../components/DataTable/DataTable';
import Students from '../../public/data/Students.json';

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

  // Métricas simples para las cards
  const { totalStudents, totalAbsences, justifiedRate } = useMemo(() => {
    const totalStudents = tableData.length;
    let totalAbsences = 0;
    let justified = 0;
    for (const s of tableData) {
      const arr = Array.isArray(s.unassistences) ? s.unassistences : [];
      totalAbsences += arr.length;
      justified += arr.filter((a) => a.isJustified).length;
    }
    const justifiedRate =
      totalAbsences > 0 ? Math.round((justified / totalAbsences) * 100) : 0;
    return { totalStudents, totalAbsences, justifiedRate };
  }, [tableData]);
  return (
    <Box
      className='col-span-8 row-span-9 grid grid-cols-20 grid-rows-9 gap-2'
      sx={{ minWidth: 0 }}
    >
      {/* Toolbar de la página (vacío por ahora), mantener solo clases de grid */}
      <Box className='col-span-1 col-start-20 row-span-9 row-start-1'>
        <Paper elevation={1} sx={{ height: '100%', p: 2 }} />
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
                  <Typography variant='h4' fontWeight={700}>
                    {totalStudents}
                  </Typography>
                  <Typography variant='body2' color='text.secondary'>
                    Total registrados
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
                  <Typography variant='h4' fontWeight={700}>
                    {totalAbsences}
                  </Typography>
                  <Typography variant='body2' color='text.secondary'>
                    Acumuladas
                  </Typography>
                </CardContent>
              </Card>
            </Box>
            <Box className='col-span-1 col-start-3 row-span-1 row-start-1'>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant='overline' color='text.secondary'>
                    Justificadas
                  </Typography>
                  <Typography variant='h4' fontWeight={700}>
                    {justifiedRate}%
                  </Typography>
                  <Typography variant='body2' color='text.secondary'>
                    Tasa sobre inasistencias
                  </Typography>
                </CardContent>
              </Card>
            </Box>
          </Box>
          {/* Gráfico principal ocupando 2 filas */}

          <DynamicGraph
            graphName='Asistencias'
            grid='row-span-2'
            toolbarEnabled={false}
            disableClickToOpenTable
          />
        </Box>

        {/* Columna derecha: gráfico pequeño + DataTable */}
        <Box
          className='col-span-1 col-start-3 row-span-1 row-start-1 grid grid-rows-3 gap-2 outline-blue-500 outline-1'
          sx={{ minWidth: 0, overflow: 'hidden' }}
        >
          <DynamicGraph
            graphName='Inasistencias'
            grid=''
            toolbarEnabled={false}
            disableClickToOpenTable
          />

          <Box className='row-span-2 col-span-1 row-start-2'>
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
              <Box
                sx={{ flex: 1, minHeight: 0, minWidth: 0, overflow: 'auto' }}
              >
                <DataTable
                  tableData={tableData as any}
                  toolbarEnabled={false}
                  visibleFields={['id', 'firstName', 'lastName', 'classroom']}
                />
              </Box>
            </Paper>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};
