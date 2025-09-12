import { useState, useEffect } from 'react';
import { useCachedStore } from '../Store/CachedStore';
import type { CachedStore } from '../Store/CachedStore';
import { useUserStore } from '../Store/UserStore.ts';

import Button from '@mui/material/Button';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import { users } from '../data/Data.ts';
import { area } from '../data/Data.ts';

import { useNavigate } from 'react-router';

import Logo from '../img/school_logo.png';

export const Login = () => {
  useEffect(() => {
    document.title = 'Inicio de sesion';
  }, []);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [selectedArea, setSelectedArea] = useState<string | null>(null);

  const setAlert = useCachedStore((store: CachedStore) => store.setAlert);
  const logIn = useUserStore((store) => store.logIn);
  const navigate = useNavigate();

  const handleLogin = () => {
    console.log(`[${username}] [${password}] [${selectedArea}]`);
    // Buscar usuario que coincida (case-insensitive)
    const user = users.find(
      (u) =>
        u.Username.toLowerCase() === username.toLowerCase() &&
        u.Password.toLowerCase() === password.toLowerCase() &&
        u.Area.toLowerCase() === (selectedArea?.toLowerCase() || '')
    );

    if (user) {
      setAlert({
        type: 'success',
        text: 'Inicio de sesion exitoso',
      });

      logIn?.(user.Username, user.Area);
      navigate?.('/home');
    } else {
      setAlert({
        type: 'error',
        text: 'Usuario, contraseña o preceptoría incorrectos.',
      });
    }
  };

  return (
    <div className='flex flex-row justify-center items-center w-[100vw] h-[100vh]'>
      <img src={Logo} alt='Logo IPETYM 69' className='mr-20' />
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
            onChange={(e) => setPassword(e.target.value.toLowerCase())}
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
