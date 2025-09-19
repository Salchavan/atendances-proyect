import { useEffect, useState, useLayoutEffect, type JSX } from 'react';

import { useStore } from './Store/Store.ts';
import { useCachedStore } from './Store/CachedStore.ts';
import { useUserStore } from './Store/UserStore.ts';

import { Index } from './Pages/Index.tsx';
import { Home } from './Pages/Home';
import { Login } from './Pages/Login.tsx';
import { Statics } from './Pages/Statics.tsx';
import { ControlPanel } from './Pages/ControlPanel.tsx';
import { AdminPanel } from './Pages/AdminPanel.tsx';
import { Config } from './Pages/Config.tsx';

import { BrowserRouter, Routes, Route, Navigate } from 'react-router';

import { Alert, CircularProgress, Box } from '@mui/material';
import { CustomModal } from './components/CustomModal';
import { Perfil } from './Pages/Perfil.tsx';

export const App = () => {
  const alert = useCachedStore((store) => store.alert);
  const setAlert = useCachedStore((store) => store.setAlert);
  const isDialogOpen = useStore((store) => store.isDialogOpen);
  const userVerified = useUserStore((store) => store.userVerified);

  // Wrapper para rutas privadas: si no está verificado, redirige a login
  const RequireAuth = ({ children }: { children: JSX.Element }) => {
    if (!userVerified) {
      return <Navigate to='/login' replace />;
    }
    return children;
  };

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

      <BrowserRouter basename='/atendances-proyect'>
        <Routes>
          <Route
            path='/'
            element={
              userVerified ? (
                <Navigate to='/home' replace />
              ) : (
                <Navigate to='/login' replace />
              )
            }
          />
          <Route
            path='/login'
            element={userVerified ? <Navigate to='/home' replace /> : <Login />}
          />

          <Route
            path='/control-panel'
            element={
              <RequireAuth>
                <ControlPanel />
              </RequireAuth>
            }
          />
          <Route
            path='/admin-panel'
            element={
              <RequireAuth>
                <AdminPanel />
              </RequireAuth>
            }
          />
          <Route
            path='/home'
            element={
              <RequireAuth>
                <Index />
              </RequireAuth>
            }
          >
            <Route index element={<Home />} />
            <Route path='perfil' element={<Perfil />} />
            <Route path='statics' element={<Statics />} />
            <Route path='config' element={<Config />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </>
  );
};
