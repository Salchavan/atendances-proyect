import { useMemo } from 'react';
import StudentsJson from '../../data/Students.json';
import StaticsJson from '../../data/Statics.json';
import { useStore } from '../../store/Store';

type Student = any;

const parseDdMmYy = (s: string): Date | null => {
  if (!s || typeof s !== 'string') return null;
  const parts = s.split('-').map((p) => parseInt(p, 10));
  if (parts.length !== 3) return null;
  const [dd, mm, yy] = parts;
  const yyyy = 2000 + yy;
  return new Date(yyyy, mm - 1, dd);
};

const inRangeInclusive = (d: Date, start: Date | null, end: Date | null) => {
  if (!start || !end) return false;
  const lo = new Date(
    start.getFullYear(),
    start.getMonth(),
    start.getDate()
  ).getTime();
  const hi = new Date(
    end.getFullYear(),
    end.getMonth(),
    end.getDate()
  ).getTime();
  const t = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  return t >= lo && t <= hi;
};

const daysBetweenInclusive = (start: Date, end: Date) => {
  const msPerDay = 24 * 60 * 60 * 1000;
  return Math.round((end.getTime() - start.getTime()) / msPerDay) + 1;
};

export const useStaticsLogic = () => {
  const students: Student[] = StudentsJson as any;
  // Selectors separated to avoid returning a new array each render
  const selectedRange = useStore((s) => s.selectedRange);
  const setSelectedRange = useStore((s) => s.setSelectedRange);

  const { start, end, daysCount } = useMemo(() => {
    const s = selectedRange?.[0] ?? null;
    const e = selectedRange?.[1] ?? null;
    const days = s && e ? daysBetweenInclusive(s, e) : 0;
    return { start: s, end: e, daysCount: days };
  }, [selectedRange]);

  const absencesInRange = useMemo(() => {
    if (!start || !end) return [] as any[];
    const rows: any[] = [];
    for (const stu of students) {
      const list = Array.isArray(stu.unassistences) ? stu.unassistences : [];
      for (const u of list) {
        const d = parseDdMmYy(u.day);
        if (d && inRangeInclusive(d, start, end)) {
          rows.push({ student: stu, absence: u, date: d });
        }
      }
    }
    return rows;
  }, [students, start, end]);

  const totalAbsences = absencesInRange.length;
  const justified = absencesInRange.filter((r) => r.absence.isJustified).length;
  const unjustified = totalAbsences - justified;

  // If a precomputed Statics.json exists, prefer its global totals and top entries
  // Map fields from Statics.json to the hook outputs. We still keep range-based
  // absencesInRange for table use, but override summary numbers for the UI cards.
  // these individual overridden totals were removed because UI uses the
  // computed range-based totals; keep other overrides for students/classes
  let overriddenTotalStudents: number | null = null;
  let overriddenTopStudent: { id: any; count: number } | null = null;
  let overriddenTopClass: { name: string | null; count: number } | null = null;
  let overriddenTopShift: { name: string | null; count: number } | null = null;

  try {
    if (StaticsJson && typeof StaticsJson === 'object') {
      overriddenTotalStudents = StaticsJson.numero_de_estudiantes ?? null;

      const est = StaticsJson.estudiante_con_mayor_cantidad_de_faltas ?? null;
      if (est) {
        overriddenTopStudent = {
          id: est.id ?? est.dni ?? est.email ?? null,
          count: est.total_faltas ?? 0,
        };
      }

      const cursoName = StaticsJson.curso_con_mayor_cantidad_de_faltas ?? null;
      const cursoCount =
        StaticsJson.curso_con_mayor_cantidad_de_faltas_count ?? 0;
      if (cursoName)
        overriddenTopClass = { name: cursoName, count: cursoCount };

      // Derive turno (Mañana/Tarde) from the classroom letter (A-C => Mañana, D-F => Tarde)
      if (cursoName && typeof cursoName === 'string') {
        const lastChar = cursoName.trim().slice(-1).toUpperCase();
        const turno = ['A', 'B', 'C'].includes(lastChar) ? 'Mañana' : 'Tarde';
        overriddenTopShift = { name: turno, count: cursoCount };
      }
    }
  } catch (err) {
    // silent fallback to computed values
    // console.warn('Failed to read Statics.json', err);
  }

  // Previous period (same length) for comparison
  const prevPeriod = useMemo(() => {
    if (!start || !end)
      return { start: null as Date | null, end: null as Date | null };
    const len = end.getTime() - start.getTime() + 24 * 60 * 60 * 1000;
    const prevEnd = new Date(start.getTime() - 24 * 60 * 60 * 1000);
    const prevStart = new Date(prevEnd.getTime() - (len - 24 * 60 * 60 * 1000));
    return { start: prevStart, end: prevEnd };
  }, [start, end]);

  const absencesPrev = useMemo(() => {
    if (!prevPeriod.start || !prevPeriod.end) return [] as any[];
    const rows: any[] = [];
    for (const stu of students) {
      const list = Array.isArray(stu.unassistences) ? stu.unassistences : [];
      for (const u of list) {
        const d = parseDdMmYy(u.day);
        if (d && inRangeInclusive(d, prevPeriod.start, prevPeriod.end)) {
          rows.push({ student: stu, absence: u, date: d });
        }
      }
    }
    return rows;
  }, [students, prevPeriod]);

  const prevTotal = absencesPrev.length;
  const percentChange =
    prevTotal === 0
      ? null
      : Math.round(((totalAbsences - prevTotal) / prevTotal) * 100);

  // Total possible attendances = students * daysCount
  const totalStudents = overriddenTotalStudents ?? students.length;
  const totalPossible = daysCount * totalStudents;
  // totalAbsences should reflect the selected range (absencesInRange), not global Statics.json
  const totalAttendances = totalPossible - totalAbsences;

  // Rankings
  const studentCounts = useMemo(() => {
    const m = new Map<string | number, number>();
    for (const r of absencesInRange) {
      const id = r.student?.id ?? r.student?.dni ?? 'unknown';
      m.set(id, (m.get(id) ?? 0) + 1);
    }
    return m;
  }, [absencesInRange]);

  const topStudent = useMemo(() => {
    if (overriddenTopStudent) return overriddenTopStudent;
    let max = 0;
    let id: any = null;
    for (const [k, v] of studentCounts.entries()) {
      if (v > max) {
        max = v;
        id = k;
      }
    }
    return { id, count: max };
  }, [studentCounts]);

  const classCounts = useMemo(() => {
    const m = new Map<string, number>();
    for (const r of absencesInRange) {
      const cls = r.student?.classroom ?? 'N/A';
      m.set(cls, (m.get(cls) ?? 0) + 1);
    }
    return m;
  }, [absencesInRange]);

  const topClass = useMemo(() => {
    if (overriddenTopClass) return overriddenTopClass;
    let max = 0;
    let name: string | null = null;
    for (const [k, v] of classCounts.entries()) {
      if (v > max) {
        max = v;
        name = k;
      }
    }
    return { name, count: max };
  }, [classCounts]);

  // Placeholder for turn/shift (can be overridden from Statics.json derivation)
  const topShift = overriddenTopShift ?? { name: 'Mañana', count: 0 };

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
    // state
    selectedRange,
    setSelectedRange,
    // computed
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
    // references
    topStudent,
    topClass,
    topShift,
    // raw rows for tables if needed
    absencesInRange,
  } as const;
};

export default useStaticsLogic;
