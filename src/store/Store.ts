import { create } from 'zustand';
import { persist } from 'zustand/middleware';
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
type DialogSize = 'big' | 'small' | { width: number; height: number };

type Store = {
  // Control de diálogo modal global
  isDialogOpen: boolean;
  dialogContent: ReactElement | HTMLElementType | null;
  dialogTitle: string;
  dialogSize: DialogSize;
  openDialog: (
    content: ReactElement,
    title?: string,
    size?: DialogSize
  ) => void;
  closeDialog: () => void;
  themeMode: 'light' | 'dark';
  toggleThemeMode: () => void;
  fontFamily: string;
  setFontFamily: (font: string) => void;
  perfilUserSelected: User | undefined;
  setPerfilUserSelected: (user: User | undefined) => void;
  specialDates: string[];
  setSpecialDates: (dates: string[]) => void;
  clearSpecialDates: () => void;
};

export const useStore = create<Store>()(
  persist(
    (set) => ({
      // Modal global
      isDialogOpen: false,
      dialogContent: null,
      dialogTitle: '',
      dialogSize: 'big',
      openDialog: (content, title = '', size = 'big') => {
        set({
          isDialogOpen: true,
          dialogContent: content,
          dialogTitle: title,
          dialogSize: size,
        });
      },
      closeDialog: () =>
        set({
          isDialogOpen: false,
          dialogContent: null,
          dialogTitle: '',
          dialogSize: 'big',
        }),
      themeMode: 'light',
      toggleThemeMode: () =>
        set((state) => ({
          themeMode: state.themeMode === 'light' ? 'dark' : 'light',
        })),
      fontFamily:
        'Poppins, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif',
      setFontFamily: (font) => set({ fontFamily: font }),
      perfilUserSelected: undefined,
      setPerfilUserSelected: (user) => set({ perfilUserSelected: user }),
      specialDates: [],
      setSpecialDates: (dates) =>
        set({ specialDates: Array.from(new Set(dates)) }),
      clearSpecialDates: () => set({ specialDates: [] }),
    }),
    {
      name: 'app-preferences',
      // Only persist the theme mode for now
      partialize: (state) => ({ themeMode: state.themeMode }),
    }
  )
);
