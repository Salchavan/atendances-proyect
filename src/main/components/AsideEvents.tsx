import { List, ListItem, ListSubheader, Typography } from '@mui/material';
import { useState, useEffect } from 'react';

export const AsideEvents = () => {
  const [specialDays, setSpecialDays] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHolidays = async () => {
      try {
        const currentYear = new Date().getFullYear();
        const response = await fetch(
          `https://date.nager.at/api/v3/PublicHolidays/${currentYear}/AR`
        );
        const holidays = await response.json();

        const formattedHolidays = holidays.map((holiday) => ({
          title: holiday.localName,
          date: new Date(holiday.date).toLocaleDateString('es-AR'),
          dateObj: new Date(holiday.date),
        }));

        const futureHolidays = formattedHolidays.filter(
          (day) => day.dateObj >= new Date().setHours(0, 0, 0, 0)
        );

        setSpecialDays(futureHolidays);
      } catch (error) {
        console.error('Error fetching holidays:', error);
      } finally {
        setLoading(false);
      }
    };

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
      className='col-span-2 row-span-8 col-start-9 row-start-3 bg-secondary rounded-xl overflow-scroll'
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
