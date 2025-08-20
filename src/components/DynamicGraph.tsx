import { Box } from '@mui/material';
import { BarChart } from '@mui/x-charts';
import { useStore } from '../store/Store';

import { DataTable } from '../components/DataTable';
import { Students } from '../data/Data.ts';

export const DynamicGraph = () => {
  const openDataTable = useStore((store) => store.openDialog);

  return (
    <Box className='col-span-3 row-span-5 col-start-3 row-start-3'>
      <BarChart
        barLabel='value'
        className='h-full'
        xAxis={[
          { data: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'] },
        ]}
        series={[
          {
            data: [12, 32, 23, 54, 46],
            color: '#f95f62', // <- color de las barras
          },
        ]}
        onClick={() => {
          openDataTable(<DataTable tableData={Students}></DataTable>, 'p');
        }}
      />
    </Box>
  );
};
