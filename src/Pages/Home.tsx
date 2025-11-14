import { changePageTitle } from '../Logic';
import { AsideEvents } from '../components/AsideEvents.tsx';

import 'rsuite/dist/rsuite.min.css';
import { Box } from '@mui/material';
import { Calendar } from '../components/Calendar/Calendar.tsx';

export const Home = () => {
  // Obtener hoy + 5 días laborables hacia atrás (total 6 fechas)
  changePageTitle('Inicio');
  return (
    <>
      <Box className='col-span-6 row-span-9 grid grid-cols-6 grid-rows-9 min-h-0'>
        {/* DynamicGraph temporalmente oculto mientras se usa el calendario */}
        <Calendar absences={{}} className='col-span-6 row-span-8 min-h-0' />
      </Box>
      <AsideEvents grid='col-span-2 row-span-9 col-start-7 row-start-2' />
    </>
  );
};
