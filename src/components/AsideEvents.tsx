import { useEffect, useMemo } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { useQuery } from '@tanstack/react-query';
import { useStore } from '../store/Store';
import { fmtYmd } from './Calendar/utils';
import {
  Box,
  Typography,
  List,
  ListItem,
  Stack,
  CircularProgress,
} from '@mui/material';
import { getNotSchoolDays } from '../api/client';

interface AsideEventsProps {
  grid: string;
}

export const AsideEvents = ({ grid }: AsideEventsProps) => {
  const setSpecialDates = useStore((s) => s.setSpecialDates);
  const { data, isLoading, isError } = useQuery({
    queryKey: ['not-school-days', 'aside-events'],
    queryFn: getNotSchoolDays,
    staleTime: 5 * 60 * 1000,
  });

  type ApiRecord = {
    date?: string;
    day?: string;
    reason?: string;
    title?: string;
    description?: string;
    [key: string]: any;
  };

  const specialDays = useMemo(() => {
    if (!data)
      return [] as { dateLabel: string; title: string; dateObj: Date }[];

    const candidateSources = Array.isArray(data)
      ? data
      : ['notSchoolDays', 'days', 'items', 'data', 'list'].reduce<any[]>(
          (acc, key) => {
            if (acc.length) return acc;
            const value = (data as any)?.[key];
            return Array.isArray(value) ? value : acc;
          },
          []
        );

    const records: ApiRecord[] = Array.isArray(candidateSources)
      ? candidateSources
      : [];

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    return records
      .map((record) => {
        const rawDate = record.date ?? record.day ?? record.date_iso;
        if (!rawDate) return null;
        const parsed = new Date(rawDate);
        if (Number.isNaN(parsed.getTime())) return null;
        return {
          dateObj: parsed,
          dateLabel: parsed.toLocaleDateString('es-AR'),
          title:
            record.reason ??
            record.title ??
            record.description ??
            'Día sin clases',
        };
      })
      .filter(
        (
          entry
        ): entry is { dateLabel: string; title: string; dateObj: Date } => {
          if (!entry) return false;
          return entry.dateObj.getTime() >= todayStart.getTime();
        }
      )
      .sort((a, b) => a.dateObj.getTime() - b.dateObj.getTime());
  }, [data]);

  useEffect(() => {
    if (!specialDays.length) return;
    const ymdList = specialDays.map((day) => fmtYmd(day.dateObj));
    setSpecialDates(ymdList);
  }, [specialDays, setSpecialDates]);

  if (isLoading) {
    return (
      <Box
        className={grid}
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: 2,
        }}
      >
        <Stack direction='row' spacing={1} alignItems='center'>
          <CircularProgress size={20} />
          <Typography variant='body2' color='text.secondary'>
            Cargando días especiales…
          </Typography>
        </Stack>
      </Box>
    );
  }

  if (isError) {
    return (
      <Box
        className={grid}
        sx={{
          p: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Typography variant='body2' color='error'>
          No pudimos cargar los días especiales.
        </Typography>
      </Box>
    );
  }

  return (
    <ErrorBoundary fallback={<div>Error loading special days.</div>}>
      <Box className={grid}>
        <Box
          sx={{
            borderRadius: 2,
            px: 1,
            py: 0.5,
            mb: 1,
          }}
        >
          <Typography variant='h5' sx={{ fontSize: '1.2rem !important' }}>
            Próximos Días Especiales
          </Typography>
        </Box>
        <List disablePadding>
          {specialDays.map((day, index) => (
            <ListItem
              key={index}
              sx={{
                flexDirection: 'column',
                alignItems: 'flex-start',
                borderRadius: 2,
                my: 1,
                p: 2,
                backgroundColor: 'background.paper',
              }}
            >
              <Typography variant='subtitle1' fontWeight={700}>
                {day.dateLabel}
              </Typography>
              <Typography variant='body2'>{day.title}</Typography>
            </ListItem>
          ))}
          {!specialDays.length && (
            <Typography
              variant='body2'
              color='text.secondary'
              sx={{ mt: 2, px: 2 }}
            >
              No hay días sin clases próximos registrados.
            </Typography>
          )}
        </List>
      </Box>
    </ErrorBoundary>
  );
};
