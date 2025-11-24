import React from 'react';
import {
  Box,
  Button,
  Card,
  CardActionArea,
  CardContent,
  Chip,
  CircularProgress,
  Stack,
  Typography,
} from '@mui/material';
import { useNavigateTo } from '../Logic.ts';
import { useAcademicCatalog } from '../store/APIStore.ts';

export const IndexClassroomsPage = () => {
  const navigateTo = useNavigateTo();
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

  type NormalizedClassroom = {
    id: number | string;
    yearNumber?: number;
    divisionLabel?: string;
    studentsCount?: number;
    shiftLabel?: string;
  };

  const normalizedClassrooms = React.useMemo<NormalizedClassroom[]>(() => {
    return classrooms.map((room) => {
      const yearNumber =
        typeof room.year === 'number'
          ? room.year
          : room.year_id && yearLookup.get(room.year_id);
      const divisionLabel =
        room.division ??
        room.division_letter ??
        (room.division_id ? divisionLookup.get(room.division_id) : undefined) ??
        room.char;
      const studentsCount =
        room.students_count ?? room.numberStudents ?? undefined;
      const shiftLabel = room.shift ?? room.turn;

      return {
        id: room.id,
        yearNumber,
        divisionLabel,
        studentsCount,
        shiftLabel,
      };
    });
  }, [classrooms, divisionLookup, yearLookup]);

  // Years (1º to 7º) and grouping of classrooms by year
  const YEARS = [1, 2, 3, 4, 5, 6, 7] as const;
  const byYear: NormalizedClassroom[][] = React.useMemo(
    () =>
      YEARS.map((year) =>
        normalizedClassrooms.filter((room) => room.yearNumber === year)
      ),
    [normalizedClassrooms]
  );

  const handleOpen = (item: NormalizedClassroom) => {
    // Navegar a la ruta dinámica '/home/classrooms/:id'
    navigateTo(`${item.id}`);
  };

  if (isLoading) {
    return (
      <Box
        sx={{
          gridColumn: '1 / -1',
          gridRow: '1 / -1',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
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
          gridColumn: '1 / -1',
          gridRow: '1 / -1',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 2,
          p: 4,
        }}
      >
        <Typography color='error' fontWeight={600}>
          No pudimos cargar las aulas.
        </Typography>
        <Button variant='contained' onClick={refetchAll}>
          Reintentar
        </Button>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        p: 2,
        height: '100%',
        minHeight: 0,
        gridColumn: '1 / -1',
        gridRow: '1 / -1',
        display: 'grid',
        gridTemplateColumns: 'repeat(7, minmax(0, 1fr))',
        gap: 2,
        overflow: 'auto',
        alignContent: 'start',
      }}
    >
      {byYear.map((items, idx) => (
        <Box
          key={YEARS[idx]}
          sx={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 }}
        >
          <Typography
            variant='subtitle2'
            color='text.secondary'
            textAlign='center'
            sx={{ fontWeight: 600 }}
          >
            {`${YEARS[idx]}º`}
          </Typography>
          {items.map((item) => {
            const title = item.yearNumber
              ? `${item.yearNumber}º año`
              : 'Año sin asignar';
            return (
              <Card
                key={item.id}
                sx={{
                  borderRadius: 2,
                  boxShadow: 2,
                  overflow: 'hidden',
                  aspectRatio: '1 / 1',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <CardActionArea
                  onClick={() => handleOpen(item)}
                  sx={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'stretch',
                  }}
                >
                  <CardContent
                    sx={{
                      py: 1.5,
                      px: 2,
                      width: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 1,
                      flex: 1,
                    }}
                  >
                    <Stack
                      direction='column'
                      spacing={0.5}
                      alignItems='flex-start'
                    >
                      <Typography
                        variant='h6'
                        fontWeight={700}
                        color='text.primary'
                        noWrap
                      >
                        {title}
                      </Typography>
                      <Typography variant='body2' color='text.secondary'>
                        División {item.divisionLabel ?? '—'}
                      </Typography>
                      <Chip
                        size='small'
                        label={item.shiftLabel ?? 'Turno sin definir'}
                        color='primary'
                        variant='outlined'
                        sx={{ mt: 0.25 }}
                      />
                    </Stack>
                    <Stack
                      direction='row'
                      spacing={1}
                      alignItems='center'
                      sx={{ mt: 0.5 }}
                    >
                      <Typography variant='body2' color='text.secondary'>
                        Estudiantes: {item.studentsCount ?? '—'}
                      </Typography>
                    </Stack>
                  </CardContent>
                </CardActionArea>
              </Card>
            );
          })}
        </Box>
      ))}
    </Box>
  );
};
