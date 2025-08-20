import { create } from 'zustand';
import { persist, devtools } from 'zustand/middleware';
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

export type DayFilter =
  | 'all'
  | 'weekdays'
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday';

export interface FilterState {
  globalSearch: string;
  dayFilter: DayFilter;
  setGlobalSearch: (search: string) => void;
  setDayFilter: (filter: DayFilter) => void;
  clearAllFilters: () => void;
  getFilteredData: (data: any[]) => any[];
}

export const useFilterStore = create<FilterState>()(
  devtools((set, get) => ({
    globalSearch: '',
    dayFilter: 'all',

    setGlobalSearch: (search: string) => {
      set({ globalSearch: search });
    },

    setDayFilter: (filter: DayFilter) => {
      set({ dayFilter: filter });
    },

    clearAllFilters: () => {
      set({ globalSearch: '', dayFilter: 'all' });
    },

    getFilteredData: (data: any[]) => {
      const { globalSearch, dayFilter } = get();

      return data.filter((row) => {
        // Filtro de búsqueda global
        const searchMatch =
          !globalSearch ||
          Object.entries(row).some(([key, value]) => {
            // Excluir arrays complejos de la búsqueda
            if (key === 'unassistences' || Array.isArray(value)) return false;
            return value
              ?.toString()
              .toLowerCase()
              .includes(globalSearch.toLowerCase());
          });

        // Filtro por día en las inasistencias
        const dayMatch = applyDayFilter(row, dayFilter);

        return searchMatch && dayMatch;
      });
    },
  }))
);

// Función auxiliar para aplicar filtros de día
const applyDayFilter = (row: any, dayFilter: DayFilter): boolean => {
  if (dayFilter === 'all') return true;

  // Buscar en las inasistencias
  if (!row.unassistences || !Array.isArray(row.unassistences)) {
    return false;
  }

  return row.unassistences.some((assistance: any) => {
    if (!assistance.day) return false;

    // Convertir fecha string '14-08-25' a objeto Date
    const [day, month, year] = assistance.day.split('-').map(Number);
    const fullYear = 2000 + year; // Asumiendo formato YY
    const date = new Date(fullYear, month - 1, day);

    const dayOfWeek = date.getDay(); // 0 = Domingo, 1 = Lunes, etc.

    switch (dayFilter) {
      case 'weekdays':
        return dayOfWeek >= 1 && dayOfWeek <= 5; // Lunes a Viernes
      case 'monday':
        return dayOfWeek === 1;
      case 'tuesday':
        return dayOfWeek === 2;
      case 'wednesday':
        return dayOfWeek === 3;
      case 'thursday':
        return dayOfWeek === 4;
      case 'friday':
        return dayOfWeek === 5;
      default:
        return false;
    }
  });
};
