import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Generic user shape for app usage
export type UserData = {
  id: number | string;
  dni: number;
  first_name: string;
  last_name: string;
  email?: string;
  role: string; // numeric role id
};

type UserAuthData = {
  authToken: string;
  refreshToken: string;
  refreshExpiresAt: string; // epoch ms
};

type UserStore = {
  userData?: UserData | undefined;
  userVerified: boolean;
  userAuthData?: UserAuthData | undefined;
  logOut: () => void;
  setUserData: (info: any | undefined) => void;
  setUserVerified: (verified: boolean) => void;
  setUserAuthData: (authData: LoginPayload | undefined) => void;
};

type LoginPayload = {
  token: string;
  refreshToken: string;
  refreshExpiresAt: string;
};

export const useUserStore = create<UserStore>()(
  persist(
    (set) => ({
      userData: undefined,
      userVerified: false,
      userAuthData: undefined,

      // Clear all auth-related state
      logOut: () => {
        set({
          userData: undefined,
          userVerified: false,
          userAuthData: undefined,
        });
      },

      setUserData: (data) => {
        console.log('Setting user data with info:', data);
        // Store raw info and map to userData best-effort for UI usage
        const mapped: UserData | undefined = data
          ? {
              id: data?.id,
              dni: data?.dni,
              first_name: data?.first_name,
              last_name: data?.last_name,
              email: data?.email ?? '',
              role: data?.role,
            }
          : undefined;

        set({ userData: mapped });
        console.log('User data set:', mapped);
      },
      setUserVerified: (verified) => {
        set({ userVerified: verified });
        console.log('User verified set:', verified);
      },
      setUserAuthData: (data?: LoginPayload) => {
        console.log('Setting user auth data with:', data);
        const mapped: UserAuthData | undefined = data
          ? {
              authToken: data?.token,
              refreshToken: data?.refreshToken,
              refreshExpiresAt: data?.refreshExpiresAt,
            }
          : undefined;

        set({ userAuthData: mapped });
        console.log('User auth data set:', mapped);
      },
    }),
    {
      name: 'user-store', // localStorage key
    }
  )
);
