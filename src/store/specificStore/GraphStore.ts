import { create } from 'zustand';

/**
 * Helpers para días laborables (lunes-viernes)
 */
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

export const getLastWeekdays = (
  count: number,
  includeToday: boolean = true
): Date[] => {
  const days: Date[] = [];
  let date = new Date();
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

export type GraphStoreState = {
  assignedDateRange: [Date, Date] | null;
  setAssignedDateRange: (range: [Date, Date] | null) => void;
  assignedWeekdays: Date[] | null;
};

export const useGraphStore = create<GraphStoreState>()((set) => {
  // Initialize with last 5 business days by default
  const initialDays = getLastWeekdays(5, true);
  const initialRange: [Date, Date] | null = initialDays.length
    ? [initialDays[0], initialDays[initialDays.length - 1]]
    : null;

  return {
    assignedDateRange: initialRange,
    assignedWeekdays: initialDays.length ? initialDays : null,
    setAssignedDateRange: (range) => {
      if (!range) {
        set({ assignedDateRange: null, assignedWeekdays: null });
        return;
      }
      const [start, end] = range;
      const weekdays = getWeekdaysInRange(start, end);
      set({
        assignedDateRange: range,
        assignedWeekdays: weekdays.length ? weekdays : null,
      });
    },
  };
});
