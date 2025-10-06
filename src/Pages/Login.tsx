import { useState, useEffect } from 'react';
import type { User } from '../store/UserStore';
import { useCachedStore } from '../store/CachedStore';
import type { CachedStore } from '../store/CachedStore';
import { useUserStore } from '../store/UserStore.ts';
import { changePageTitle } from '../Logic';

import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import { useNavigate } from 'react-router';

import Logo from '../assets/school_logo.png';

export const Login = () => {
  const [users, setUsers] = useState<User[]>([]);
  changePageTitle('Inicio de sesión');

  useEffect(() => {
    document.title = 'Inicio de sesion';
    // Dynamic import for users
    (async () => {
      const usersData = (await import('../../public/data/users.json')).default;
      setUsers(usersData);
    })();
  }, []);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const setAlert = useCachedStore((store: CachedStore) => store.setAlert);
  const logIn = useUserStore((store) => store.logIn);
  const navigate = useNavigate();

  const handleLogin = () => {
    console.log(`[${email}] [${password}]`);
    // Buscar usuario que coincida (case-insensitive)
    const user = users.find(
      (u) =>
        u.email.toLowerCase() === email.toLowerCase() &&
        u.password.toLowerCase() === password.toLowerCase()
    );

    if (user) {
      setAlert({
        type: 'success',
        text: 'Inicio de sesion exitoso',
      });

      logIn?.(user.email, user.password);
      navigate?.('/home');
    } else {
      setAlert({
        type: 'error',
        text: 'Email o contraseña incorrectos.',
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
            label='Email'
            type='email'
            variant='outlined'
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <TextField
            label='Contraseña'
            variant='outlined'
            type='password'
            value={password}
            onChange={(e) => setPassword(e.target.value.toLowerCase())}
          />
          <Button variant='contained' onClick={handleLogin}>
            Ingresar
          </Button>
        </div>
      </div>
    </div>
  );
};
