import { useState, useEffect } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
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

interface AsideEventsProps {
  grid: string;
}

interface SpecialDay {
  date: string;
  title: string;
}

export const AsideEvents = ({ grid }: AsideEventsProps) => {
  const [specialDays, setSpecialDays] = useState<SpecialDay[]>([]);
  const [loading, setLoading] = useState(true);
  const setSpecialDates = useStore((s) => s.setSpecialDates);

  useEffect(() => {
    async function fetchHolidays() {
      try {
        const currentYear = new Date().getFullYear();
        const response = await fetch(
          `https://date.nager.at/api/v3/PublicHolidays/${currentYear}/AR`
        );
        const holidays = await response.json();

        type HolidayApiResponse = {
          date: string;
          localName: string;
          [key: string]: any;
        };

        const formattedHolidays = (holidays as HolidayApiResponse[]).map(
          (holiday) => ({
            title: holiday.localName,
            date: new Date(holiday.date).toLocaleDateString('es-AR'),
            dateObj: new Date(holiday.date),
          })
        );

        const futureHolidays = formattedHolidays.filter(
          (day) => day.dateObj.getTime() >= new Date().setHours(0, 0, 0, 0)
        );

        setSpecialDays(futureHolidays);

        // Publicar al store en formato YYYY-MM-DD
        const ymdList = futureHolidays.map((d) => fmtYmd(d.dateObj));
        setSpecialDates(ymdList);
      } catch (error) {
        console.error('Error fetching holidays', error);
      } finally {
        setLoading(false);
      }
    }
    fetchHolidays();
  }, [setSpecialDates]);

  if (loading) {
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
                {day.date}
              </Typography>
              <Typography variant='body2'>{day.title}</Typography>
            </ListItem>
          ))}
        </List>
      </Box>
    </ErrorBoundary>
  );
};
