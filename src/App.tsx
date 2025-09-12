import { useEffect } from 'react';

import { useStore } from './Store/Store.ts';
import { useCachedStore } from './Store/CachedStore.ts';

import { Index } from './Pages/Index.tsx';
import { Home } from './Pages/Home';
import { Login } from './Pages/Login.tsx';
import { Statics } from './Pages/Statics.tsx';

import { BrowserRouter, Routes, Route } from 'react-router';

import { Alert } from '@mui/material';
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
      {/* {generateRandomStudent(1)} */}
      {isDialogOpen && <CustomModal />}
      <BrowserRouter>
        <Routes>
          <Route path='/login' element={<Login />} />
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
