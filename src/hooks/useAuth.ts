import { useMutation } from '@tanstack/react-query';
import { loginStaff, loginPreceptor } from '../api/client';
import { useUserStore } from '../store/UserStore';
import { useCachedStore } from '../store/CachedStore';
import { useNavigate } from 'react-router';
import { AxiosError } from 'axios';
import type { LoginStaffResponse, LoginPreceptorResponse } from '../api/client';

export function useLogin() {
  const setUserData = useUserStore((s) => s.setUserData);
  const setUserVerified = useUserStore((s) => s.setUserVerified);
  const setUserAuthData = useUserStore((s) => s.setUserAuthData);
  const setAlert = useCachedStore((s) => s.setAlert);
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async ({
      dni,
      password,
      role,
    }: {
      dni: string;
      password: string;
      role: 'STAFF' | 'PRECEPTOR';
    }) => {
      const fn = role === 'STAFF' ? loginStaff : loginPreceptor;
      return fn({ dni, password });
    },
    onSuccess: (data) => {
      const staffData = data as LoginStaffResponse;
      const preceptorData = data as LoginPreceptorResponse;

      const user = staffData.user ?? null;
      const preceptor = preceptorData.preceptor ?? null;

      const authToken = staffData.token ?? preceptorData.token ?? '';
      const refToken = staffData.refreshToken ?? preceptorData.refreshToken ?? '';
      const refExp = staffData.refreshExpiresAt ?? preceptorData.refreshExpiresAt ?? '';

      setUserAuthData({
        token: authToken,
        refreshToken: refToken,
        refreshExpiresAt: refExp,
      });

      if (user) {
        setUserData({
          id: user.id,
          dni: user.dni,
          first_name: user.first_name,
          last_name: user.last_name,
          email: '',
          role: user.role,
        });
      } else if (preceptor) {
        setUserData({
          id: preceptor.id,
          dni: preceptor.dni,
          first_name: '',
          last_name: '',
          email: '',
          role: 'PRECEPTOR',
        });
      }

      setUserVerified(true);
      setAlert({ type: 'success', text: 'Inicio de sesión exitoso' });
      navigate('/home');
    },
    onError: (error: AxiosError) => {
      const status = error.response?.status ?? error.code ?? 'UNKNOWN';
      setAlert({
        type: 'error',
        text: `Error al iniciar sesión (${status})`,
      });
    },
  });
}
