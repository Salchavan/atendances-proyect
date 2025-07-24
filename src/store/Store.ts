import { create } from 'zustand';

type Store = {
  page: string;
  setPage: (newPage: string) => void;
  alert: {
    type: 'success' | 'error' | 'info' | 'warning';
    text: string;
  } | null;
  setAlert: (
    newAlert: {
      type: 'success' | 'error' | 'info' | 'warning';
      text: string;
    } | null
  ) => void;
  alertTimeout: number;
  setAlertTimeout: (alertTimeout: number) => void;
};

export const useStore = create<Store>((set) => ({
  page: 'login',
  setPage: (newPage) => set({ page: newPage }),
  alert: null,
  setAlert: (newAlert) => set({ alert: newAlert }),
  alertTimeout: 0,
  setAlertTimeout: (newTime) => set({ alertTimeout: newTime }),
}));
