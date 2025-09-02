import { useEffect } from 'react';

import { useStore } from './store/Store';
import { useLocalStore } from './store/localStore';

import { Login } from './login/Login';
import { Main } from './main/Main';
import { PageMenu } from './components/PageMenu';
import { PageError } from './components/PageError';

import { Alert } from '@mui/material';
import { CustomModal } from './components/CustomModal';

import {generateRandomStudent} from './data/randStudents';

export const App = () => {
  const page = useLocalStore((store) => store.page);
  const alert = useLocalStore((store) => store.alert);
  const setAlert = useLocalStore((store) => store.setAlert);
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
      <PageMenu />

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

      {page === 'login' ? (
        <Login />
      ) : page === 'main' || page === 'perfil' || page === 'statics' ? (
        <Main />
      ) : (
        <PageError />
      )}
    </>
  );
};
