import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import type {
  CalendarProps,
  AttendanceDetailMap,
  AttendanceMap,
  AttendanceRecord,
} from '../../types/generalTypes';
import { addDays, fmtYmd, getMonday, startOfMonth } from './utils';
import { getAttendancesByDate } from '../../api/client';

export function useCalendarLogic(props: CalendarProps) {
  const { initialDate, onDayClick } = props;

  const today = useMemo(() => new Date(), []);
  const [viewDate, setViewDate] = useState<Date>(() =>
    startOfMonth(initialDate ?? today)
  );

  const monthStart = useMemo(() => startOfMonth(viewDate), [viewDate]);
  const monthEnd = useMemo(
    () => new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0),
    [viewDate]
  );
  const from = fmtYmd(monthStart);
  const to = fmtYmd(monthEnd);

  const { data: attendanceResponse, isLoading: attendancesLoading } = useQuery({
    queryKey: ['attendances', from, to],
    queryFn: () => getAttendancesByDate(from, to),
    enabled: Boolean(from && to),
    staleTime: 60_000,
  });

  const attendanceList: AttendanceRecord[] =
    attendanceResponse?.attendances ?? [];

  const attendanceAggregates = useMemo(() => {
    const totals: AttendanceMap = {};
    const details: AttendanceDetailMap = {};
    const byDay: Record<string, AttendanceRecord[]> = {};
    attendanceList.forEach((record) => {
      const dateIso = fmtYmd(new Date(record.date));
      totals[dateIso] = (totals[dateIso] || 0) + 1;
      if (!details[dateIso])
        details[dateIso] = { total: 0, present: 0, fractionSum: 0 };
      details[dateIso].total += 1;
      if (record.status === 'PRESENT') details[dateIso].present += 1;
      details[dateIso].fractionSum += Number(record.fraction ?? 0);
      if (!byDay[dateIso]) byDay[dateIso] = [];
      byDay[dateIso].push(record);
    });
    return { totals, details, byDay };
  }, [attendanceList]);

  const gridDays = useMemo(() => {
    const start = getMonday(startOfMonth(viewDate));
    return Array.from({ length: 35 }, (_, i) => addDays(start, i));
  }, [viewDate]);

  const prevMonth = () =>
    setViewDate((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1));
  const nextMonth = () =>
    setViewDate((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1));
  const selectMonth = (monthIndex: number) =>
    setViewDate((d) => new Date(d.getFullYear(), monthIndex, 1));

  const handleDayClick = (date: Date) => onDayClick?.(date);

  return {
    today,
    viewDate,
    setViewDate,
    attendanceSource: attendanceAggregates.totals,
    attendanceDetails: attendanceAggregates.details,
    attendancesByDay: attendanceAggregates.byDay,
    gridDays,
    prevMonth,
    nextMonth,
    selectMonth,
    handleDayClick,
    attendancesLoading,
  } as const;
}
