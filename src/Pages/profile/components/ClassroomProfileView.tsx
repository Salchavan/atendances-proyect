import React from 'react';
import {
  Box,
  Paper,
  Card,
  CardContent,
  Divider,
  Button,
  Typography,
  CircularProgress,
} from '@mui/material';

import { useLocation, useParams } from 'react-router';
import { useQuery } from '@tanstack/react-query';

import { useStore } from '../../../store/Store';
import { useAcademicCatalog } from '../../../store/APIStore';
import { changePageTitle } from '../../../Logic';
import { MultiChart } from '../../../components/MultiChart/MultiChart';
import { Notes } from '../../../components/Notes';
import { DataTable } from '../../../components/DataTable/DataTable';
import { getStudentsByClassroom } from '../../../api/client';
import { ProfileHeader } from './ProfileHeader';
import { InfoField } from './InfoField';

type ClassroomItem = {
  id: number | string;
  char?: string;
  year?: number;
  yearNumber?: number;
  yearLabel?: string | number;
  numberStudents?: number;
  turn?: string;
  specility?: string;
  imageUrl?: string;
  division?: string;
  divisionLabel?: string;
  shiftLabel?: string;
  studentsCount?: number;
  students?: unknown[];
};

const SHIFT_LABELS: Record<string, string> = {
  MORNING: 'Mañana',
  TARDE: 'Tarde',
  TARDES: 'Tarde',
  AFTERNOON: 'Tarde',
  EVENING: 'Noche',
  NIGHT: 'Noche',
  MORNING_SHIFT: 'Mañana',
  TARDE_SHIFT: 'Tarde',
};

