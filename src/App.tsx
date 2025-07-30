import { useEffect } from 'react';

import { useStore, useLocalStore } from './store/Store';

import { Login } from './login/Login';
import { Main } from './main/Main';
import { Statics } from './statics/Statics';
import { PageMenu } from './components/PageMenu';

import { Alert } from '@mui/material';
import { CustomDialog } from './components/CustomDialog';

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

      {isDialogOpen && <CustomDialog />}
      {page === 'login' ? (
        <Login />
      ) : page === 'main' ? (
        <Main />
      ) : page === 'statics' ? (
        <Statics />
      ) : null}
    </>
  );
};
