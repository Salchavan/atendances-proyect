import { List, ListItem } from '@mui/material';
// import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
// import { useStore } from '../../store/Store';
// import { Calendar } from './Calendar';
import { addDays } from 'date-fns';

import { DateRangePicker } from 'rsuite';

export const Toolbar = () => {
  // const openDialog = useStore((state) => state.openDialog);

  const predefinedRanges = [
    {
      label: 'Today',
      value: [new Date(), new Date()],
      placement: 'bottom',
    },
    {
      label: 'Yesterday',
      value: [addDays(new Date(), -1), addDays(new Date(), -1)],
      placement: 'bottom',
    },
    {
      label: 'Last 7 Days',
      value: [addDays(new Date(), -7), new Date()],
      placement: 'bottom',
    },
    {
      label: 'Last 30 Days',
      value: [addDays(new Date(), -30), new Date()],
      placement: 'bottom',
    },
  ];

  return (
    <List className='col-span-5 col-start-3 row-start-2 bg-acento/50 rounded-xl flex flex-row items-center '>
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
