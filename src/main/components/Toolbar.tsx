import { List, ListItem } from '@mui/material';
import { useState } from 'react';
import { addDays, startOfYear } from 'date-fns';
import { DateRangePicker } from 'rsuite';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import { useStore } from '../../store/Store';

export const Toolbar = () => {
  // Guardamos el rango seleccionado localmente y luego lo enviamos al store al confirmar
  const {assignedDateRange, setAssignedDateRange} = useStore((store) => store);
  console.log(assignedDateRange);
  const [range, setRange] = useState<[Date, Date] | null>(null);
  const now = new Date();
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

  const updateRange = (newRange: [Date, Date] | null) => {
    // value puede venir como [start, end]
    if (newRange && Array.isArray(newRange) && newRange[0] && newRange[1]) {
      const [start, end] = newRange as [Date, Date];
      const weekdays: Date[] = [];
      const cursor = new Date(start);
      while (cursor.getTime() <= end.getTime()) {
        const day = cursor.getDay();
        if (day >= 1 && day <= 5) {
          weekdays.push(new Date(cursor));
        }
        cursor.setDate(cursor.getDate() + 1);
      }
      if (weekdays.length === 0) {
        setAssignedDateRange(null);
      } else {
        const assigned: [Date, Date] = [weekdays[0], weekdays[weekdays.length - 1]];
        setAssignedDateRange(assigned);
        console.log('Rango de días laborales asignado:', assigned);
      }
    } else {
      setAssignedDateRange(null);
    }
  };

  return (
    <List className='col-span-8 col-start-3 row-start-2 bg-acento/50 rounded-xl flex flex-row items-center '>
      <ListItem>
        <DateRangePicker
          format='dd / MM / yyyy'
          placeholder='Seleccionar rango'
          showHeader={false}
          ranges={predefinedRanges as any}
          caretAs={CalendarMonthIcon}
          value={range as any}
          onChange={(value) => {
            // value puede ser null o [start, end]
            if (value && Array.isArray(value) && value[0] && value[1]) {
              setRange([value[0], value[1]] as [Date, Date]);
            } else {
              setRange(null);
            }
          }}
          onOk={(value) => {
            updateRange(value);
          }}
          onClean={() => {
            setRange(null);
            setAssignedDateRange(null);
          }}
        />
      </ListItem>
    </List>
  );
};
