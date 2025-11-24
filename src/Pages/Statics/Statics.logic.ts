import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useStore } from '../../store/Store';
import { getAllStudents, getAttendancesByDate } from '../../api/client';
import type { AttendanceRecord, StudentRec } from '../../types/generalTypes';

type AbsenceRow = {
  student?: StudentRec;
  studentId: number | null;
  classroomId?: number | null;
  absence: {
    day: string;
    status?: string | null;
    isJustified: boolean;
    notes?: string | null;
  };
  date: Date;
};

const MS_PER_DAY = 24 * 60 * 60 * 1000;

const formatIsoDate = (date: Date | null) => {
  if (!date) return null;
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

const formatLegacyDay = (date: Date) => {
  const dd = String(date.getDate()).padStart(2, '0');
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const yy = String(date.getFullYear()).slice(-2);
  return `${dd}-${mm}-${yy}`;
};

const safeDate = (input?: string | Date | null) => {
  if (!input) return null;
  const date = input instanceof Date ? input : new Date(input);
  return Number.isNaN(date.getTime()) ? null : date;
};

const normalizeId = (value: unknown): number | null => {
  if (value === undefined || value === null) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const isAbsenceStatus = (status?: string | null) => {
  if (!status) return false;
  const normalized = status.toUpperCase();
  return normalized.includes('ABSENT') || normalized.includes('UNASSIST');
};

const isJustifiedStatus = (status?: string | null) => {
  if (!status) return false;
  const normalized = status.toUpperCase();
  return normalized.includes('JUSTIFIED') || normalized.includes('JUSTIFICADA');
};

const unwrapStudents = (payload: unknown): StudentRec[] => {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload as StudentRec[];
  const candidates = ['students', 'data', 'items', 'results', 'list'];
  for (const key of candidates) {
    const maybe = (payload as Record<string, unknown>)[key];
    if (Array.isArray(maybe)) return maybe as StudentRec[];
  }
  return [];
};

const unwrapAttendances = (payload: unknown): AttendanceRecord[] => {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload as AttendanceRecord[];
  const candidates = ['attendances', 'data', 'items', 'results', 'list'];
  for (const key of candidates) {
    const maybe = (payload as Record<string, unknown>)[key];
    if (Array.isArray(maybe)) return maybe as AttendanceRecord[];
  }
  return [];
};

const synthesizeStudent = (
  record: AttendanceRecord,
  studentId: number | null
): StudentRec | undefined => {
  if (
    studentId === null &&
    !record.student &&
    !record.first_name &&
    !record.last_name
  ) {
    return undefined;
  }
  const fallbackFirstName =
    record.student?.first_name ??
    record.student_first_name ??
    record.first_name ??
    'N/A';
  const fallbackLastName =
    record.student?.last_name ??
    record.student_last_name ??
    record.last_name ??
    'N/A';
  return {
    id: studentId ?? record.student_id ?? 0,
    first_name: fallbackFirstName,
    last_name: fallbackLastName,
    classroom_id: record.classroom_id,
    classroom: record.classroom_id
      ? `Curso #${record.classroom_id}`
      : undefined,
    username: undefined,
    unassistences: [],
  };
};

const buildAbsenceRows = (
  records: AttendanceRecord[],
  studentMap: Map<number, StudentRec>
): AbsenceRow[] => {
  return records.reduce<AbsenceRow[]>((rows, record) => {
    if (!isAbsenceStatus(record.status)) return rows;
    const date = safeDate(record.date);
    if (!date) return rows;
    const studentId = normalizeId(record.student_id);
    const student =
      (studentId !== null ? studentMap.get(studentId) : undefined) ??
      synthesizeStudent(record, studentId);
    rows.push({
      student,
      studentId,
      classroomId: normalizeId(record.classroom_id),
      absence: {
        day: formatLegacyDay(date),
        status: record.status,
        isJustified: isJustifiedStatus(record.status),
        notes: record.notes,
      },
      date,
    });
    return rows;
  }, []);
};

const deriveShiftFromClassName = (name?: string | null) => {
  if (!name) return null;
  const lastChar = name.trim().slice(-1).toUpperCase();
  if (!lastChar) return null;
  return ['A', 'B', 'C'].includes(lastChar) ? 'Mañana' : 'Tarde';
};

const daysBetweenInclusive = (start: Date, end: Date) => {
  return Math.round((end.getTime() - start.getTime()) / MS_PER_DAY) + 1;
};

export const useStaticsLogic = () => {
  const selectedRange = useStore((s) => s.selectedRange);
  const setSelectedRange = useStore((s) => s.setSelectedRange);

  const { start, end, daysCount } = useMemo(() => {
    const s = selectedRange?.[0] ?? null;
    const e = selectedRange?.[1] ?? null;
    const days = s && e ? daysBetweenInclusive(s, e) : 0;
    return { start: s, end: e, daysCount: days };
  }, [selectedRange]);

  const range = useMemo(() => {
    return { from: formatIsoDate(start), to: formatIsoDate(end) };
  }, [start, end]);

  const prevPeriod = useMemo(() => {
    if (!start || !end)
      return { start: null as Date | null, end: null as Date | null };
    const len = end.getTime() - start.getTime() + MS_PER_DAY;
    const prevEnd = new Date(start.getTime() - MS_PER_DAY);
    const prevStart = new Date(prevEnd.getTime() - (len - MS_PER_DAY));
    return { start: prevStart, end: prevEnd };
  }, [start, end]);

  const prevRange = useMemo(() => {
    return {
      from: formatIsoDate(prevPeriod.start),
      to: formatIsoDate(prevPeriod.end),
    };
  }, [prevPeriod]);

  const { data: studentsResponse } = useQuery({
    queryKey: ['statics', 'students'],
    queryFn: getAllStudents,
    staleTime: 5 * 60 * 1000,
  });

  const students = useMemo(
    () => unwrapStudents(studentsResponse),
    [studentsResponse]
  );

  const studentMap = useMemo(() => {
    const map = new Map<number, StudentRec>();
    students.forEach((student) => {
      const fallback = student as unknown as Record<string, unknown>;
      const candidateId = student.id ?? fallback?.['student_id'];
      const studentId = normalizeId(candidateId);
      if (studentId !== null) {
        map.set(studentId, student);
      }
    });
    return map;
  }, [students]);

  const { data: attendanceResponse } = useQuery({
    queryKey: ['statics', 'attendances', range.from, range.to],
    queryFn: () =>
      range.from && range.to
        ? getAttendancesByDate(range.from, range.to)
        : Promise.resolve(null),
    enabled: Boolean(range.from && range.to),
    staleTime: 60 * 1000,
  });

  const attendanceList = useMemo(
    () => unwrapAttendances(attendanceResponse),
    [attendanceResponse]
  );

  const absencesInRange = useMemo(
    () => buildAbsenceRows(attendanceList, studentMap),
    [attendanceList, studentMap]
  );

  const { data: prevAttendanceResponse } = useQuery({
    queryKey: ['statics', 'attendances', 'prev', prevRange.from, prevRange.to],
    queryFn: () =>
      prevRange.from && prevRange.to
        ? getAttendancesByDate(prevRange.from, prevRange.to)
        : Promise.resolve(null),
    enabled: Boolean(prevRange.from && prevRange.to),
    staleTime: 60 * 1000,
  });

  const prevAttendanceList = useMemo(
    () => unwrapAttendances(prevAttendanceResponse),
    [prevAttendanceResponse]
  );

  const absencesPrev = useMemo(
    () => buildAbsenceRows(prevAttendanceList, studentMap),
    [prevAttendanceList, studentMap]
  );

  const totalAbsences = absencesInRange.length;
  const justified = absencesInRange.filter((r) => r.absence.isJustified).length;
  const unjustified = totalAbsences - justified;

  const prevTotal = absencesPrev.length;
  const percentChange =
    prevTotal === 0
      ? null
      : Math.round(((totalAbsences - prevTotal) / prevTotal) * 100);

  const totalStudents = students.length;
  const totalPossible = daysCount * totalStudents;
  const totalAttendances = Math.max(totalPossible - totalAbsences, 0);

  const studentCounts = useMemo(() => {
    const m = new Map<string | number, number>();
    for (const r of absencesInRange) {
      const key =
        r.student?.id ?? r.student?.dni ?? r.studentId ?? 'unknown_student';
      m.set(key, (m.get(key) ?? 0) + 1);
    }
    return m;
  }, [absencesInRange]);

  const topStudent = useMemo(() => {
    let max = 0;
    let id: string | number | null = null;
    for (const [key, value] of studentCounts.entries()) {
      if (value > max) {
        max = value;
        id = key;
      }
    }
    return { id, count: max };
  }, [studentCounts]);

  const classCounts = useMemo(() => {
    const m = new Map<string, number>();
    for (const r of absencesInRange) {
      const label =
        (typeof r.student?.classroom === 'string' && r.student.classroom) ||
        (r.classroomId ? `Curso #${r.classroomId}` : 'N/A');
      m.set(label, (m.get(label) ?? 0) + 1);
    }
    return m;
  }, [absencesInRange]);

  const topClass = useMemo(() => {
    let max = 0;
    let name: string | null = null;
    for (const [label, total] of classCounts.entries()) {
      if (total > max) {
        max = total;
        name = label;
      }
    }
    return { name, count: max };
  }, [classCounts]);

  const topShift = useMemo(() => {
    const shiftName = deriveShiftFromClassName(topClass.name) ?? 'Sin datos';
    return { name: shiftName, count: topClass.count };
  }, [topClass]);

  const periodLabel = useMemo(() => {
    if (!start || !end) return 'Periodo';
    const days = daysBetweenInclusive(start, end);
    if (days <= 7) return 'Esta semana';
    if (days <= 31) return 'Este mes';
    return 'Periodo';
  }, [start, end]);

  const periodSummary = `${periodLabel} : ${
    percentChange !== null
      ? ` ${
          percentChange >= 0 ? '+' : '-'
        }${percentChange}% que el periodo anterior (${prevTotal})`
      : ''
  }`;

  return {
    selectedRange,
    setSelectedRange,
    totalStudents,
    daysCount,
    totalPossible,
    totalAbsences,
    justified,
    unjustified,
    totalAttendances,
    prevTotal,
    percentChange,
    periodSummary,
    topStudent,
    topClass,
    topShift,
    absencesInRange,
  } as const;
};

export default useStaticsLogic;
