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
import { MultiChart } from '../../components/MultiChart/MultiChart';
import { DataTable } from '../../components/DataTable/DataTable';
import Students from '../../data/Students.json';
import { Button } from '@mui/material';
import { useStore } from '../../store/Store';
import { Notes } from '../../components/Notes';

type ClassroomItem = {
  id: number;
  char: string;
  year: number;
  numberStudents: number;
  turn: 'Mañana' | 'Tarde';
  specility?: string;
  imageUrl?: string; // opcional para el header
};

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

  // students for this classroom (by id). Use the JSON file and filter by studentIds
  const openDialog = useStore((s) => s.openDialog);
  const studentIds: number[] = ((jsonItem as any)?.studentIds ||
    (stateItem as any)?.studentIds ||
    []) as number[];
  const studentsInClass = useMemo(() => {
    try {
      const list = (Students as any[]) || [];
      if (!studentIds || !studentIds.length) return [] as any[];
      return list.filter((s) => studentIds.includes(s.id));
    } catch (e) {
      return [] as any[];
    }
  }, [studentIds]);

  const title = `${item.year}º "${item.char}"`;

  return (
    <Box
      sx={{
        width: '100%',
        height: '100%',
        gridColumn: '1 / -1',
        gridRow: '1 / -1',
      }}
    >
      {/* Grid 2x2 de cuadrantes */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gridTemplateRows: 'repeat(10, 1fr)', // 10 filas iguales
          gap: 2,
          height: '100%',
          minHeight: 0,
        }}
      >
        {/* Primer cuadrante: ocupar columna 1 y las primeras 9 filas */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            minHeight: 0,
            gridColumn: '1 / 2',
            gridRow: '1 / span 9', // ocupa filas 1..9
          }}
        >
          {/* Header sin imagen: sólo título y chips */}
          <Card sx={{ borderRadius: 2, boxShadow: 2, p: 2 }}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 2,
              }}
            >
              <Typography variant='h4' sx={{ fontWeight: 600, mr: 1 }}>
                {title}
              </Typography>
              <Stack
                direction='row'
                sx={{
                  flexWrap: 'wrap',
                  gap: 2,
                  alignItems: 'center',
                }}
              >
                <Chip
                  size='small'
                  color='primary'
                  label={`Turno: ${item.turn}`}
                />
                <Chip
                  size='small'
                  label={`${item.numberStudents} estudiantes`}
                />
                {item.specility && <Chip size='small' label={item.specility} />}
                <Chip
                  size='small'
                  variant='outlined'
                  label={`ID: ${item.id}`}
                />
              </Stack>
            </Box>
          </Card>

          {/* Detalles y Notas en dos columnas */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 2,
              flex: 1,
              minHeight: 0,
            }}
          >
            <Card
              sx={{
                borderRadius: 2,
                boxShadow: 2,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <CardContent sx={{ flex: 1, overflow: 'auto' }}>
                <Typography variant='h6'>Detalles de la clase</Typography>
                <Divider sx={{ my: 2 }} />
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: 2,
                  }}
                >
                  {/* LabelValue with MUI spacing */}
                  <Box>
                    <Typography variant='caption' color='text.secondary'>
                      Año
                    </Typography>
                    <Typography variant='body1'>{item.year}</Typography>
                  </Box>
                  <Box>
                    <Typography variant='caption' color='text.secondary'>
                      División
                    </Typography>
                    <Typography variant='body1'>{item.char}</Typography>
                  </Box>
                  <Box>
                    <Typography variant='caption' color='text.secondary'>
                      Turno
                    </Typography>
                    <Typography variant='body1'>{item.turn}</Typography>
                  </Box>
                  <Box>
                    <Typography variant='caption' color='text.secondary'>
                      Estudiantes
                    </Typography>
                    <Typography variant='body1'>
                      {item.numberStudents}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant='caption' color='text.secondary'>
                      Especialidad
                    </Typography>
                    <Typography variant='body1'>
                      {item.specility ?? '—'}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant='caption' color='text.secondary'>
                      Identificador
                    </Typography>
                    <Typography variant='body1'>{item.id}</Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>

            <Box sx={{ height: '100%', minHeight: 0 }}>
              <Notes />
            </Box>
          </Box>
        </Box>

        {/* Aquí podrías colocar otro elemento en la columna derecha que ocupe filas 1..10
      por ejemplo el MultiChart: */}
        <Box
          sx={{
            gridColumn: '2 / 3',
            gridRow: '1 / span 10', // ocupa toda la columna derecha
            height: '100%',
          }}
        >
          <MultiChart
            title={title}
            grid='col-start-2 row-start-1 row-span-2'
            students={studentsInClass}
          />
        </Box>

        {/* Botón que ocupará la fila 10 y las 2 columnas */}
        <Box
          sx={{
            gridColumn: '1 / -1', // ocupa ambas columnas
            gridRow: '10 / 11', // última fila (fila 10)
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-start',
            p: 1,
            gap: 1,
          }}
        >
          <Button
            sx={{ width: '50%' }}
            variant='contained'
            onClick={() =>
              openDialog(
                <DataTable tableData={studentsInClass} filtersEnabled={true} />,

                `Estudiantes - ${title}`,
                'big'
              )
            }
          >
            Ver estudiantes
          </Button>
        </Box>
      </Box>
    </Box>
  );
};
