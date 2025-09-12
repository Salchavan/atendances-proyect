import { Box, CircularProgress } from '@mui/material';
import { useLayoutEffect, useState } from 'react';
import { AsideMenu } from '../components/AsideMenu';
import { Navbar } from '../components/Navbar';
import { Outlet } from 'react-router';

export const Index = () => {
  const [loading, setLoading] = useState(true);

  useLayoutEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <Box
        display='flex'
        alignItems='center'
        justifyContent='center'
        height='100vh'
        width='100vw'
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box className='h-[100vh] w-[100vw] p-2 grid grid-cols-10 grid-rows-10 gap-1 overflow-hidden'>
      <AsideMenu grid='col-span-2 row-span-10' />
      <Navbar grid='col-span-8 col-start-3' />
      <Box className='col-span-8 row-span-9 col-start-3 row-start-2 grid grid-cols-8 grid-rows-9 gap-1'>
        <Outlet />
      </Box>
    </Box>
  );
};
