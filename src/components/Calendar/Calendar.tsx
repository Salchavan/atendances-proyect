import React, { useEffect, useState } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { useStore } from '../../Store/Store';
import { DataTable } from '../DataTable/DataTable';
import { CalendarUI } from './CalendarUI';
import { useCalendarLogic } from './useCalendarLogic';
import type { CalendarProps } from './types';
import { fmtYmd } from './utils';

interface Unassistance {
  day: string; // formato 'dd-mm-yy'
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

export const Calendar: React.FC<CalendarProps> = (props) => {
  const {
    today,
    viewDate,
    absencesSource,
    detailsSource,
    gridDays,
    prevMonth,
    nextMonth,
    handleDayClick,
  } = useCalendarLogic(props);

  const openDialog = useStore((s) => s.openDialog);
  const [studentsCache, setStudentsCache] = useState<StudentRec[] | null>(null);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const mod = await import('../../data/Students.json');
        const students: StudentRec[] = (mod as any).default || mod;
        if (active) setStudentsCache(students);
      } catch {
        // ignore
      }
    };
    if (!studentsCache) load();
    return () => {
      active = false;
    };
  }, [studentsCache]);

  const toIsoFromDdMmYy = (key: string) => {
    const [dd, mm, yy] = key.split('-').map((v) => parseInt(v, 10));
    const yyyy = 2000 + yy;
    const d = new Date(yyyy, mm - 1, dd);
    return fmtYmd(d);
  };

  const openDayDetails = (date: Date) => {
    const iso = fmtYmd(date);
    const rows: any[] = [];
    if (studentsCache) {
      studentsCache.forEach((s) => {
        if (!s.unassistences) return;
        for (const u of s.unassistences) {
          if (toIsoFromDdMmYy(u.day) === iso) {
            rows.push({
              id: s.id,
              firstName: s.firstName,
              lastName: s.lastName,
              email: s.email,
              classroom: s.classroom,
              day: iso,
              isJustified: u.isJustified,
            });
          }
        }
      });
    }
    const title = `Faltas del ${date.toLocaleDateString('es-AR', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    })}`;
    openDialog(
      React.createElement(DataTable as any, {
        tableData: rows,
        filtersEnabled: true,
      }),
      title
    );
  };

  return (
    <ErrorBoundary fallback={<div>Error loading calendar.</div>}>
      <CalendarUI
        className={props.className}
        headerTextClass={props.headerTextClass}
        dayNumberClass={props.dayNumberClass}
        absencesNumberClass={props.absencesNumberClass}
        cellBgClass={props.cellBgClass}
        viewDate={viewDate}
        today={today}
        gridDays={gridDays}
        absencesSource={absencesSource}
        detailsSource={detailsSource}
        onPrev={prevMonth}
        onNext={nextMonth}
        onDayClick={handleDayClick}
        openDayDetails={openDayDetails}
      />
    </ErrorBoundary>
  );
};
