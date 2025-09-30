import React, { useEffect, useMemo, useState } from 'react';
import { addDays, startOfYear, getISOWeek, getISOWeekYear } from 'date-fns';
import {
  useGraphStore,
  getLastWeekdays,
} from '../../store/specificStore/GraphStore.ts';
import { useStore } from '../../Store/Store.ts';
import { DataTable } from '../DataTable/DataTable';

interface Unassistance {
  day: string;
  isJustified: boolean;
}

interface Student {
  id: number;
  firstName: string;
  lastName: string;
  age: number;
  email: string;
  classroom: string;
  unassistences: Unassistance[];
}

export const useDynamicGraphLogic = ({
  graphName,
  initialAssignedDate,
}: {
  graphName: string;
  initialAssignedDate?: Date[] | null;
}) => {
  const [Students, setStudents] = useState<Student[]>([]);
  useEffect(() => {
    const fetchData = async () => {
      const studentsData = await import('../../../public/data/Students.json');
      setStudents(studentsData.default);
    };
    fetchData();
  }, []);

  const openDataTable = useStore((s) => s.openDialog);
  const assignedWeekdays = useGraphStore((s) => s.assignedWeekdays);
  const { setAssignedDateRange } = useGraphStore();

  // Rolling last 5 business days (Mon-Fri), including today when it's a weekday
  const getLastFiveBusinessDays = (): Date[] => getLastWeekdays(5, true);

  // Compute last N weekdays counting backward from a given date (inclusive)
  const getLastNWeekdaysFrom = (from: Date, n: number): Date[] => {
    const days: Date[] = [];
    const cursor = new Date(from);
    while (days.length < n) {
      const day = cursor.getDay();
      if (day >= 1 && day <= 5) days.push(new Date(cursor));
      cursor.setDate(cursor.getDate() - 1);
    }
    return days.reverse();
  };

  // Extract maximum date present in dataset (Students.unassistences.day => 'dd-mm-yy')
  const getMaxDataDate = (): Date | null => {
    let max: Date | null = null;
    const toDate = (key: string) => {
      const [dd, mm, yy] = key.split('-').map((v) => parseInt(v, 10));
      const yyyy = 2000 + yy;
      return new Date(yyyy, mm - 1, dd);
    };
    Students.forEach((s) => {
      s.unassistences.forEach((u) => {
        const d = toDate(u.day);
        if (!max || d.getTime() > max.getTime()) max = d;
      });
    });
    return max;
  };

  const effectiveInitialDates = useMemo(() => {
    return initialAssignedDate ?? getLastFiveBusinessDays();
  }, [initialAssignedDate]);

  // On first load, sync local DateRangePicker with store; if store is empty, set last 5 business days
  useEffect(() => {
    if (assignedWeekdays && assignedWeekdays.length && !range) {
      const start = assignedWeekdays[0];
      const end = assignedWeekdays[assignedWeekdays.length - 1];
      setRange([start, end]);
      return;
    }
    if (!assignedWeekdays || assignedWeekdays.length === 0) {
      const last5 = getLastFiveBusinessDays();
      if (last5.length) {
        const start = last5[0];
        const end = last5[last5.length - 1];
        setAssignedDateRange([start, end]);
        setRange([start, end]);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // After Students load, if current selection yields no data, adjust to last 5 weekdays from dataset max date
  useEffect(() => {
    if (!Students.length) return;
    // Build a set of comparison keys for current assignedWeekdays
    const toComparison = (d: Date) => {
      const dd = String(d.getDate()).padStart(2, '0');
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const yy = String(d.getFullYear()).slice(2);
      return `${dd}-${mm}-${yy}`;
    };
    const currentDays = (
      assignedWeekdays && assignedWeekdays.length
        ? assignedWeekdays
        : effectiveInitialDates
    ) as Date[];
    if (!currentDays || currentDays.length === 0) return;
    const currentSet = new Set(currentDays.map(toComparison));
    let totalCount = 0;
    Students.forEach((s) => {
      s.unassistences.forEach((u) => {
        if (currentSet.has(u.day)) totalCount += 1;
      });
    });
    if (totalCount === 0) {
      const maxDate = getMaxDataDate();
      if (maxDate) {
        const last5FromData = getLastNWeekdaysFrom(maxDate, 5);
        const start = last5FromData[0];
        const end = last5FromData[last5FromData.length - 1];
        setAssignedDateRange([start, end]);
        setRange([start, end]);
      }
    }
    // We want this to run when Students change or assignedWeekdays/effectiveInitialDates change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [Students]);

  const selectLastFiveBusinessDays = () => {
    const last5 = getLastFiveBusinessDays();
    if (last5.length) {
      const start = last5[0];
      const end = last5[last5.length - 1];
      setAssignedDateRange([start, end]);
      setRange([start, end]);
    }
  };

  const [graphMode, setGraphMode] = useState<'each' | 'prom'>('each');
  const partitionOptions = [
    { value: 'Day', label: 'Por Día' },
    { value: 'Week', label: 'Por Semana' },
    { value: 'Month', label: 'Por Mes' },
    { value: 'Year', label: 'Por Año' },
  ];
  const [partitionMode, setPartitionMode] = useState<
    'Day' | 'Week' | 'Month' | 'Year'
  >('Day');
  const [range, setRange] = useState<[Date, Date] | null>(null);
  const now = new Date();
  const predefinedRanges = [
    { label: 'Hoy', value: [new Date(), new Date()], placement: 'bottom' },
    {
      label: 'Ayer',
      value: [addDays(new Date(), -1), addDays(new Date(), -1)],
      placement: 'bottom',
    },
    {
      label: 'Ultimos 7 dias',
      value: [addDays(new Date(), -7), new Date()],
      placement: 'bottom',
    },
    {
      label: 'Ultimos 30 dias',
      value: [addDays(new Date(), -30), new Date()],
      placement: 'bottom',
    },
    { label: 'Este año', value: [startOfYear(now), now], placement: 'bottom' },
  ];

  const updateRange = (newRange: [Date, Date] | null) => {
    if (newRange && Array.isArray(newRange) && newRange[0] && newRange[1]) {
      const [start, end] = newRange as [Date, Date];
      const weekdays: Date[] = [];
      const cursor = new Date(start);
      while (cursor.getTime() <= end.getTime()) {
        const day = cursor.getDay();
        if (day >= 1 && day <= 5) {
          weekdays.push(new Date(cursor));
        }
        cursor.setDate(cursor.getDate() + 1);
      }
      if (weekdays.length === 0) {
        setAssignedDateRange(null);
      } else {
        const assigned: [Date, Date] = [
          weekdays[0],
          weekdays[weekdays.length - 1],
        ];
        setAssignedDateRange(assigned);
      }
    } else {
      setAssignedDateRange(null);
    }
  };

  const formatDate = (date: Date): { display: string; comparison: string } => {
    const dayNames = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie'];
    const dayOfWeek = date.getDay();
    const dayName =
      dayOfWeek >= 1 && dayOfWeek <= 5 ? dayNames[dayOfWeek - 1] : '';
    const displayDate = `${dayName} ${date
      .getDate()
      .toString()
      .padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}`;
    const comparisonDate = `${date.getDate().toString().padStart(2, '0')}-${(
      date.getMonth() + 1
    )
      .toString()
      .padStart(2, '0')}-${date.getFullYear().toString().slice(2)}`;
    return { display: displayDate, comparison: comparisonDate };
  };

  const getDaysToDisplay = useMemo(() => {
    const sourceDates =
      assignedWeekdays && assignedWeekdays.length
        ? assignedWeekdays
        : effectiveInitialDates || [];
    if (!sourceDates || !sourceDates.length) {
      return { displayDates: [], comparisonDates: [] };
    }
    const displayDates: string[] = [];
    const comparisonDates: string[] = [];
    const sortedDates = [...sourceDates].sort(
      (a, b) => a.getTime() - b.getTime()
    );
    sortedDates.forEach((date) => {
      const formatted = formatDate(date);
      displayDates.push(formatted.display);
      comparisonDates.push(formatted.comparison);
    });
    return { displayDates, comparisonDates };
  }, [assignedWeekdays, effectiveInitialDates]);

  const getUnassistencesData = useMemo(() => {
    const { comparisonDates } = getDaysToDisplay;
    const daysCount = comparisonDates.length;
    const totalUnassistences: number[] = new Array(daysCount).fill(0);
    const justifiedUnassistences: number[] = new Array(daysCount).fill(0);
    const unjustifiedUnassistences: number[] = new Array(daysCount).fill(0);
    Students.forEach((student: Student) => {
      student.unassistences.forEach((unassistance: Unassistance) => {
        const dayIndex = comparisonDates.indexOf(unassistance.day);
        if (dayIndex !== -1) {
          totalUnassistences[dayIndex]++;
          if (unassistance.isJustified) {
            justifiedUnassistences[dayIndex]++;
          } else {
            unjustifiedUnassistences[dayIndex]++;
          }
        }
      });
    });
    return {
      total: totalUnassistences,
      justified: justifiedUnassistences,
      unjustified: unjustifiedUnassistences,
    };
  }, [getDaysToDisplay]);

  const getStudentsWithUnassistences = useMemo(() => {
    const { comparisonDates } = getDaysToDisplay;
    const studentsWithUnassistences: Student[] = [];
    if (comparisonDates.length === 0) {
      return studentsWithUnassistences;
    }
    Students.forEach((student: Student) => {
      const hasUnassistencesInRange = student.unassistences.some((u) =>
        comparisonDates.includes(u.day)
      );
      if (hasUnassistencesInRange) {
        studentsWithUnassistences.push(student);
      }
    });
    return studentsWithUnassistences;
  }, [getDaysToDisplay]);

  const { total, justified, unjustified } = getUnassistencesData;
  const studentsWithUnassistences = getStudentsWithUnassistences;
  const { displayDates } = getDaysToDisplay;

  const { comparisonDates } = getDaysToDisplay;
  const comparisonSet = useMemo(
    () => new Set(comparisonDates),
    [comparisonDates]
  );
  const parseDayKey = (key: string): Date => {
    const [dd, mm, yy] = key.split('-').map((v) => parseInt(v, 10));
    const yyyy = 2000 + yy;
    return new Date(yyyy, mm - 1, dd);
  };
  const isBusinessDay = (d: Date) => d.getDay() >= 1 && d.getDay() <= 5;

  const perDayTotals = useMemo(() => {
    const map = new Map<
      string,
      { t: number; j: number; u: number; date: Date }
    >();
    comparisonDates.forEach((key) => {
      const date = parseDayKey(key);
      map.set(key, { t: 0, j: 0, u: 0, date });
    });
    Students.forEach((s) => {
      s.unassistences.forEach((u) => {
        if (comparisonSet.has(u.day)) {
          const rec = map.get(u.day);
          if (rec) {
            rec.t += 1;
            if (u.isJustified) rec.j += 1;
            else rec.u += 1;
          }
        }
      });
    });
    return map;
  }, [Students, comparisonDates, comparisonSet]);

  type PartKey = string;
  const partitionKeys = useMemo(() => {
    const byDay = new Map<PartKey, number>();
    const byWeek = new Map<PartKey, number>();
    const byMonth = new Map<PartKey, number>();
    const byYear = new Map<PartKey, number>();
    comparisonDates.forEach((k) => {
      const d = parseDayKey(k);
      if (!isBusinessDay(d)) return;
      const dayKey = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie'][d.getDay() - 1];
      byDay.set(dayKey, (byDay.get(dayKey) || 0) + 1);
      const weekKey = `${getISOWeekYear(d)}-W${String(getISOWeek(d)).padStart(
        2,
        '0'
      )}`;
      byWeek.set(weekKey, (byWeek.get(weekKey) || 0) + 1);
      const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
        2,
        '0'
      )}`;
      byMonth.set(monthKey, (byMonth.get(monthKey) || 0) + 1);
      const yearKey = `${d.getFullYear()}`;
      byYear.set(yearKey, (byYear.get(yearKey) || 0) + 1);
    });
    return { byDay, byWeek, byMonth, byYear };
  }, [comparisonDates]);

  const partitionEnabled = useMemo(() => {
    const dayGroups = partitionKeys.byDay.size;
    const weekGroups = partitionKeys.byWeek.size;
    const monthGroups = partitionKeys.byMonth.size;
    const yearGroups = partitionKeys.byYear.size;
    return {
      Day: dayGroups >= 1,
      Week: weekGroups >= 1,
      Month: monthGroups >= 1,
      Year: yearGroups >= 1,
    } as Record<'Day' | 'Week' | 'Month' | 'Year', boolean>;
  }, [partitionKeys]);

  useEffect(() => {
    if (graphMode !== 'prom') return;
    if (!partitionEnabled[partitionMode]) {
      const order: Array<'Day' | 'Week' | 'Month' | 'Year'> = [
        'Day',
        'Week',
        'Month',
        'Year',
      ];
      const next = order.find((k) => partitionEnabled[k]) || 'Day';
      setPartitionMode(next);
    }
  }, [graphMode, partitionEnabled, partitionMode]);

  const partitioned = useMemo(() => {
    if (comparisonDates.length === 0) return null;
    const labels: string[] = [];
    const totals: number[] = [];
    const justs: number[] = [];
    const unjs: number[] = [];
    const pushGroup = (label: string, keys: string[]) => {
      const denom = keys.length || 1;
      let sumT = 0,
        sumJ = 0,
        sumU = 0;
      keys.forEach((k) => {
        const rec = perDayTotals.get(k);
        if (rec) {
          sumT += rec.t;
          sumJ += rec.j;
          sumU += rec.u;
        }
      });
      labels.push(label);
      totals.push(parseFloat((sumT / denom).toFixed(2)));
      justs.push(parseFloat((sumJ / denom).toFixed(2)));
      unjs.push(parseFloat((sumU / denom).toFixed(2)));
    };

    if (partitionMode === 'Day') {
      const dayMap: Record<string, string[]> = {
        Lun: [],
        Mar: [],
        Mié: [],
        Jue: [],
        Vie: [],
      };
      comparisonDates.forEach((k) => {
        const d = parseDayKey(k);
        if (!isBusinessDay(d)) return;
        const key = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie'][d.getDay() - 1];
        dayMap[key].push(k);
      });
      (['Lun', 'Mar', 'Mié', 'Jue', 'Vie'] as const).forEach((lab) => {
        if (dayMap[lab].length) pushGroup(lab, dayMap[lab]);
      });
    } else if (partitionMode === 'Week') {
      const map = new Map<string, string[]>();
      comparisonDates.forEach((k) => {
        const d = parseDayKey(k);
        const wk = `${getISOWeekYear(d)}-W${String(getISOWeek(d)).padStart(
          2,
          '0'
        )}`;
        if (!map.has(wk)) map.set(wk, []);
        map.get(wk)!.push(k);
      });
      const keys = Array.from(map.keys()).sort();
      keys.forEach((wk) => pushGroup(wk, map.get(wk)!));
    } else if (partitionMode === 'Month') {
      const map = new Map<string, { keys: string[]; date: Date }>();
      comparisonDates.forEach((k) => {
        const d = parseDayKey(k);
        const mk = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
          2,
          '0'
        )}`;
        if (!map.has(mk)) map.set(mk, { keys: [], date: d });
        map.get(mk)!.keys.push(k);
      });
      const keys = Array.from(map.keys()).sort();
      keys.forEach((mk) => {
        const d = map.get(mk)!.date;
        const label = d
          .toLocaleDateString('es-ES', { month: 'short', year: 'numeric' })
          .replace('.', '');
        pushGroup(label, map.get(mk)!.keys);
      });
    } else if (partitionMode === 'Year') {
      const map = new Map<string, string[]>();
      comparisonDates.forEach((k) => {
        const d = parseDayKey(k);
        const yk = `${d.getFullYear()}`;
        if (!map.has(yk)) map.set(yk, []);
        map.get(yk)!.push(k);
      });
      const keys = Array.from(map.keys()).sort();
      keys.forEach((yk) => pushGroup(yk, map.get(yk)!));
    }

    return { labels, totals, justs, unjs };
  }, [comparisonDates, perDayTotals, partitionMode]);

  const onChartClickEach = () => {
    openDataTable(
      React.createElement(DataTable as any, {
        tableData: studentsWithUnassistences,
      }),
      graphName
    );
  };
  const onChartClickPartitioned = () => {
    openDataTable(
      React.createElement(DataTable as any, {
        tableData: studentsWithUnassistences,
      }),
      `${graphName} (Rango)`
    );
  };

  // no-op

  return {
    // toolbar state
    range,
    setRange,
    predefinedRanges,
    onRangeChange: (value: any) => {
      if (value && Array.isArray(value) && value[0] && value[1]) {
        setRange([value[0], value[1]] as [Date, Date]);
        updateRange([value[0], value[1]] as [Date, Date]);
      } else {
        setRange(null);
      }
    },
    onRangeOk: (value: any) => updateRange(value),
    onRangeClean: () => {
      setRange(null);
      setAssignedDateRange(null);
    },
    graphMode,
    setGraphMode,
    partitionMode,
    setPartitionMode,
    partitionOptions,
    partitionEnabled,

    // chart data
    displayDates,
    total,
    justified,
    unjustified,
    partitioned,

    // click handlers
    onChartClickEach,
    onChartClickPartitioned,

    // helpers
    selectLastFiveBusinessDays,
  };
};
