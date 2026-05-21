import { useMemo, useState, type KeyboardEvent } from 'react';
import { changePageTitle } from '../../Logic';
import { useLogin } from '../../hooks/useAuth';
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

type RoleOption = 'STAFF' | 'PRECEPTOR';

export const LoginLocal = () => {
  changePageTitle('Inicio de sesión');

  const loginMutation = useLogin();

  const [role, setRole] = useState<RoleOption>('STAFF');
  const [dni, setDni] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const dniError = useMemo(() => dni.length > 0 && dni.length !== 8, [dni]);
  const isSubmitDisabled = useMemo(
    () => dni.length !== 8 || password.length === 0 || loginMutation.isPending,
    [dni, password, loginMutation.isPending]
  );

  const handleSubmit = () => {
    if (isSubmitDisabled) return;
    loginMutation.mutate({ dni, password, role });
  };

  const onKeyDown = (e: KeyboardEvent) => {
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
              disabled={isSubmitDisabled}
              onClick={handleSubmit}
            >
              {loginMutation.isPending ? 'Ingresando…' : 'Ingresar'}
            </Button>
            {loginMutation.isPending && (
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
