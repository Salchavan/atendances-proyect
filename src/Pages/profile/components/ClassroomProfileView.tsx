import React from 'react';
import {
  Box,
  Paper,
  Card,
  CardContent,
  Divider,
  Button,
  Typography,
} from '@mui/material';

import { useLocation, useParams } from 'react-router';

import { useStore } from '../../../store/Store';
import { changePageTitle } from '../../../Logic';
import { MultiChart } from '../../../components/MultiChart/MultiChart';
import { Notes } from '../../../components/Notes';
import { DataTable } from '../../../components/DataTable/DataTable';
import ClassroomData from '../../../data/Classrooms.json';
import StudentsData from '../../../data/Students.json';
import { ProfileHeader } from './ProfileHeader';
import { InfoField } from './InfoField';

type ClassroomItem = {
  id: number;
  char: string;
  year: number;
  numberStudents: number;
  turn: 'Mañana' | 'Tarde';
  specility?: string;
  imageUrl?: string;
  studentIds?: number[];
};

export const ClassroomProfileView: React.FC = () => {
  const location = useLocation();
  const { id } = useParams();
  const openDialog = useStore((s) => s.openDialog);

  const jsonItem: ClassroomItem | undefined = React.useMemo(() => {
    if (!id) return undefined;
    const list = ClassroomData as ClassroomItem[];
    return list.find((c) => String(c.id) === String(id));
  }, [id]);

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

  changePageTitle(`Curso ${item.year}º "${item.char}"`);

  const studentIds: number[] = ((jsonItem as any)?.studentIds ||
    (stateItem as any)?.studentIds ||
    []) as number[];
  const studentsInClass = React.useMemo(() => {
    try {
      const list = (StudentsData as any[]) || [];
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
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gridTemplateRows: 'repeat(10, 1fr)',
          gap: 2,
          height: '100%',
          minHeight: 0,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            minHeight: 0,
            gridColumn: '1 / 2',
            gridRow: '1 / span 9',
          }}
        >
          <Paper sx={{ borderRadius: 2, boxShadow: 2, p: 2 }}>
            <ProfileHeader
              title={title}
              chips={[
                { label: `Turno: ${item.turn}`, color: 'primary' },
                { label: `${item.numberStudents} estudiantes` },
                ...(item.specility ? [{ label: item.specility }] : []),
                { label: `ID: ${item.id}`, variant: 'outlined' },
              ]}
            />
          </Paper>

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
                  <InfoField label='Año' value={item.year} />
                  <InfoField label='División' value={item.char} />
                  <InfoField label='Turno' value={item.turn} />
                  <InfoField label='Estudiantes' value={item.numberStudents} />
                  <InfoField
                    label='Especialidad'
                    value={item.specility ?? '—'}
                  />
                  <InfoField label='Identificador' value={item.id} />
                </Box>
              </CardContent>
            </Card>

            <Box sx={{ height: '100%', minHeight: 0 }}>
              <Notes />
            </Box>
          </Box>
        </Box>

        <Box
          sx={{
            gridColumn: '2 / 3',
            gridRow: '1 / span 10',
            height: '100%',
          }}
        >
          <MultiChart
            title={title}
            grid='col-start-2 row-start-1 row-span-2'
            students={studentsInClass}
          />
        </Box>

        <Box
          sx={{
            gridColumn: '1 / -1',
            gridRow: '10 / 11',
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
                React.createElement(DataTable, {
                  tableData: studentsInClass,
                  filtersEnabled: true,
                }),
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
