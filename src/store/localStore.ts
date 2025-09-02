import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Estados que se conservan en localStorage
export type AlertType = 'success' | 'error' | 'info' | 'warning';

export type Alert = {
  type: AlertType;
  text: string;
} | null;

export type LocalStore = {
  page: string;
  setPage: (newPage: string) => void;
  alert: Alert;
  setAlert: (newAlert: Alert) => void;
  alertTimeout: number;
  setAlertTimeout: (timeout: number) => void;
};

export const useLocalStore = create<LocalStore>()(
  persist(
    (set): LocalStore => ({
      page: 'login',
      setPage: (newPage) => set({ page: newPage }),
      alert: null,
      setAlert: (newAlert) => set({ alert: newAlert }),
      alertTimeout: 0,
      setAlertTimeout: (timeout) => set({ alertTimeout: timeout }),
    }),
    {
      name: 'localInfo',
    }
  )
);
