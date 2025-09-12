import { List, ListItem, ListSubheader, Typography } from '@mui/material';
import { useState, useEffect } from 'react';

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
      } catch (error) {
        console.error('Error fetching holidays', error);
      } finally {
        setLoading(false);
      }
    }
    fetchHolidays();
  }, []);

  if (loading) {
    return <div>Cargando días especiales...</div>;
  }

  return (
    <List
      sx={{ padding: '8px' }}
      subheader={
        <ListSubheader
          sx={{ bgcolor: '#8891c1', fontSize: '17px' }}
          className='rounded-xl'
        >
          Próximos Días Especiales
        </ListSubheader>
      }
      className={grid + ' bg-secondary rounded-xl '}
    >
      {specialDays.map((day, index) => (
        <ListItem
          key={index}
          className='flex flex-col items-start rounded-xl bg-white/50 my-1 p-2'
        >
          <Typography variant='body2' fontWeight='bold'>
            {day.date}
          </Typography>
          <Typography variant='body2'>{day.title}</Typography>
        </ListItem>
      ))}
    </List>
  );
};
