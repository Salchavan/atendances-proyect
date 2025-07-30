import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { type ReactElement } from 'react';
import { type HTMLElementType } from 'react';

type AlertType = 'success' | 'error' | 'info' | 'warning';

type Alert = {
  type: AlertType;
  text: string;
} | null;

type localStore = {
  page: string;
  setPage: (newPage: string) => void;
  alert: Alert;
  setAlert: (newAlert: Alert) => void;
  alertTimeout: number;
  setAlertTimeout: (timeout: number) => void;
};

export const useLocalStore = create<localStore>()(
  persist(
    (set): localStore => ({
      page: 'login',
      setPage: (newPage) => set({ page: newPage }),
      alert: null,
      setAlert: (newAlert) => set({ alert: newAlert }),
      alertTimeout: 0,
      setAlertTimeout: (timeout) => set({ alertTimeout: timeout }),
    }),
    {
      name: 'localInfo', // nombre de la clave en localStorage
    }
  )
);

type Store = {
  isDialogOpen: boolean;
  dialogContent: ReactElement | HTMLElementType | null;
  dialogTitle: string;
  openDialog: (content: ReactElement, title?: string) => void;
  closeDialog: () => void;
};

export const useStore = create<Store>()(
  (set): Store => ({
    isDialogOpen: false,
    dialogContent: null,
    dialogTitle: '',
    openDialog: (content, title = '') => {
      console.log('openDialog');
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
  })
);
