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

export const useMultiChartLogic = (options?: {
  initialChartType?: ChartType;
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

  useEffect(() => {
    let mounted = true;
    (async () => {
      const mod = await import('../../data/Students.json');
      if (mounted) setStudents(mod.default || mod);
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // helpers
  const fmtLabel = (d: Date) =>
    `${String(d.getDate()).padStart(2, '0')}/${String(
      d.getMonth() + 1
    ).padStart(2, '0')}`;
  const cmpKey = (d: Date) =>
    `${String(d.getDate()).padStart(2, '0')}-${String(
      d.getMonth() + 1
    ).padStart(2, '0')}-${String(d.getFullYear()).slice(2)}`;
  const isBusinessDay = (d: Date) => d.getDay() >= 1 && d.getDay() <= 5;

  // Build weekdays within range (fallback to last 7 up to today)
  const { labels, keys } = useMemo(() => {
    let start = selectedRange?.[0] ?? null;
    let end = selectedRange?.[1] ?? null;
    const today = new Date();
    if (!start || !end) {
      end = today;
      const days: Date[] = [];
      const cursor = new Date(end);
      while (days.length < 7) {
        if (isBusinessDay(cursor)) days.push(new Date(cursor));
        cursor.setDate(cursor.getDate() - 1);
      }
      days.reverse();
      return { labels: days.map(fmtLabel), keys: days.map(cmpKey) };
    }
    const days: Date[] = [];
    const cursor = new Date(start);
    while (cursor.getTime() <= end.getTime()) {
      if (isBusinessDay(cursor)) days.push(new Date(cursor));
      cursor.setDate(cursor.getDate() + 1);
    }
    return { labels: days.map(fmtLabel), keys: days.map(cmpKey) };
  }, [selectedRange]);

  const data: MultiChartData = useMemo(() => {
    if (!students || !students.length) {
      return {
        labels,
        total: new Array(labels.length).fill(0),
        justified: new Array(labels.length).fill(0),
        unjustified: new Array(labels.length).fill(0),
      };
    }
    const total = new Array(labels.length).fill(0);
    const justified = new Array(labels.length).fill(0);
    const unjustified = new Array(labels.length).fill(0);
    const indexByKey = new Map(keys.map((k, i) => [k, i] as const));
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
  }, [students, labels, keys]);

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
      const name = `${s.firstName ?? ''} ${s.lastName ?? ''}`.trim();
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
    dayKeys: keys,

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
