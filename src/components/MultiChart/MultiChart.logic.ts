import { useEffect, useMemo, useRef, useState } from 'react';
import { useGraphStore } from '../../store/specificStore/GraphStore.ts';

export type ChartType = 'bar' | 'pie' | 'line';

export type SeriesKey = 'total' | 'justified' | 'unjustified';

export interface MultiChartData {
  labels: string[];
  total: number[];
  justified: number[];
  unjustified: number[];
}

export type ActionBreakdown = Record<string, number>;

// Generic chart series for a configurable chart
export type GenericSlice = {
  id?: string | number;
  label: string;
  value: number;
  color?: string;
};

export type GenericSeries = {
  id?: string | number;
  label?: string;
  // for bar/line
  data?: number[];
  color?: string;
  // for pie
  slices?: GenericSlice[];
};

export type GenericChartData = {
  labels: string[];
  series: GenericSeries[];
};

export const useMultiChartLogic = (options?: {
  initialChartType?: ChartType;
  students?: any[];
  selectedUser?: any;
  // Optional generic data passed directly from the invoker to render arbitrary datasets
  genericData?: GenericChartData;
}) => {
  // Shared date range selection (persist across modal) via GraphStore
  const assignedRange = useGraphStore((s) => s.assignedDateRange);
  const setAssignedDateRange = useGraphStore((s) => s.setAssignedDateRange);
  const selectedRange: [Date | null, Date | null] = assignedRange
    ? [assignedRange[0], assignedRange[1]]
    : [null, null];
  const [chartType, setChartType] = useState<ChartType>(
    options?.initialChartType ?? 'bar'
  );
  const [activeSeries, setActiveSeries] = useState<Record<SeriesKey, boolean>>({
    total: true,
    justified: true,
    unjustified: true,
  });
  const [students, setStudents] = useState<any[]>([]);
  const [resolvedSelectedUser, setResolvedSelectedUser] = useState<any | null>(
    options?.selectedUser ?? null
  );

  useEffect(() => {
    let mounted = true;

    if (options?.students && Array.isArray(options.students)) {
      setStudents(options.students);
      return () => {
        mounted = false;
      };
    }

    const resolver = async (su: any) => {
      try {
        // try resolve student record first
        const studentsMod = await import('../../data/Students.json');
        const allStudents: any[] = studentsMod.default || studentsMod || [];
        const id = su.id ?? su.ID ?? su.id_student ?? null;
        const dni = su.dni ?? su.DNI ?? null;
        let foundStudent: any | null = null;
        if (id != null) {
          foundStudent = allStudents.find(
            (x) => String(x.id) === String(id) || String(x.ID) === String(id)
          );
        }
        if (!foundStudent && dni != null) {
          foundStudent = allStudents.find(
            (x) =>
              String(x.dni) === String(dni) || String(x.DNI) === String(dni)
          );
        }
        if (!foundStudent) {
          const nameCandidate = `${su.firstName ?? su.first_name ?? ''}`.trim();
          if (nameCandidate) {
            foundStudent = allStudents.find(
              (x) =>
                `${(x.firstName ?? x.first_name ?? '').trim()} ${(
                  x.lastName ??
                  x.last_name ??
                  ''
                ).trim()}`.trim() === nameCandidate ||
                `${(x.first_name ?? x.firstName ?? '').trim()}`.trim() ===
                  nameCandidate
            );
          }
        }
        if (foundStudent) {
          if (mounted) {
            setStudents([foundStudent]);
            setResolvedSelectedUser(foundStudent);
          }
          return;
        }

        // try resolve full user record
        const usersMod = await import('../../data/users.json');
        const allUsers: any[] = usersMod.default || usersMod || [];
        let foundUser: any | null = null;
        if (id != null) {
          foundUser = allUsers.find(
            (x) => String(x.id) === String(id) || String(x.ID) === String(id)
          );
        }
        if (!foundUser && dni != null) {
          foundUser = allUsers.find(
            (x) =>
              String(x.dni) === String(dni) || String(x.DNI) === String(dni)
          );
        }
        if (!foundUser) {
          const nameCandidate = `${su.firstName ?? su.first_name ?? ''}`.trim();
          if (nameCandidate) {
            foundUser = allUsers.find(
              (x) =>
                `${(x.firstName ?? x.first_name ?? '').trim()}` ===
                nameCandidate
            );
          }
        }
        if (foundUser) {
          if (mounted) setResolvedSelectedUser(foundUser);
          return;
        }

        // fallback: use provided object
        if (mounted) setResolvedSelectedUser(su);
      } catch (e) {
        if (mounted) setResolvedSelectedUser(su);
      }
    };

    if (options?.selectedUser) {
      const su = options.selectedUser as any;
      const hasRole = !!(su.role || su.Role || su.rol);
      const hasActivity = Array.isArray(su.activity) && su.activity.length > 0;
      const hasUnassistences =
        Array.isArray(su.unassistences) && su.unassistences.length > 0;

      // If it's clearly a student object (has unassistences), use it directly
      if (!hasRole && hasUnassistences) {
        setStudents([su]);
        setResolvedSelectedUser(su);
        return () => {
          mounted = false;
        };
      }

      // If it's a user with role and it already has activity, use it
      if (hasRole && hasActivity) {
        setResolvedSelectedUser(su);
        return () => {
          mounted = false;
        };
      }

      // otherwise attempt to resolve from data files
      void resolver(su);
    }

    return () => {
      mounted = false;
    };
  }, [options?.students, options?.selectedUser]);

  const labelsKeys = useMemo(() => {
    // helper to format keys like Students.json: DD-MM-YY
    const fmtKey = (d: Date) => {
      const dd = String(d.getDate()).padStart(2, '0');
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const yy = String(d.getFullYear()).slice(-2);
      return `${dd}-${mm}-${yy}`;
    };
    const fmtLabel = (d: Date) => {
      const dd = String(d.getDate()).padStart(2, '0');
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      return `${dd}-${mm}`;
    };

    const start = selectedRange?.[0];
    const end = selectedRange?.[1];
    const days: Date[] = [];
    if (!start || !end) {
      // default: last 7 days (including today)
      const cursor = new Date();
      for (let i = 6; i >= 0; i--) {
        const d = new Date(cursor);
        d.setDate(cursor.getDate() - i);
        days.push(d);
      }
    } else {
      const cursor = new Date(start);
      while (cursor.getTime() <= end.getTime()) {
        days.push(new Date(cursor));
        cursor.setDate(cursor.getDate() + 1);
      }
    }

    const labels = days.map(fmtLabel);
    const keys = days.map(fmtKey);
    return { labels, keys };
  }, [selectedRange]);

  const data: MultiChartData = useMemo(() => {
    // If a selectedUser is provided and has a role => treat as 'user' and show activity
    const sel = resolvedSelectedUser ?? options?.selectedUser;
    const { labels, keys } = labelsKeys;
    const indexByKey = new Map(keys.map((k, i) => [k, i] as const));
    const makeEmpty = () => ({
      labels,
      total: new Array(labels.length).fill(0),
      justified: new Array(labels.length).fill(0),
      unjustified: new Array(labels.length).fill(0),
    });

    if (sel && (sel.role || sel.Role || sel.rol)) {
      const res = makeEmpty();
      // Activity array: { date: 'dd-mm-yy', action: 'LOGIN' }
      // tolerate multiple keys and normalize
      const rawActivity = sel.activity || sel.Activity || sel.actions || [];
      rawActivity.forEach((a: any) => {
        const dateKey = a.date ?? a.day ?? a.fecha ?? null;
        if (!dateKey) return;
        const idx = indexByKey.get(dateKey);
        if (idx === undefined) return;
        res.total[idx] += 1; // count actions per day
      });
      return res;
    }

    // Default: use students' unassistences
    if (!students || !students.length) return makeEmpty();
    const total = new Array(labels.length).fill(0);
    const justified = new Array(labels.length).fill(0);
    const unjustified = new Array(labels.length).fill(0);
    students.forEach((s) => {
      (s.unassistences || []).forEach((u: any) => {
        const idx = indexByKey.get(u.day);
        if (idx === undefined) return;
        total[idx] += 1;
        if (u.isJustified) justified[idx] += 1;
        else unjustified[idx] += 1;
      });
    });
    return { labels, total, justified, unjustified };
  }, [students, labelsKeys, options?.selectedUser]);

  // DEBUG: log key pieces to help diagnose empty charts
  // (Left in intentionally for quick local debugging; remove if noisy.)
  try {
    // guard to avoid heavy output in production builds
    if (typeof window !== 'undefined' && (window as any).__DEV__ !== false) {
      // small timeout to avoid interfering with render
      setTimeout(() => {
        // eslint-disable-next-line no-console
        console.debug('[MultiChart] debug:', {
          selectedUser: options?.selectedUser,
          studentsCount: students?.length,
          labels: labelsKeys.labels,
          data,
        });
      }, 0);
    }
  } catch (e) {
    // ignore
  }

  // Build a generic chart representation so callers can pass arbitrary datasets.
  const genericData: GenericChartData = useMemo(() => {
    // If caller provided a generic dataset, use it directly
    if (options?.genericData) return options.genericData;

    const sel = options?.selectedUser;
    // If selectedUser is a user with role, show action breakdown as a single pie series
    if (sel && (sel.role || sel.Role || sel.rol)) {
      const actionCounts = (sel.activity || []).reduce(
        (acc: Record<string, number>, a: any) => {
          const k = String(a.action || 'unknown');
          acc[k] = (acc[k] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>
      );
      const slices: GenericSlice[] = Object.entries(actionCounts).map(
        ([label, value], i) => ({ id: i, label, value: Number(value) })
      );
      return { labels: [], series: [{ label: 'activity', slices }] };
    }

    // Otherwise convert the computed MultiChartData into a generic representation
    const series: GenericSeries[] = [];
    if (data && data.labels) {
      series.push({
        id: 'total',
        label: 'Total',
        data: data.total,
        color: '#ff5b5b',
      });
      series.push({
        id: 'justified',
        label: 'Justificadas',
        data: data.justified,
        color: '#ffaf45',
      });
      series.push({
        id: 'unjustified',
        label: 'Injustificadas',
        data: data.unjustified,
        color: '#ff6b6b',
      });
      return { labels: data.labels, series };
    }
    return { labels: [], series };
  }, [options?.genericData, data, options?.selectedUser]);

  // If selectedUser is a 'user' (has role), produce an action breakdown map
  const actionBreakdown: ActionBreakdown = useMemo(() => {
    const sel = resolvedSelectedUser ?? options?.selectedUser;
    if (!sel || !(sel.role || sel.Role || sel.rol)) return {};
    const map: ActionBreakdown = {};
    const rawActivity = sel.activity || sel.Activity || sel.actions || [];
    rawActivity.forEach((a: any) => {
      const key = String(a.action || a.type || 'unknown');
      map[key] = (map[key] || 0) + 1;
    });
    return map;
  }, [resolvedSelectedUser, options?.selectedUser]);

  // container size tracking to set chart height
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [chartHeight, setChartHeight] = useState<number>(240);
  const [chartWidth, setChartWidth] = useState<number>(0);

  useEffect(() => {
    if (!containerRef.current) return;
    const el = containerRef.current;
    const obs = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const cr = entry.contentRect;
        // keep a minimal height for readability
        setChartHeight(Math.max(200, Math.floor(cr.height)));
        setChartWidth(Math.floor(cr.width));
      }
    });
    obs.observe(el);
    return () => obs.disconnect();
  }, [containerRef.current]);

  const toggleChartType = () =>
    setChartType((p) => (p === 'bar' ? 'pie' : p === 'pie' ? 'line' : 'bar'));
  const setChartTypeDirect = (t: ChartType) => setChartType(t);
  const toggleSeries = (key: SeriesKey) =>
    setActiveSeries((prev) => ({ ...prev, [key]: !prev[key] }));
  const setSelectedRange = (r: [Date | null, Date | null]) => {
    const [s, e] = r;
    if (s && e) setAssignedDateRange([s, e]);
    else setAssignedDateRange(null);
  };

  // Label visibility heuristics for bar charts
  const showXAxisLabels = chartWidth >= 460 || (data.labels?.length ?? 0) <= 7;
  const showBarValueLabels =
    chartWidth >= 620 && (data.labels?.length ?? 0) <= 10;

  // Selected day (by key 'dd-mm-yy') should persist across modal open/close
  const [selectedDayKey, setSelectedDayKey] = useState<string | null>(null);

  // Helper: collect absences for a given day key
  const getAbsencesForDay = (dayKey: string) => {
    if (!dayKey || !students?.length)
      return [] as Array<{
        id: number;
        studentName: string;
        classroom: string;
        day: string;
        isJustified: boolean;
      }>;
    const rows: Array<{
      id: number;
      studentName: string;
      classroom: string;
      day: string;
      isJustified: boolean;
    }> = [];
    students.forEach((s) => {
      const name = `${s.firstName ?? s.first_name ?? ''} ${
        s.lastName ?? s.last_name ?? ''
      }`.trim();
      (s.unassistences || []).forEach((u: any) => {
        if (u.day === dayKey) {
          rows.push({
            id: s.id,
            studentName: name,
            classroom: s.classroom ?? '',
            day: u.day,
            isJustified: !!u.isJustified,
          });
        }
      });
    });
    return rows;
  };

  const getStudentsForDay = (dayKey: string) => {
    if (!dayKey || !students?.length) return [] as any[];
    return students.filter((s) =>
      (s.unassistences || []).some((u: any) => u.day === dayKey)
    );
  };

  return {
    // exposed students array (if provided or loaded)
    students,
    actionBreakdown,
    // state
    selectedRange,
    chartType,
    activeSeries,
    chartHeight,
    chartWidth,
    containerRef,
    selectedDayKey,

    // data
    data,
    dayKeys: labelsKeys.keys,
    genericData,

    // actions
    setSelectedRange,
    toggleChartType,
    setChartTypeDirect,
    toggleSeries,
    setSelectedDayKey,
    getAbsencesForDay,
    getStudentsForDay,
    showXAxisLabels,
    showBarValueLabels,
  } as const;
};
