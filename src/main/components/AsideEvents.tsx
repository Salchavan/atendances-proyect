import { List, ListItem, ListSubheader, Typography } from '@mui/material';

const specialDays = [
  {
    tittle: 'Día de la Revolución de Mayo',
    date: '25-05-25',
  },
  {
    tittle: 'Día de la Independencia',
    date: '09-07-25',
  },
  {
    tittle: 'Paso a la Inmortalidad del General José de San Martín',
    date: '18-08-25',
  },
  {
    tittle: 'Día del Respeto a la Diversidad Cultural',
    date: '13-10-25',
  },
  {
    tittle: 'Día de la Soberanía Nacional',
    date: '24-11-25',
  },
  {
    tittle: 'Navidad',
    date: '25-12-25',
  },
  {
    tittle: 'Año Nuevo',
    date: '01-01-25',
  },
  {
    tittle: 'Carnaval',
    date: '03-03-25',
  },
  {
    tittle: 'Carnaval',
    date: '04-03-25',
  },
  {
    tittle: 'Viernes Santo',
    date: '18-04-25',
  },
  {
    tittle: 'Día del Trabajador',
    date: '01-05-25',
  },
  {
    tittle: 'Día de la Bandera (Paso a la Inmortalidad de Manuel Belgrano)',
    date: '20-06-25',
  },
];

export const AsideEvents = () => {
  return (
    <List
      sx={{ padding: '8px' }}
      subheader={
        <ListSubheader
          sx={{ bgcolor: '#8891c1', fontSize: '20px' }}
          className='rounded-xl'
        >
          Dias Especiales
        </ListSubheader>
      }
      className='col-span-2 row-span-5 col-start-6 row-start-3 bg-secondary rounded-xl overflow-scroll'
    >
      {specialDays.map((day, index) => (
        <ListItem
          key={index}
          className='flex flex-col items-start rounded-xl bg-white/50 my-1 p-'
        >
          <Typography>{day.date}</Typography>
          <Typography>{day.tittle}</Typography>
        </ListItem>
      ))}
    </List>
  );
};
