import { create } from 'zustand';
import { type ReactElement } from 'react';
import { type HTMLElementType } from 'react';
import { users } from '../data/Data.ts';

export type Store = {
  // Control de diálogo modal global
  isDialogOpen: boolean;
  dialogContent: ReactElement | HTMLElementType | null;
  dialogTitle: string;
  openDialog: (content: ReactElement, title?: string) => void;
  closeDialog: () => void;
  themeMode: 'light' | 'dark';
  toggleThemeMode: () => void;
  perfilUserSelected: (typeof users)[number] | undefined;
  setPerfilUserSelected: (user: (typeof users)[number] | undefined) => void;
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
