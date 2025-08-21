import { Box } from '@mui/material';
import { AsideMenu } from '../components/AsideMenu';
import { Navbar } from '../components/Navbar';
import { useEffect } from 'react';

export const Perfil = () => {
  useEffect(() => {
    document.title = 'Estadisticas';
  }, []);
  return (
    <Box className='h-[100vh] w-[100vw] p-2 grid grid-cols-10 grid-rows-10 gap-2'>
      <AsideMenu />
      <Navbar />
    </Box>
  );
};
