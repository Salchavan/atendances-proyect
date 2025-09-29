import React, { useMemo } from 'react';
import { useLocation, useParams } from 'react-router';
import {
  Box,
  Card,
  CardContent,
  Chip,
  Divider,
  Stack,
  Typography,
} from '@mui/material';
import Classroom from '../../data/Classrooms.json';
import { DynamicGraph } from '../../components/DynamicGraph/DynamicGraph';
import { DataTable } from '../../components/DataTable/DataTable';
import { ErrorBoundary } from 'react-error-boundary';
import { ErrorFallback } from '../../components/ErrorFallback';

type ClassroomItem = {
  id: number;
  char: string;
  year: number;
  numberStudents: number;
  turn: 'Mañana' | 'Tarde';
  specility?: string;
  imageUrl?: string; // opcional para el header
};

const LabelValue = ({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) => (
  <Box className='mb-1'>
    <Typography variant='caption' color='text.secondary'>
      {label}
    </Typography>
    <Typography variant='body1'>{value}</Typography>
  </Box>
);

export const ClassroomPage: React.FC = () => {
  const location = useLocation();
  const { id } = useParams();

  // Buscar por id en el JSON
  const jsonItem: ClassroomItem | undefined = useMemo(() => {
    if (!id) return undefined;
    const list = Classroom as ClassroomItem[];
    return list.find((c) => String(c.id) === String(id));
  }, [id]);

  // Permitir que vengan datos por state, si no usar el del JSON, y si no un fallback
  const stateItem =
    (location.state as Partial<ClassroomItem> | undefined) ?? {};
  const item: ClassroomItem = {
    id: 0,
    year: 7,
    char: 'F',
    numberStudents: 30,
    turn: 'Tarde',
    specility: undefined,
    imageUrl: undefined,
    ...jsonItem,
    ...stateItem,
  } as ClassroomItem;

  const title = `${item.year}º "${item.char}"`;
  const bgImage = item.imageUrl ?? '/images/classroom-placeholder.jpg'; // cambia esta ruta si tienes otra imagen

  return (
    <ErrorBoundary fallback={<ErrorFallback />}>
      <Box className='w-full h-full row-span-9 col-span-8'>
        {/* Grid 2x2 de cuadrantes */}
        <Box className='grid grid-cols-2 grid-rows-2 gap-2 h-full'>
          {/* Cuadrante 1: Imagen + Titulo + Detalles + Notas */}
          <Box className='col-span-1 row-span-1 flex flex-col gap-2'>
            {/* Header con imagen de fondo */}
            <Box
              className='relative h-[160px] md:h-[200px] bg-cover bg-center rounded-lg overflow-hidden shadow-md'
              style={{ backgroundImage: `url(${bgImage})` }}
            >
              <Box className='absolute inset-0 bg-black/35' />
              <Box className='absolute left-4 right-4 bottom-4 text-white'>
                <Typography variant='h4' className='font-semibold'>
                  {title}
                </Typography>
                <Stack direction='row' className='mt-1 flex-wrap gap-2'>
                  <Chip
                    size='small'
                    color='primary'
                    label={`Turno: ${item.turn}`}
                  />
                  <Chip
                    size='small'
                    label={`${item.numberStudents} estudiantes`}
                  />
                  {item.specility && (
                    <Chip size='small' label={item.specility} />
                  )}
                  <Chip
                    size='small'
                    variant='outlined'
                    label={`ID: ${item.id}`}
                    className='text-white border-white/60'
                  />
                </Stack>
              </Box>
            </Box>

            {/* Detalles y Notas en dos columnas */}
            <Box className='grid grid-cols-2 gap-2'>
              <Card className='rounded-lg shadow-md'>
                <CardContent>
                  <Typography variant='h6'>Detalles de la clase</Typography>
                  <Divider className='my-2' />
                  <Box className='grid grid-cols-2 gap-2'>
                    <LabelValue label='Año' value={item.year} />
                    <LabelValue label='División' value={item.char} />
                    <LabelValue label='Turno' value={item.turn} />
                    <LabelValue
                      label='Estudiantes'
                      value={item.numberStudents}
                    />
                    <LabelValue
                      label='Especialidad'
                      value={item.specility ?? '—'}
                    />
                    <LabelValue label='Identificador' value={item.id} />
                  </Box>
                </CardContent>
              </Card>
              <Card className='rounded-lg shadow-md'>
                <CardContent>
                  <Typography variant='h6'>Notas</Typography>
                  <Divider className='my-2' />
                  <Typography variant='body2' color='text.secondary'>
                    Espacio para observaciones, metas del curso o recordatorios.
                  </Typography>
                </CardContent>
              </Card>
            </Box>
          </Box>

          {/* Cuadrante 2: DataTable */}
          <Card className='col-span-1 row-span-2 rounded-lg shadow-md h-full'>
            <CardContent className='h-full flex flex-col'>
              <Typography variant='h6' className='mb-2'>
                Lista de estudiantes
              </Typography>
              <Box className='flex-1 min-h-0'>
                <DataTable tableData={[]} filtersEnabled={false} />
              </Box>
            </CardContent>
          </Card>

          {/* Cuadrante 3: Gráfico */}
          <Card className='col-span-1 row-span-1 rounded-lg shadow-md h-full'>
            <CardContent className='h-full'>
              <Typography variant='h6' className='mb-2'>
                Asistencias recientes
              </Typography>
              <DynamicGraph dataTableName='students' grid='w-full h-full' />
            </CardContent>
          </Card>
        </Box>
      </Box>
    </ErrorBoundary>
  );
};
