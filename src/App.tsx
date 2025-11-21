import { useEffect, useState, useLayoutEffect, type JSX } from 'react';

// import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

import { useStore } from './store/Store';
import { useCachedStore } from './store/CachedStore';
import { useUserStore } from './store/UserStore';

import { Preset } from './Pages/Preset.tsx';
import { Home } from './Pages/Home';
import { Login } from './Pages/Login.tsx'; // Note: login by api, replaced by LoginLocal
// import { LoginLocal } from './Pages/LoginLocal.tsx';
import { Statics } from './Pages/Statics/Statics.tsx';
import { IndexClassroomsPage } from './Pages/Classrooms/IndexClassroomsPage.tsx';
import { ClassroomPage } from './Pages/Classrooms/ClassroomPage.tsx';
import { MultiProfile } from './Pages/profile/MultiProfile.tsx';
import { Log } from './Pages/Log.tsx';

import { AdminPanel } from './Pages/ControlPanel/ControlPanel.tsx';
import { ControlPanelHome } from './Pages/ControlPanel/ControlPanelHome.tsx';
import { PanelCourses } from './Pages/ControlPanel/PanelCourses.tsx';

import { PanelPreceptors } from './Pages/ControlPanel/PanelPreceptors.tsx';
import { ControlStudents } from './Pages/ControlPanel/ControlStudents.tsx';
import { ControlDivisions } from './Pages/ControlPanel/ControlDivisions.tsx';
import { ControlYears } from './Pages/ControlPanel/ControlYears.tsx';

import { Config } from './Pages/config/Config.tsx';
import { ConfigGeneral } from './Pages/config/ConfigGeneral.tsx';
import { ConfigAccessibility } from './Pages/config/ConfigAccessibility.tsx';
import { ConfigProfile } from './Pages/config/ConfigProfile.tsx';
import { ConfigAbout } from './Pages/config/ConfigAbout.tsx';

import { BrowserRouter, Routes, Route, Navigate } from 'react-router';

import { Alert, CircularProgress, Box } from '@mui/material';

import { CustomModal } from './components/CustomModal';
import { SafeBoundary } from './components/SafeBoundary';

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
      {/* {generateStudents(1500)} */}
      {/* <ReactQueryDevtools initialIsOpen={false} /> */}
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
        <SafeBoundary>
          <Routes>
            {/* Root path should redirect to /home when served at base */}
            <Route path='/' element={<Navigate to='/home' replace />} />
            <Route
              path='/login'
              element={
                userVerified ? <Navigate to='/home' replace /> : <Login />
              }
            />
            <Route path='/control-panel' element={<AdminPanel />}>
              <Route index element={<ControlPanelHome />} />

              <Route path='students' element={<ControlStudents />} />
              <Route path='courses' element={<PanelCourses />} />
              <Route path='divisions' element={<ControlDivisions />} />
              <Route path='years' element={<ControlYears />} />
              <Route path='preceptors' element={<PanelPreceptors />} />
            </Route>
            <Route
              path='/home'
              element={
                <RequireAuth>
                  <Preset />
                </RequireAuth>
              }
            >
              <Route index element={<Home />} />
              <Route path='profile' element={<MultiProfile />} />

              <Route path='statics' element={<Statics />} />

              <Route path='classrooms' element={<IndexClassroomsPage />} />
              <Route path='classrooms/:id' element={<ClassroomPage />} />
              <Route path='log' element={<Log />} />
              <Route path='control-panel' element={<AdminPanel />}>
                <Route index element={<ControlPanelHome />} />

                <Route path='students' element={<ControlStudents />} />
                <Route path='courses' element={<PanelCourses />} />
                <Route path='divisions' element={<ControlDivisions />} />
                <Route path='years' element={<ControlYears />} />
                <Route path='preceptors' element={<PanelPreceptors />} />
              </Route>
              <Route path='config' element={<Config />}>
                <Route index element={<ConfigGeneral />} />
                <Route index path='general' element={<ConfigGeneral />} />
                <Route path='accessibility' element={<ConfigAccessibility />} />
                <Route path='profile' element={<ConfigProfile />} />
                <Route path='about' element={<ConfigAbout />} />
              </Route>
            </Route>
          </Routes>
        </SafeBoundary>
      </BrowserRouter>
    </>
  );
};
