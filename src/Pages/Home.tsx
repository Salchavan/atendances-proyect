import { changePageTitle } from '../Logic';
import { DynamicGraph } from '../components/DynamicGraph/DynamicGraph.tsx';
import { AsideEvents } from '../components/AsideEvents.tsx';
import { getLastWeekdays } from '../Store/specificStore/GraphStore.ts';

import 'rsuite/dist/rsuite.min.css';
import { Box, Typography } from '@mui/material';

export const Home = () => {
  // Obtener hoy + 5 días laborables hacia atrás (total 6 fechas)
  const recentWeekdays = getLastWeekdays(6, true);
  changePageTitle('Inicio');
  return (
    <>
      <Box className='col-span-6 row-span-8'>
        <Typography variant='h3' fontWeight={500} mb={1}>
          Grafico de inasistencias
        </Typography>
        <DynamicGraph
          dataTableName='Ultimos 5 dias escolares'
          initialAssignedDate={recentWeekdays}
          grid=''
        />
      </Box>
      <AsideEvents grid='col-span-2 row-span-9 col-start-7' />
    </>
  );
};
