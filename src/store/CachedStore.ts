import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ===============================
// Estados persistentes (localStorage)
// Estos estados se mantienen aunque se recargue la página.
// ===============================

/**
 * Tipos de alerta para notificaciones globales
 */
export type AlertType = 'success' | 'error' | 'info' | 'warning';

/**
 * Estructura de una alerta global
 */
export type Alert = {
  type: AlertType;
  text: string;
} | null;

/**
 * Estado persistente global (se guarda en localStorage)
 */
export type CachedStore = {
  // Alerta global (snackbar, toast, etc)
  alert: Alert;
  setAlert: (newAlert: Alert) => void;

  // Timeout para auto-cierre de alertas
  alertTimeout: number;
  setAlertTimeout: (timeout: number) => void;
};

/**
 * Hook global de estado persistente (zustand + persist)
 */
export const useCachedStore = create<CachedStore>()(
  persist(
    (set): CachedStore => ({
      alert: null,
      setAlert: (newAlert) => set({ alert: newAlert }),
      alertTimeout: 0,
      setAlertTimeout: (timeout) => set({ alertTimeout: timeout }),
    }),
    {
      name: 'localInfo', // clave en localStorage
    }
  )
);
