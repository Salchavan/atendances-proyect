import { List, ListItem } from '@mui/material';
// import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
// import { useStore } from '../../store/Store';
// import { Calendar } from './Calendar';
import { addDays, startOfYear } from 'date-fns';
import { DateRangePicker } from 'rsuite';

export const Toolbar = () => {
  const now = new Date();

  // const openDialog = useStore((state) => state.openDialog);

  const predefinedRanges = [
    {
      label: 'Hoy',
      value: [new Date(), new Date()],
      placement: 'bottom',
    },
    {
      label: 'Ayer',
      value: [addDays(new Date(), -1), addDays(new Date(), -1)],
      placement: 'bottom',
    },
    {
      label: 'Ultimos 7 dias',
      value: [addDays(new Date(), -7), new Date()],
      placement: 'bottom',
    },
    {
      label: 'Ultimos 30 dias',
      value: [addDays(new Date(), -30), new Date()],
      placement: 'bottom',
    },
    {
      label: 'Este año',
      value: [startOfYear(now), now], // 1 de enero hasta hoy
      placement: 'bottom',
    },
  ];

  return (
    <List className='col-span-8 col-start-3 row-start-2 bg-acento/50 rounded-xl flex flex-row items-center '>
      <ListItem>
        <DateRangePicker
          format='dd / MM / yyyy'
          placeholder='Select Date'
          showHeader={false}
          ranges={predefinedRanges}
        />
      </ListItem>
    </List>
  );
};
