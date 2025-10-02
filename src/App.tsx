import { useEffect, useState, useLayoutEffect, type JSX } from 'react';

import { useStore } from './store/Store';
import { useCachedStore } from './store/CachedStore';
import { useUserStore } from './store/UserStore';

import { Index } from './Pages/Index.tsx';
import { Home } from './Pages/Home';
import { Login } from './Pages/Login.tsx';
import { Statics } from './Pages/Statics.tsx';
import { IndexClassroomsPage } from './Pages/Classrooms/IndexClassroomsPage.tsx';
import { ClassroomPage } from './Pages/Classrooms/ClassroomPage.tsx';
import { AdminPanel } from './Pages/AdminPanel.tsx';
import { Config } from './Pages/config/Config.tsx';

import { BrowserRouter, Routes, Route, Navigate } from 'react-router';

import { Alert, CircularProgress, Box } from '@mui/material';
import { CustomModal } from './components/CustomModal';
import { Profile } from './Pages/Profile.tsx';
import { ConfigGeneral } from './Pages/config/ConfigGeneral.tsx';
import { ConfigAccessibility } from './Pages/config/ConfigAccessibility.tsx';

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

      <BrowserRouter basename='/atendances-proyect'>
        {isDialogOpen && <CustomModal />}
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
            path='/home'
            element={
              <RequireAuth>
                <Index />
              </RequireAuth>
            }
          >
            <Route index element={<Home />} />
            <Route path='profile' element={<Profile />} />
            <Route path='statics' element={<Statics />} />
            <Route path='config' element={<Config />}>
              <Route index element={<ConfigGeneral />} />
              <Route path='general' element={<ConfigGeneral />} />
              <Route path='accessibility' element={<ConfigAccessibility />} />
            </Route>
            <Route path='classrooms' element={<IndexClassroomsPage />} />
            <Route path='classrooms/:id' element={<ClassroomPage />} />

            <Route
              path='admin-panel'
              element={
                <RequireAuth>
                  <AdminPanel />
                </RequireAuth>
              }
            />
          </Route>
        </Routes>
      </BrowserRouter>
    </>
  );
};
