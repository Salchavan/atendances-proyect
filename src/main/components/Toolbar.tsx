import { List, ListItem, Button } from '@mui/material';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import { useStore } from '../../store/Store';
// import { Calendar } from './Calendar';

export const Toolbar = () => {
  const openDialog = useStore((state) => state.openDialog);
  return (
    <List className='col-span-5 col-start-3 row-start-2 bg-acento/50 rounded-xl flex flex-row items-center '>
      <ListItem>
        <Button
          variant='outlined'
          startIcon={<CalendarMonthIcon />}
          onClick={() =>
            openDialog(
              <div>
                <p>holaaaa</p>
              </div>,
              'Selecciona una fecha'
            )
          }
          // Acá usamos el estado actual para invertirlo
        >
          Fecha
        </Button>
      </ListItem>
    </List>
  );
};
