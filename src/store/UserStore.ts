import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// New users.json schema compatibility
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
  logIn: (email: string, password: string) => Promise<void>;
  logOut: () => void;
};

export const useUserStore = create<UserStore>()(
  persist(
    (set) => ({
      userData: undefined,
      userVerified: false,
      logIn: async (email: string, password: string) => {
        const users: User[] = (await import('../../public/data/users.json'))
          .default;
        const foundUser = users.find(
          (u: User) =>
            u.email.toLowerCase() === email.toLowerCase() &&
            u.password.toLowerCase() === password.toLowerCase()
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
