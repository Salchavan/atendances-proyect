import { useMemo, useState, type KeyboardEvent } from 'react';
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
import { Users } from '../utils/imports';

type RoleOption = 'STAFF' | 'PRECEPTOR';

type StudentShape = {
  id?: unknown;
  dni?: unknown;
  first_name?: unknown;
  firstName?: unknown;
  last_name?: unknown;
  lastName?: unknown;
  email?: unknown;
};

type LocalLoginTokens = {
  token: string;
  refreshToken: string;
  refreshExpiresAt: string;
};

type LocalLoginResult = {
  auth: LocalLoginTokens;
  user: {
    id: number | string;
    dni: number;
    first_name: string;
    last_name: string;
    email?: string;
    role: string;
  };
};

const locateStudent = (dniInput: string): StudentShape | undefined => {
  const sanitized = dniInput.trim();
  if (!sanitized) return undefined;

  return (Users as StudentShape[]).find((candidate) => {
    const byDni =
      candidate.dni !== undefined ? String(candidate.dni) : undefined;
    const byId = candidate.id !== undefined ? String(candidate.id) : undefined;
    return byDni === sanitized || byId === sanitized;
  });
};

const toLocalResult = (
  record: StudentShape,
  role: RoleOption,
  dniFallback: string
): LocalLoginResult => {
  const idValue = record.id ?? dniFallback;
  const resolvedId =
    typeof idValue === 'number' || typeof idValue === 'string'
      ? idValue
      : dniFallback;
  const dniValue =
    record.dni !== undefined ? Number(record.dni) : Number(resolvedId);
  const safeDni = Number.isFinite(dniValue) ? dniValue : Number(dniFallback);

  const firstName = String(record.first_name ?? record.firstName ?? '');
  const lastName = String(record.last_name ?? record.lastName ?? '');
  const email = record.email ? String(record.email) : undefined;

  const tokenSeed = String(resolvedId);
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();

  return {
    auth: {
      token: `local-${tokenSeed}`,
      refreshToken: `local-${tokenSeed}-refresh`,
      refreshExpiresAt: expiresAt,
    },
    user: {
      id: resolvedId,
      dni: safeDni,
      first_name: firstName,
      last_name: lastName,
      email,
      role,
    },
  };
};

export const LoginLocal = () => {
  changePageTitle('Inicio de sesión (local)');

  const navigate = useNavigate();
  const setAlert = useCachedStore((s) => s.setAlert);
  const setUserData = useUserStore((s) => s.setUserData);
  const setUserVerified = useUserStore((s) => s.setUserVerified);
  const setUserAuthData = useUserStore((s) => s.setUserAuthData);

  const [role, setRole] = useState<RoleOption>('STAFF');
  const [dni, setDni] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const dniError = useMemo(() => dni.length > 0 && dni.length !== 8, [dni]);
  const isSubmitDisabled = useMemo(
    () => dni.length !== 8 || password.length === 0,
    [dni, password]
  );

  const handleSubmit = () => {
    if (isSubmitDisabled || isSubmitting) return;

    setIsSubmitting(true);

    try {
      const record = locateStudent(dni);
      if (!record) {
        throw new Error('STUDENT_NOT_FOUND');
      }

      const { auth, user } = toLocalResult(record, role, dni);

      setUserVerified(true);
      setUserAuthData(auth);
      setUserData(user);
      setAlert({
        type: 'success',
        text: 'Inicio de sesión exitoso (modo local)',
      });
      navigate('/home');
    } catch (error) {
      console.error('Error during local login:', error);
      setAlert({
        type: 'error',
        text: 'No se encontró el usuario en Students.json.',
      });
      setDni('');
      setPassword('');
    } finally {
      setIsSubmitting(false);
    }
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
              disabled={isSubmitDisabled || isSubmitting}
              onClick={handleSubmit}
            >
              Ingresar
            </Button>
            {isSubmitting && (
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
