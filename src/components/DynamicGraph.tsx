import {
  Box,
  List,
  ListItem,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
} from '@mui/material';
import { BarChart } from '@mui/x-charts';
import { useGraphStore } from '../Store/specificStore/GraphStore.ts';
import { useStore } from '../Store/Store.ts';
import { DataTable } from '../components/DataTable';
import { useEffect, useMemo, useRef } from 'react';
// Toolbar fusionada dentro del componente
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import { DateRangePicker } from 'rsuite';
import { addDays, startOfYear, getISOWeek, getISOWeekYear } from 'date-fns';
import { useState } from 'react';

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

interface Props {
  dataTableName: string;
  initialAssignedDate?: Date[] | null;
  grid: string;
  toolbarEnabled?: boolean; // nueva prop para ocultar / desactivar toolbar
}

export const DynamicGraph = ({
  dataTableName,
  initialAssignedDate = null,
  grid,
  toolbarEnabled = true,
}: Props) => {
  const [Students, setStudents] = useState<Student[]>([]);
  useEffect(() => {
    const fetchData = async () => {
      const studentsData = await import('../data/Students.json');
      setStudents(studentsData.default);
    };
    fetchData();
  }, []);
  // openDataTable sigue en Store global, pero assignedWeekdays ahora viene de GraphStore
  const openDataTable = useStore((s) => s.openDialog);
  const assignedWeekdays = useGraphStore((s) => s.assignedWeekdays);
  // Fechas por defecto: última semana laboral (Lun-Vie) anterior a la semana actual
  const getLastBusinessWeekDates = (): Date[] => {
    const today = new Date();
    const day = today.getDay(); // 0=Dom, 1=Lun, ... 6=Sáb
    // Encontrar el lunes de esta semana
    const thisMonday = new Date(today);
    const offsetToMonday = (day + 6) % 7; // cuántos días retroceder para llegar a lunes
    thisMonday.setDate(thisMonday.getDate() - offsetToMonday);
    // Lunes de la última semana
    const lastMonday = new Date(thisMonday);
    lastMonday.setDate(lastMonday.getDate() - 7);
    // Construir Lun-Vie
    const dates: Date[] = [];
    for (let i = 0; i < 5; i++) {
      const d = new Date(lastMonday);
      d.setDate(lastMonday.getDate() + i);
      dates.push(d);
    }
    return dates;
  };

  const effectiveInitialDates = useMemo(() => {
    return initialAssignedDate ?? getLastBusinessWeekDates();
  }, [initialAssignedDate]);

  // --- Estado local para modo de gráfico y rango de fechas (fusionado de Toolbar) ---
  const [graphMode, setGraphMode] = useState<'each' | 'prom'>('each');
  // Nuevo: particionamiento
  const partitionOptions = [
    { value: 'Day', label: 'Por Día' },
    { value: 'Week', label: 'Por Semana' },
    { value: 'Month', label: 'Por Mes' },
    { value: 'Year', label: 'Por Año' },
  ];
  const [partitionMode, setPartitionMode] = useState<
    'Day' | 'Week' | 'Month' | 'Year'
  >('Day');
  const { setAssignedDateRange } = useGraphStore();
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

  // Función para formatear fechas
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

  // Obtener los días a mostrar según initialAssignedDate
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

  // Función para contar inasistencias
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

  // Función para obtener los estudiantes con inasistencias
  const getStudentsWithUnassistences = useMemo(() => {
    const { comparisonDates } = getDaysToDisplay;
    const studentsWithUnassistences: Student[] = [];

    // Si no hay días seleccionados, no mostrar estudiantes
    if (comparisonDates.length === 0) {
      return studentsWithUnassistences;
    }

    Students.forEach((student: Student) => {
      // Verificar si el estudiante tiene inasistencias en los días seleccionados
      const hasUnassistencesInRange = student.unassistences.some(
        (unassistance) => comparisonDates.includes(unassistance.day)
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

  // --- Helpers para particionado ---
  const { comparisonDates } = getDaysToDisplay;
  const comparisonSet = useMemo(
    () => new Set(comparisonDates),
    [comparisonDates]
  );

  const parseDayKey = (key: string): Date => {
    const [dd, mm, yy] = key.split('-').map((v) => parseInt(v, 10));
    const yyyy = 2000 + yy; // asumiendo siglo 2000
    return new Date(yyyy, mm - 1, dd);
  };
  const isBusinessDay = (d: Date) => d.getDay() >= 1 && d.getDay() <= 5;

  // Construir mapa de totales por día seleccionado (incluso días sin inasistencias -> 0)
  const perDayTotals = useMemo(() => {
    const map = new Map<
      string,
      { t: number; j: number; u: number; date: Date }
    >();
    // Inicializar a 0 para todos los días seleccionados
    comparisonDates.forEach((key) => {
      const date = parseDayKey(key);
      map.set(key, { t: 0, j: 0, u: 0, date });
    });
    // Acumular según Students
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

  // Layout: medir alto disponible para el gráfico (contenedor - toolbar)
  const containerRef = useRef<HTMLDivElement | null>(null);
  const toolbarRef = useRef<HTMLUListElement | null>(null);
  const [chartHeight, setChartHeight] = useState<number>(260);
  useEffect(() => {
    const recompute = () => {
      const cont = containerRef.current;
      if (!cont) return;
      const total = cont.clientHeight;
      const tb = toolbarEnabled ? toolbarRef.current?.clientHeight ?? 0 : 0;
      const padding = 8; // margen inferior pequeño
      const available = Math.max(140, total - tb - padding);
      setChartHeight(available);
    };
    recompute();
    const ro = new ResizeObserver(recompute);
    if (containerRef.current) ro.observe(containerRef.current);
    if (toolbarRef.current) ro.observe(toolbarRef.current);
    window.addEventListener('resize', recompute);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', recompute);
    };
  }, [toolbarEnabled]);

  type PartKey = string;
  const partitionKeys = useMemo(() => {
    const byDay = new Map<PartKey, number>(); // key -> count días
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
    const dayGroups = partitionKeys.byDay.size; // 1-5 según selección
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

  // Si cambia a modo prom o cambia el rango, validar el partitionMode actual
  useEffect(() => {
    if (graphMode !== 'prom') return;
    if (!partitionEnabled[partitionMode]) {
      // Elegir el primero disponible en orden de preferencia
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

  // Calcular promedios por partición
  const partitioned = useMemo(() => {
    if (comparisonDates.length === 0) return null;
    const labels: string[] = [];
    const totals: number[] = [];
    const justs: number[] = [];
    const unjs: number[] = [];

    // Helper para agregar un grupo
    const pushGroup = (
      label: string,
      keys: string[] // día keys pertenecientes al grupo
    ) => {
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
      // ordenar por clave cronológica
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

  // --- PROM (promedio del rango seleccionado) MODE LOGIC ---
  const rangeAverages = useMemo(() => {
    const { comparisonDates } = getDaysToDisplay;
    const daysCount = comparisonDates.length;
    if (!daysCount) {
      return { avgTotal: 0, avgJustified: 0, avgUnjustified: 0 };
    }

    let sumTotal = 0;
    let sumJustified = 0;
    let sumUnjustified = 0;

    Students.forEach((student: Student) => {
      student.unassistences.forEach((u) => {
        if (comparisonDates.includes(u.day)) {
          sumTotal += 1;
          if (u.isJustified) sumJustified += 1;
          else sumUnjustified += 1;
        }
      });
    });

    const divisor = daysCount || 1;
    const avgTotal = parseFloat((sumTotal / divisor).toFixed(2));
    const avgJustified = parseFloat((sumJustified / divisor).toFixed(2));
    const avgUnjustified = parseFloat((sumUnjustified / divisor).toFixed(2));
    return { avgTotal, avgJustified, avgUnjustified };
  }, [getDaysToDisplay, Students]);

  // Si no hay días para mostrar, renderizar un contenedor vacío
  if (displayDates.length === 0) {
    return (
      <Box
        className={grid}
        display='flex'
        alignItems='center'
        justifyContent='center'
        sx={{ border: '1px dashed #ccc', borderRadius: 2 }}
      >
        <Box color='text.secondary'>
          Seleccione un rango de fechas para visualizar los datos
        </Box>
      </Box>
    );
  }

  return (
    <Box
      className={grid}
      ref={containerRef as any}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        minHeight: 0,
      }}
    >
      {toolbarEnabled && (
        <List
          dense
          ref={toolbarRef as any}
          className='bg-acento/40 rounded-lg flex flex-row items-center p-1 mb-1'
        >
          <ListItem disableGutters sx={{ py: 0, px: 1 }}>
            <DateRangePicker
              format='dd / MM / yyyy'
              placeholder='Seleccionar rango'
              showHeader={false}
              ranges={predefinedRanges as any}
              caretAs={CalendarMonthIcon}
              size='sm'
              value={range as any}
              onChange={(value) => {
                if (value && Array.isArray(value) && value[0] && value[1]) {
                  setRange([value[0], value[1]] as [Date, Date]);
                  // Actualizar inmediatamente el rango asignado para reflejarse en el gráfico
                  updateRange([value[0], value[1]] as [Date, Date]);
                } else {
                  setRange(null);
                }
              }}
              onOk={(value) => updateRange(value)}
              onClean={() => {
                setRange(null);
                setAssignedDateRange(null);
              }}
            />
          </ListItem>
          <ListItem disableGutters sx={{ py: 0, px: 1 }}>
            <FormControl size='small'>
              <InputLabel id='graph-mode-label'>Modo</InputLabel>
              <Select
                size='small'
                value={graphMode}
                onChange={(e) =>
                  setGraphMode(e.target.value as 'each' | 'prom')
                }
                label='Modo'
                className='bg-white/50 rounded-xl'
                inputProps={{ 'aria-label': 'graph-mode' }}
              >
                <MenuItem value='each'>Cada uno</MenuItem>
                <MenuItem value='prom'>Promedio</MenuItem>
              </Select>
            </FormControl>
          </ListItem>
          {graphMode === 'prom' && (
            <ListItem disableGutters sx={{ py: 0, px: 1 }}>
              <FormControl size='small'>
                <InputLabel id='partition-mode-label'>Partición</InputLabel>
                <Select
                  size='small'
                  value={partitionMode}
                  onChange={(e) =>
                    setPartitionMode(
                      e.target.value as 'Day' | 'Week' | 'Month' | 'Year'
                    )
                  }
                  label='Partición'
                  className='bg-white/50 rounded-xl'
                  inputProps={{ 'aria-label': 'partition-mode' }}
                >
                  {partitionOptions.map((opt) => (
                    <MenuItem
                      key={opt.value}
                      value={opt.value}
                      disabled={
                        !partitionEnabled[
                          opt.value as 'Day' | 'Week' | 'Month' | 'Year'
                        ]
                      }
                    >
                      {opt.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </ListItem>
          )}
        </List>
      )}
      {/* Aquí irá la lógica de agrupamiento y renderizado según partitionMode */}
      {graphMode === 'each' ? (
        <BarChart
          barLabel='value'
          height={chartHeight}
          xAxis={[
            {
              data: displayDates,
              categoryGapRatio: 0.2,
              barGapRatio: 0,
            },
          ]}
          series={[
            { data: total, color: '#ff5b5b', label: 'Total' },
            {
              data: justified,
              color: '#ffaf45',
              label: 'Justificadas',
              stack: 'total',
            },
            {
              data: unjustified,
              color: '#ff6b6b',
              label: 'Injustificadas',
              stack: 'total',
            },
          ]}
          onClick={() => {
            openDataTable(
              <DataTable tableData={studentsWithUnassistences} />,
              dataTableName
            );
          }}
          margin={{ top: 5, bottom: 5, left: 0, right: 10 }}
          borderRadius={10}
        />
      ) : partitioned ? (
        <BarChart
          barLabel='value'
          height={chartHeight}
          xAxis={[
            {
              data: partitioned.labels,
              categoryGapRatio: 0.2,
              barGapRatio: 0,
            },
          ]}
          series={[
            {
              data: partitioned.totals,
              color: '#ff5b5b',
              label: 'Promedio Total',
            },
            {
              data: partitioned.justs,
              color: '#ffaf45',
              label: 'Promedio Justificadas',
              stack: 'prom',
            },
            {
              data: partitioned.unjs,
              color: '#ff6b6b',
              label: 'Promedio Injustificadas',
              stack: 'prom',
            },
          ]}
          onClick={() => {
            openDataTable(
              <DataTable tableData={studentsWithUnassistences} />,
              `${dataTableName} (Rango)`
            );
          }}
          margin={{ top: 5, bottom: 5, left: 0, right: 10 }}
          borderRadius={10}
        />
      ) : null}
    </Box>
  );
};
