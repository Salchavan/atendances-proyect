import { useEffect } from 'react';

import { useStore } from './store/Store';

import { Login } from './login/Login';
import { Main } from './main/Main';
import { Statics } from './statics/Statics';
import { PageMenu } from './components/PageMenu';

import { Alert } from '@mui/material';

export const App = () => {
  const page = useStore((store) => store.page);
  const alert = useStore((store) => store.alert);
  const setAlert = useStore((store) => store.setAlert);

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
      <div className='absolute w-full mt-7 flex flex-col items-center gap-2 px-4'>
        {alert && (
          <>
            <Alert
              className='m-auto w-full max-w-lg'
              severity={alert.type}
              onClose={() => setAlert(null)}
            >
              {alert.text}
            </Alert>
          </>
        )}
      </div>

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
