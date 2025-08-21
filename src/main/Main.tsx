import { useEffect } from 'react';
import { AsideMenu } from './components/AsideMenu';
import { Navbar } from './components/Navbar';
import { Toolbar } from './components/Toolbar';
import { DynamicGraph } from '../components/DynamicGraph';
import { Box } from '@mui/material';
import { AsideEvents } from './components/AsideEvents';
import { useLocalStore } from '../store/Store.ts';
import { Perfil } from './perfil/Perfil.tsx';

import 'rsuite/dist/rsuite.min.css';

export const Main = () => {
  const page = useLocalStore((store) => store.page);
  useEffect(() => {
    document.title = 'Inicio';
  }, []);
  return (
    <>
      {page === 'main' ? (
        <Box className='h-[100vh] w-[100vw] p-2 grid grid-cols-10 grid-rows-10 gap-2'>
          <AsideMenu />
          <Navbar />
          <Toolbar />
          <DynamicGraph dataTableName='Ultimos 5 dias escolares' />
          <AsideEvents />
        </Box>
      ) : page === 'perfil' ? (
        <Perfil />
      ) : (
        console.log('error')
      )}
    </>
  );
};
