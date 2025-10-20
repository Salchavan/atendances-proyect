import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Generic user shape for app usage
export type User = {
  id: number | string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  rol: string; // numeric role id
};

type UserStore = {
  userData?: User | undefined;
  userVerified: boolean;
  logOut: () => void;
  // API auth data (raw response)
  authToken?: string;
  authPayload?: any;
  setAuthData: (payload: any | undefined) => void;
  authExpiresAt?: number; // epoch ms
  isAuthValid: () => boolean;
  // Optional detailed user info fetched after login
  authUserInfo?: any;
  setUserInfo: (info: any | undefined) => void;
};

export const useUserStore = create<UserStore>()(
  persist(
    (set) => ({
      userData: undefined,
      userVerified: false,
      authToken: undefined,
      authPayload: undefined,
      authExpiresAt: undefined,
      authUserInfo: undefined,
      // Clear all auth-related state
      logOut: () => {
        set({
          userData: undefined,
          userVerified: false,
          authToken: undefined,
          authPayload: undefined,
          authExpiresAt: undefined,
          authUserInfo: undefined,
        });
      },
      // Persist whatever the API returns (token, user, role, etc.)
      setAuthData: (payload) => {
        const token = payload?.token || payload?.accessToken || undefined;
        // Try to infer expiration from payload if available (exp in seconds or ms)
        let exp: number | undefined = undefined;
        const expVal =
          payload?.exp || payload?.expiresAt || payload?.expires_in;
        if (typeof expVal === 'number') {
          // Heuristic: if it's less than a year in seconds, assume seconds
          exp = expVal < 10_000_000_000 ? Date.now() + expVal * 1000 : expVal;
        }
        set({
          authPayload: payload,
          authToken: token,
          userVerified: !!payload,
          authExpiresAt: exp,
        });
      },
      isAuthValid: () => {
        const state = useUserStore.getState() as UserStore;
        if (!state.authToken) return false;
        if (!state.authExpiresAt) return true; // no exp provided => treat as valid
        return Date.now() < state.authExpiresAt;
      },
      setUserInfo: (info) => {
        // Store raw info and map to userData best-effort for UI usage
        const firstName = info?.first_name ?? info?.firstName ?? '';
        const lastName = info?.last_name ?? info?.lastName ?? '';
        const mapped: User | undefined = info
          ? {
              id: info?.id ?? info?.dni ?? '',
              firstName,
              lastName,
              email: info?.email ?? '',
              password: '',
              rol: String(info?.role ?? info?.rol ?? ''),
            }
          : undefined;
        set({ authUserInfo: info, userData: mapped });
      },
    }),
    {
      name: 'user-store', // localStorage key
    }
  )
);
