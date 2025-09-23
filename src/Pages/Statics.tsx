import { BoxNull } from '../components/BoxNull';
import { Box } from '@mui/material';
import { changePageTitle } from '../Logic';

export const Statics = () => {
  changePageTitle('Estadisticas');
  return (
    <Box className='col-span-8 row-span-9 grid grid-cols-7 grid-rows-2 gap-2'>
      <BoxNull className='col-span-2 row-span-2' />
      <BoxNull className='col-span-3 row-span-2 col-start-3' />
      <BoxNull className='col-span-2 row-span-2 col-start-6' />
    </Box>
  );
};
