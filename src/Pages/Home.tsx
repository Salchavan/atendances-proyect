import { changePageTitle } from '../Logic';
import { AsideEvents } from '../components/AsideEvents.tsx';
import { ErrorBoundary } from 'react-error-boundary';
import { ErrorFallback } from '../components/ErrorFallback';

import 'rsuite/dist/rsuite.min.css';
import { Box, Typography } from '@mui/material';
import { Calendar } from '../components/Calendar/Calendar.tsx';

export const Home = () => {
  // Obtener hoy + 5 días laborables hacia atrás (total 6 fechas)
  changePageTitle('Inicio');
  return (
    <ErrorBoundary fallback={<ErrorFallback />}>
      <Box className='col-span-6 row-span-9 grid grid-cols-6 grid-rows-9 min-h-0'>
        <Typography
          variant='h3'
          fontWeight={500}
          mb={1}
          className='col-span-6 row-span-1'
        >
          Calendario de inasistencias
        </Typography>
        {/* DynamicGraph temporalmente oculto mientras se usa el calendario */}
        <Calendar absences={{}} className='col-span-6 row-span-8 min-h-0' />
      </Box>
      <AsideEvents grid='col-span-2 row-span-9 col-start-7' />
    </ErrorBoundary>
  );
};
