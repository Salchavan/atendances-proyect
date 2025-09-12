import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type UserStore = {
  username?: string;
  area?: string;
  logIn?: (username: string, area: string) => void;
  logOut?: () => void;
};

export const useUserStore = create<UserStore>()(
  persist(
    (set) => ({
      username: undefined,
      area: undefined,
      logIn: (username: string, area: string) => {
        set({ username, area });
      },
      logOut: () => {
        set({ username: undefined, area: undefined });
      },
    }),
    {
      name: 'user-store', // nombre de la clave en localStorage
    }
  )
);
