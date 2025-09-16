import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type User = {
  Username: string;
  Password: string;
  Area: string;
};

type UserStore = {
  userData?: User | undefined;
  userVerified: boolean;
  logIn: (username: string, area: string) => Promise<void>;
  logOut: () => void;
};

export const useUserStore = create<UserStore>()(
  persist(
    (set) => ({
      userData: undefined,
      userVerified: false,
      logIn: async (username: string, area: string) => {
        const users: User[] = (await import('../data/users.json')).default;
        const foundUser = users.find(
          (u: User) => u.Username === username && u.Area === area
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
