import { useEffect } from 'react';
import { AsideMenu } from './components/AsideMenu';
import { Navbar } from './components/Navbar';
import { Toolbar } from './components/Toolbar';
import { DynamicGraph } from '../components/DynamicGraph';
import { Box } from '@mui/material';
import { AsideEvents } from './components/AsideEvents';

export const Main = () => {
  useEffect(() => {
    document.title = 'Inicio';
  }, []);
  return (
    <Box className='h-[100vh] w-[100vw] p-2 grid grid-cols-7 grid-rows-7 gap-2'>
      <AsideMenu />
      <Navbar />
      <Toolbar />
      <DynamicGraph />
      <AsideEvents />
    </Box>
  );
};
