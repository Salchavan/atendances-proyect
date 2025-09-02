
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { type ReactElement } from 'react';
import { type HTMLElementType } from 'react';
// Estados volátiles: se reinician al refrescar la página.


// Helpers para días laborables (lunes-viernes)
export const getLastWeekdays = (count: number, includeToday: boolean = true): Date[] => {
  const days: Date[] = [];
  let date = new Date();
  // Si no queremos incluir hoy, retrocedemos un día primero
  if (!includeToday) {
    date.setDate(date.getDate() - 1);
  }
  while (days.length < count) {
    const day = date.getDay();
    if (day >= 1 && day <= 5) {
      days.push(new Date(date));
    }
    date.setDate(date.getDate() - 1);
  }
  return days.reverse();
};

// Conservamos función anterior (ahora delega) por compatibilidad interna
const getLastFiveWeekdays = (): Date[] | null => {
  const list = getLastWeekdays(5, false); // 5 días laborables previos a hoy
  return list.length ? list : null;
};

type Store = {
  isDialogOpen: boolean;
  dialogContent: ReactElement | HTMLElementType | null;
  dialogTitle: string;
  openDialog: (content: ReactElement, title?: string) => void;
  closeDialog: () => void;
  assignedDate: Date | null;
  setAssignedDate: (date: Date | null) => void;
  assignedDateRange: [Date, Date] | null;
  setAssignedDateRange: (range: [Date, Date] | null) => void;
  assignedWeekdays: Date[] | null; // todos los días laborables dentro del rango seleccionado
};

// Obtener todos los días laborables entre dos fechas (inclusive)
export const getWeekdaysInRange = (start: Date, end: Date): Date[] => {
  const weekdays: Date[] = [];
  const cursor = new Date(start);
  const endTime = end.getTime();
  while (cursor.getTime() <= endTime) {
    const day = cursor.getDay();
    if (day >= 1 && day <= 5) {
      weekdays.push(new Date(cursor));
    }
    cursor.setDate(cursor.getDate() + 1);
  }
  return weekdays;
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
    assignedDate: (() => {
      const days = getLastFiveWeekdays();
      return days && days.length > 0 ? days[0] : null;
    })(),
    setAssignedDate: (date) => set({ assignedDate: date }),
    assignedDateRange: null,
    assignedWeekdays: null,
    setAssignedDateRange: (range) => {
      if (!range) {
        set({ assignedDateRange: null, assignedWeekdays: null });
        return;
      }
      const [start, end] = range;
      const weekdays = getWeekdaysInRange(start, end);
      set({ assignedDateRange: range, assignedWeekdays: weekdays.length ? weekdays : null });
    },
  })
);

export type DayFilter =
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
    dayFilter: 'weekdays',

    setGlobalSearch: (search: string) => {
      set({ globalSearch: search });
    },

    setDayFilter: (filter: DayFilter) => {
      set({ dayFilter: filter });
    },

    clearAllFilters: () => {
      set({ globalSearch: '', dayFilter: 'weekdays' });
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
  if (dayFilter === 'weekdays') return true;

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