export const ClassroomProfileView: React.FC = () => {
  const location = useLocation();
  const { id } = useParams();
  const openDialog = useStore((s) => s.openDialog);

  const stateItem = React.useMemo(
    () => (location.state as Partial<ClassroomItem> | undefined) ?? {},
    [location.state]
  );
  const { classrooms, divisions, years, isLoading, isError, refetchAll } =
    useAcademicCatalog();

  const divisionLookup = React.useMemo(() => {
    const map = new Map<number, string>();
    divisions.forEach((division) => {
      if (typeof division.id === 'number' && division.division_letter) {
        map.set(division.id, division.division_letter);
      }
    });
    return map;
  }, [divisions]);

  const yearLookup = React.useMemo(() => {
    const map = new Map<number, number>();
    years.forEach((year) => {
      if (typeof year.id === 'number' && typeof year.year_number === 'number') {
        map.set(year.id, year.year_number);
      }
    });
    return map;
  }, [years]);

  const selectedClassroom = React.useMemo(() => {
    if (!id) return undefined;
    return classrooms.find((room) => String(room.id) === String(id));
  }, [classrooms, id]);

  const normalizedClassroom = React.useMemo(() => {
    const hasStateData = Object.values(stateItem).some(
      (value) => value !== undefined && value !== null
    );
    const source: Partial<ClassroomItem> & {
      year_id?: number;
      division_id?: number;
      division_letter?: string;
      division?: string;
      char?: string;
      shift?: string;
      turn?: string;
      students_count?: number;
      numberStudents?: number;
      yearNumber?: number;
      yearLabel?: string | number;
      students?: unknown[];
      studentsCount?: number;
      shiftLabel?: string;
      divisionLabel?: string;
    } = selectedClassroom ?? stateItem ?? {};

    if (!selectedClassroom && !hasStateData) return undefined;
    if (!source || (!source.id && !id)) return undefined;

    const yearNumber = (() => {
      if (typeof source.year === 'number') return source.year;
      if (typeof source.yearNumber === 'number') return source.yearNumber;
      if (typeof source.yearLabel === 'number') return source.yearLabel;
      if (
        typeof source.yearLabel === 'string' &&
        !Number.isNaN(Number.parseInt(source.yearLabel, 10))
      ) {
        return Number.parseInt(source.yearLabel, 10);
      }
      if (
        typeof source.year_id === 'number' &&
        yearLookup.has(source.year_id)
      ) {
        return yearLookup.get(source.year_id);
      }
      return undefined;
    })();

    const divisionLabel =
      source.char ??
      source.division ??
      source.division_letter ??
      source.divisionLabel ??
      (typeof source.division_id === 'number'
        ? divisionLookup.get(source.division_id)
        : undefined);

    const providedShiftLabel = source.shiftLabel;
    const rawShift = source.shift ?? source.turn ?? stateItem.turn;
    const normalizedShiftKey = (rawShift ?? '').toString().toUpperCase();
    const shiftLabel =
      providedShiftLabel ?? SHIFT_LABELS[normalizedShiftKey] ?? rawShift ?? '—';

    const studentsCount =
      source.studentsCount ??
      source.numberStudents ??
      source.students_count ??
      stateItem.numberStudents ??
      (Array.isArray(source.students) ? source.students.length : undefined);

    return {
      id: source.id ?? id ?? '—',
      yearNumber,
      divisionLabel,
      shiftLabel,
      studentsCount,
      specility: source.specility,
    };
  }, [id, selectedClassroom, stateItem, divisionLookup, yearLookup]);

  React.useEffect(() => {
    if (normalizedClassroom?.yearNumber && normalizedClassroom?.divisionLabel) {
      changePageTitle(
        `Curso ${normalizedClassroom.yearNumber}º "${normalizedClassroom.divisionLabel}"`
      );
    } else {
      changePageTitle('Curso');
    }
  }, [normalizedClassroom]);

  const classroomId = normalizedClassroom?.id;
  const studentsQuery = useQuery({
    queryKey: ['classroom-students', classroomId],
    queryFn: async () => {
      if (!classroomId) return [] as any[];
      return await getStudentsByClassroom(String(classroomId));
    },
    enabled: Boolean(classroomId),
    staleTime: 60_000,
  });

  const studentsInClass = React.useMemo(() => {
    const payload = studentsQuery.data;
    if (!payload) return [] as any[];
    if (Array.isArray(payload)) return payload as any[];
    const candidateKeys = ['students', 'data', 'items', 'results'];
    for (const key of candidateKeys) {
      const maybeArray = (payload as Record<string, unknown>)[key];
      if (Array.isArray(maybeArray)) {
        return maybeArray as any[];
      }
    }
    return [] as any[];
  }, [studentsQuery.data]);

  const studentsCount =
    normalizedClassroom?.studentsCount ?? studentsInClass.length ?? 0;

  const title = normalizedClassroom?.yearNumber
    ? `${normalizedClassroom.yearNumber}º "${
        normalizedClassroom.divisionLabel ?? '—'
      }"`
    : 'Curso sin datos';

  if (isLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gridColumn: '1 / -1',
          gridRow: '1 / -1',
          minHeight: 0,
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (isError) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 2,
          p: 4,
        }}
      >
        <Typography color='error' fontWeight={600}>
          No pudimos cargar el curso.
        </Typography>
        <Button variant='contained' onClick={refetchAll}>
          Reintentar
        </Button>
      </Box>
    );
  }

  if (!normalizedClassroom) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 1,
          p: 4,
        }}
      >
        <Typography fontWeight={600}>
          No encontramos información del curso seleccionado.
        </Typography>
        <Typography color='text.secondary'>
          Vuelve al listado y elige otro curso.
        </Typography>
      </Box>
    );
  }

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
                {
                  label: `Turno: ${normalizedClassroom.shiftLabel ?? '—'}`,
                  color: 'primary',
                },
                { label: `${studentsCount} estudiantes` },
                ...(normalizedClassroom.specility
                  ? [{ label: normalizedClassroom.specility }]
                  : []),
                { label: `ID: ${normalizedClassroom.id}`, variant: 'outlined' },
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
                  <InfoField
                    label='Año'
                    value={normalizedClassroom.yearNumber ?? '—'}
                  />
                  <InfoField
                    label='División'
                    value={normalizedClassroom.divisionLabel ?? '—'}
                  />
                  <InfoField
                    label='Turno'
                    value={normalizedClassroom.shiftLabel ?? '—'}
                  />
                  <InfoField label='Estudiantes' value={studentsCount ?? '—'} />
                  <InfoField
                    label='Especialidad'
                    value={normalizedClassroom.specility ?? '—'}
                  />
                  <InfoField
                    label='Identificador'
                    value={normalizedClassroom.id}
                  />
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
