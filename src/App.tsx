import { useEffect, useState, useLayoutEffect } from 'react';

import { useStore } from './Store/Store.ts';
import { useCachedStore } from './Store/CachedStore.ts';

import { Index } from './Pages/Index.tsx';
import { Home } from './Pages/Home';
import { Login } from './Pages/Login.tsx';
import { Statics } from './Pages/Statics.tsx';
import { ControlPanel } from './Pages/ControlPanel.tsx';
import { AdminPanel } from './Pages/AdminPanel.tsx';
import { Config } from './Pages/Config.tsx';

import { BrowserRouter, Routes, Route } from 'react-router';

import { Alert, CircularProgress, Box } from '@mui/material';
import { CustomModal } from './components/CustomModal';
import { Perfil } from './Pages/Perfil.tsx';

export const App = () => {
  const alert = useCachedStore((store) => store.alert);
  const setAlert = useCachedStore((store) => store.setAlert);
  const isDialogOpen = useStore((store) => store.isDialogOpen);

  useEffect(() => {
    if (alert) {
      const timeout = setTimeout(() => {
        setAlert(null);
      }, 3000);

      return () => {
        clearTimeout(timeout);
      }; // limpia si cambia antes
    }
  }, [alert, setAlert]);
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
    <>
      {alert && (
        <div className='absolute w-full mt-7 flex flex-col items-center gap-2 px-4'>
          <Alert
            className='m-auto w-full max-w-lg'
            severity={alert.type}
            onClose={() => setAlert(null)}
          >
            {alert.text}
          </Alert>
        </div>
      )}
      {isDialogOpen && <CustomModal />}
      <BrowserRouter>
        <Routes>
          <Route path='/login' element={<Login />} />
          <Route path='/control-panel' element={<ControlPanel />} />
          <Route path='/admin-panel' element={<AdminPanel />} />
          <Route path='/config' element={<Config />} />
          <Route path='/home' element={<Index />}>
            <Route index element={<Home />} />
            <Route path='perfil' element={<Perfil />} />
            <Route path='statics' element={<Statics />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </>
  );
};
