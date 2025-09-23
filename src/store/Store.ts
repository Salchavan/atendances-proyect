import { create } from 'zustand';
import { type ReactElement } from 'react';
import { type HTMLElementType } from 'react';

// Generic user shape used across the app; supports both legacy and new schema
type User = {
  // new fields
  id?: number | string;
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
  rol?: number;
  // legacy fields kept for backward compat in components using Perfil
  Username?: string;
  Area?: string;
  Role?: string;
  Active?: boolean;
  ID?: string | number;
  DNI?: string | number;
};
type Store = {
  // Control de diálogo modal global
  isDialogOpen: boolean;
  dialogContent: ReactElement | HTMLElementType | null;
  dialogTitle: string;
  openDialog: (content: ReactElement, title?: string) => void;
  closeDialog: () => void;
  themeMode: 'light' | 'dark';
  toggleThemeMode: () => void;
  perfilUserSelected: User | undefined;
  setPerfilUserSelected: (user: User | undefined) => void;
};

export const useStore = create<Store>((set) => ({
  // Modal global
  isDialogOpen: false,
  dialogContent: null,
  dialogTitle: '',
  openDialog: (content, title = '') => {
    set({
      isDialogOpen: true,
      dialogContent: content,
      dialogTitle: title,
    });
  },
  closeDialog: () =>
    set({
      isDialogOpen: false,
      dialogContent: null,
      dialogTitle: '',
    }),
  themeMode: 'light',
  toggleThemeMode: () =>
    set((state) => ({
      themeMode: state.themeMode === 'light' ? 'dark' : 'light',
    })),
  perfilUserSelected: undefined,
  setPerfilUserSelected: (user) => set({ perfilUserSelected: user }),
}));
