import { useState, useEffect } from 'react';
import { useLocalStore } from '../store/localStore';

import Button from '@mui/material/Button';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import { users } from '../data/Data.ts';
import { area } from '../data/Data.ts';

export const Login = () => {
  useEffect(() => {
    document.title = 'Inicio de sesion';
  }, []);

  const setPage = useLocalStore((store) => store.setPage);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [selectedArea, setSelectedArea] = useState<string | null>(null);

  const setError = useLocalStore((store) => store.setAlert);

  const handleLogin = () => {
    console.log(`[${username}] [${password}] [${selectedArea}]`);
    // Buscar usuario que coincida
    const user = users.find(
      (u) =>
        u.Username == username &&
        u.Password === password &&
        u.Area === selectedArea
    );

    if (user) {
      setError({
        type: 'success',
        text: 'Inicio de sesion exitoso',
      });
      setPage('main');
    } else {
      setError({
        type: 'error',
        text: 'Usuario, contraseña o preceptoría incorrectos.',
      });
    }
  };

  return (
    <div className='flex flex-row justify-center items-center w-[100vw] h-[100vh]'>
      <img
        src='https://www.ipetym69.edu.ar/images/colegiologo.png'
        alt='Logo IPETYM 69'
        className='mr-20'
      />
      <div className='flex flex-col justify-center items-center'>
        <Typography variant='h2' component='h1' className='text-center'>
          Inicio de sesión
        </Typography>

        <div className='flex flex-col gap-2 w-100 mt-6'>
          <TextField
            label='Usuario'
            variant='outlined'
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <TextField
            label='Contraseña'
            variant='outlined'
            type='password'
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Autocomplete
            options={area}
            getOptionLabel={(option) => option.AreaName}
            onChange={(_, newValue) =>
              setSelectedArea(newValue ? newValue.AreaName : null)
            }
            renderInput={(params) => (
              <TextField {...params} label='Seleccione una preceptoría' />
            )}
          />
          <Button variant='contained' onClick={handleLogin}>
            Ingresar
          </Button>
        </div>
      </div>
    </div>
  );
};
