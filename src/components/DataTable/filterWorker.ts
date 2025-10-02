// Web Worker: performs filtering off the main thread to keep UI responsive
// Note: Duplicate minimal filter logic here to avoid importing app store into worker.

export type DayFilter =
  | 'weekdays'
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday';

type FilterRequest = {
  id: number;
  type: 'filter';
  data: any[];
  globalSearch: string;
  dayFilter: DayFilter;
};

type FilterResponse = {
  id: number;
  type: 'result';
  rows: any[];
};

// Normalize text: lowercase + strip diacritics
const normalize = (str: string) =>
  (str ?? '')
    .toLocaleLowerCase('es')
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[\u0300-\u036f]/g, '');

const applyDayFilter = (row: any, dayFilter: DayFilter): boolean => {
  if (dayFilter === 'weekdays') return true;
  const list = row?.unassistences;
  if (!Array.isArray(list) || list.length === 0) return false;

  return list.some((assistance: any) => {
    const d = assistance?.day;
    if (!d || typeof d !== 'string') return false;
    const parts = d.split('-');
    if (parts.length !== 3) return false;
    const [dayStr, monthStr, yearStr] = parts;
    const day = Number(dayStr);
    const month = Number(monthStr);
    const year = Number(yearStr);
    if (Number.isNaN(day) || Number.isNaN(month) || Number.isNaN(year)) {
      return false;
    }
    const fullYear = 2000 + year;
    const date = new Date(fullYear, month - 1, day);
    const dow = date.getDay(); // 0=Sun, 1=Mon
    switch (dayFilter) {
      case 'monday':
        return dow === 1;
      case 'tuesday':
        return dow === 2;
      case 'wednesday':
        return dow === 3;
      case 'thursday':
        return dow === 4;
      case 'friday':
        return dow === 5;
      default:
        return false;
    }
  });
};

const filterRows = (
  data: any[],
  globalSearch: string,
  dayFilter: DayFilter
): any[] => {
  const search = normalize(globalSearch);
  const searchWords = search.split(/\s+/).filter(Boolean);

  if (searchWords.length === 0 && dayFilter === 'weekdays') {
    // No active filters
    return data;
  }

  return data.filter((row) => {
    // Global search across primitive string fields (excluding arrays)
    const searchMatch =
      searchWords.length === 0 ||
      searchWords.every((word) =>
        Object.entries(row).some(([key, value]) => {
          if (key === 'unassistences' || Array.isArray(value)) return false;
          return typeof value === 'string' && normalize(value).includes(word);
        })
      );

    const dayMatch = applyDayFilter(row, dayFilter);

    return searchMatch && dayMatch;
  });
};

self.onmessage = (e: MessageEvent<FilterRequest>) => {
  const msg = e.data;
  if (!msg || msg.type !== 'filter') return;
  const { id, data, globalSearch, dayFilter } = msg;
  // Do the heavy work off the main thread
  const rows = filterRows(data, globalSearch, dayFilter);
  const response: FilterResponse = { id, type: 'result', rows };
  // Post back to UI thread
  (self as any).postMessage(response);
};

export {}; // keep this file as a module
