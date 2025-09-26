import { useEffect, useMemo, useState } from 'react';
import type { AbsencesDetailMap, AbsencesMap, CalendarProps } from './types';
import { addDays, fmtYmd, getMonday, startOfMonth } from './utils';

interface Unassistance {
  day: string; // 'dd-mm-yy'
  isJustified: boolean;
}
interface StudentRec {
  id: number;
  firstName: string;
  lastName: string;
  age: number;
  email: string;
  classroom: string;
  unassistences: Unassistance[];
}

export function useCalendarLogic(props: CalendarProps) {
  const { absences = {}, initialDate, onDayClick } = props;

  const today = useMemo(() => new Date(), []);
  const [viewDate, setViewDate] = useState<Date>(() =>
    startOfMonth(initialDate ?? today)
  );

  // Aggregated data (fallback to Students.json when no absences prop)
  const [aggregatedAbsences, setAggregatedAbsences] = useState<AbsencesMap>({});
  const [aggregatedDetails, setAggregatedDetails] = useState<AbsencesDetailMap>(
    {}
  );

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const mod = await import('../../../public/data/Students.json');
        const students: StudentRec[] = (mod as any).default || mod;
        const mapTotals: AbsencesMap = {};
        const mapDetails: AbsencesDetailMap = {};
        const toISOKey = (key: string) => {
          const [dd, mm, yy] = key.split('-').map((v) => parseInt(v, 10));
          const yyyy = 2000 + yy;
          const d = new Date(yyyy, mm - 1, dd);
          return fmtYmd(d);
        };
        students.forEach((s) => {
          if (!s.unassistences) return;
          s.unassistences.forEach((u) => {
            const iso = toISOKey(u.day);
            mapTotals[iso] = (mapTotals[iso] || 0) + 1;
            if (!mapDetails[iso])
              mapDetails[iso] = { total: 0, justified: 0, unjustified: 0 };
            mapDetails[iso].total += 1;
            if (u.isJustified) mapDetails[iso].justified += 1;
            else mapDetails[iso].unjustified += 1;
          });
        });
        if (mounted) {
          setAggregatedAbsences(mapTotals);
          setAggregatedDetails(mapDetails);
        }
      } catch (e) {
        // ignore
      }
    };
    if (!absences || Object.keys(absences).length === 0) {
      load();
    }
    return () => {
      mounted = false;
    };
  }, [absences]);

  const absencesSource: AbsencesMap =
    absences && Object.keys(absences).length > 0
      ? absences
      : aggregatedAbsences;

  const detailsSource: AbsencesDetailMap =
    absences && Object.keys(absences).length > 0 ? {} : aggregatedDetails;

  const gridDays = useMemo(() => {
    const start = getMonday(startOfMonth(viewDate));
    return Array.from({ length: 35 }, (_, i) => addDays(start, i));
  }, [viewDate]);

  const prevMonth = () =>
    setViewDate((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1));
  const nextMonth = () =>
    setViewDate((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1));

  const handleDayClick = (date: Date) => onDayClick?.(date);

  return {
    today,
    viewDate,
    setViewDate,
    absencesSource,
    detailsSource,
    gridDays,
    prevMonth,
    nextMonth,
    handleDayClick,
  } as const;
}
