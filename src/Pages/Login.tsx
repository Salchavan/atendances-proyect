import { useState, useMemo } from 'react';
import { changePageTitle } from '../Logic';
import { useUserStore } from '../store/UserStore';
import { useCachedStore } from '../store/CachedStore';
import { useNavigate } from 'react-router';
import {
  Box,
  Button,
  CircularProgress,
  FormControl,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { useMutation } from '@tanstack/react-query';
import api, { getStaffById } from '../api/client';

type RoleOption = 'STAFF' | 'PRECEPTOR';

export const Login = () => {
  changePageTitle('Inicio de sesión');

  const navigate = useNavigate();
  const setAlert = useCachedStore((s) => s.setAlert);
  const setAuthData = useUserStore((s) => s.setAuthData);
  const setUserInfo = useUserStore((s) => s.setUserInfo);

  const [role, setRole] = useState<RoleOption>('STAFF');
  const [dni, setDni] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const dniError = useMemo(() => dni.length > 0 && dni.length !== 8, [dni]);
  const isSubmitDisabled = useMemo(
    () => dni.length !== 8 || password.length === 0,
    [dni, password]
  );

  // Mutation that logs in and, on success, fetches extra user info
  const mutation = useMutation({
    mutationKey: ['login', role],
    mutationFn: async () => {
      const url =
        role === 'PRECEPTOR'
          ? 'https://asistenciaescuela.onrender.com/api/v1/auth/preceptor/login'
          : 'https://asistenciaescuela.onrender.com/api/v1/auth/staff/login';
      const body = { dni, password };
      const res = await api.post(url, body);
      return res.data;
    },
    onSuccess: async (data) => {
      // Save base auth payload/token
      setAuthData(data);

      // Try to fetch detailed staff info by id (if available)
      try {
        const id = data?.user?.id ?? data?.user?.dni ?? data?.dni ?? data?.id;
        if (id) {
          const profile = await getStaffById(id);
          setUserInfo(profile);
        }
      } catch {}

      setAlert({ type: 'success', text: 'Inicio de sesión exitoso' });
      navigate('/home');
    },
    onError: () => {
      setAlert({ type: 'error', text: 'DNI o contraseña incorrectos.' });
      setDni('');
      setPassword('');
    },
  });

  const handleSubmit = () => {
    if (!isSubmitDisabled) mutation.mutate();
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <Box
      sx={{
        width: '100vw',
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2,
        gap: 4,
      }}
    >
      <Box
        sx={{
          display: { xs: 'none', md: 'block' },
          maxWidth: 420,
          width: '100%',
        }}
      >
        <Box
          component='img'
          alt='Logo IPETYM 69'
          src='https://www.ipetym69.edu.ar/images/colegiologo.png'
          sx={{
            width: '70%',
            height: 'auto',
            display: 'block',
            objectFit: 'contain',
            borderRadius: 1,
          }}
        />
      </Box>
      <Box
        sx={{ maxWidth: 420, width: '100%', backgroundColor: 'transparent' }}
      >
        <Stack spacing={2} onKeyDown={onKeyDown}>
          <Box>
            <Typography variant='h5'>Inicio de sesión</Typography>
            <Typography variant='body2' color='text.secondary'>
              Selecciona tu rol e ingresa tus credenciales
            </Typography>
          </Box>

          <FormControl fullWidth>
            <InputLabel id='role-label'>Rol</InputLabel>
            <Select
              labelId='role-label'
              label='Rol'
              value={role}
              onChange={(e) => setRole(e.target.value as RoleOption)}
            >
              <MenuItem value='STAFF'>STAFF</MenuItem>
              <MenuItem value='PRECEPTOR'>PRECEPTOR</MenuItem>
            </Select>
          </FormControl>

          <TextField
            label='DNI'
            inputMode='numeric'
            value={dni}
            onChange={(e) =>
              setDni(e.target.value.replace(/\D/g, '').slice(0, 8))
            }
            error={dniError}
            fullWidth
          />

          <TextField
            label='Contraseña'
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            InputProps={{
              endAdornment: (
                <InputAdornment position='end'>
                  <IconButton
                    aria-label='toggle password visibility'
                    onClick={() => setShowPassword((v) => !v)}
                    edge='end'
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            fullWidth
          />

          <Box sx={{ position: 'relative' }}>
            <Button
              variant='contained'
              fullWidth
              disabled={isSubmitDisabled || mutation.isPending}
              onClick={handleSubmit}
            >
              Ingresar
            </Button>
            {mutation.isPending && (
              <CircularProgress
                size={22}
                sx={{
                  position: 'absolute',
                  right: 12,
                  top: '50%',
                  mt: '-11px',
                }}
              />
            )}
          </Box>
        </Stack>
      </Box>
    </Box>
  );
};
