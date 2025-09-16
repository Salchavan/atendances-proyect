import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { users } from '../data/Data.ts';

type User = (typeof users)[number];

type UserStore = {
  userData?: User | undefined;
  userVerified: boolean;
  logIn: (username: string, area: string) => void;
  logOut: () => void;
};

export const useUserStore = create<UserStore>()(
  persist(
    (set) => ({
      userData: undefined,
      userVerified: false,
      logIn: (username: string, area: string) => {
        const foundUser = users.find(
          (u) => u.Username === username && u.Area === area
        );
        if (foundUser) {
          set({ userData: foundUser, userVerified: true });
        } else {
          set({ userData: undefined, userVerified: false });
        }
      },
      logOut: () => {
        set({ userData: undefined, userVerified: false });
      },
    }),
    {
      name: 'user-store', // nombre de la clave en localStorage
    }
  )
);
