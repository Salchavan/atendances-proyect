import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

// ===============================
// Filtros de día para la tabla y búsqueda
// ===============================

export type DayFilter =
  | 'weekdays' // Todos los días laborables
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday';

/**
 * Estado y acciones para los filtros de la tabla principal
 */
export interface FilterState {
  globalSearch: string;
  dayFilter: DayFilter;
  setGlobalSearch: (search: string) => void;
  setDayFilter: (filter: DayFilter) => void;
  clearAllFilters: () => void;
  getFilteredData: (data: any[]) => any[];
}

/**
 * Aplica el filtro de día a una fila de datos (para inasistencias)
 */
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

/**
 * Hook global de filtros para la tabla principal (zustand, no persistente)
 */
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

    /**
     * Filtra los datos según búsqueda global y filtro de día
     */
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
