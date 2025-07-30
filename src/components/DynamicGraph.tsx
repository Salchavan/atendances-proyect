import { Box } from '@mui/material';
import { BarChart } from '@mui/x-charts';

export const DynamicGraph = () => {
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
      />
    </Box>
  );
};
