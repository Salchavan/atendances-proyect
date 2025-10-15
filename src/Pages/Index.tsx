import { Box } from '@mui/material';

import { AsideMenu } from '../components/AsideMenu';
import { Navbar } from '../components/Navbar';
import { Outlet } from 'react-router';
import { SafeBoundary } from '../components/SafeBoundary';

export const Index = () => {
  return (
    <SafeBoundary>
      <Box className='h-[100vh] w-[100vw] p-2 grid grid-cols-10 grid-rows-10 gap-2 overflow-hidden'>
        <AsideMenu grid='col-span-2 row-span-10' />
        <Navbar grid='col-span-8 col-start-3' />
        <Box className='col-span-8 row-span-9 col-start-3 row-start-2 grid grid-cols-8 grid-rows-9 gap-2'>
          <SafeBoundary>
            <Outlet />
          </SafeBoundary>
        </Box>
      </Box>
    </SafeBoundary>
  );
};
