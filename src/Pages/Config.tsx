import { Box } from '@mui/material';
import { BoxNull } from '../components/BoxNull';

export const Config = () => {
  return (
    <Box className='col-span-8 row-span-9 grid grid-cols-7 gap-2'>
      <BoxNull grid='col-span-2' />
      <BoxNull grid='col-span-6 col-start-3' />
    </Box>
  );
};
