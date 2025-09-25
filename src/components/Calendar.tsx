import React, { useEffect, useMemo, useState } from 'react';
import { useStore } from '../Store/Store';
import { DataTable } from './DataTable/DataTable';
import { ErrorBoundary } from 'react-error-boundary';

type AbsencesMap = Record<string, number>;

type CalendarProps = {
  absences?: AbsencesMap;
  initialDate?: Date;
  onDayClick?: (date: Date) => void;
  className?: string;
  headerTextClass?: string;
  dayNumberClass?: string;
  absencesNumberClass?: string;
  cellBgClass?: string;
};

// Tipos locales para cargar Students.json y mapear inasistencias
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

const MONTHS_ES = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
];

const WEEKDAYS_ES = [
  'Lunes',
  'Martes',
  'Miércoles',
  'Jueves',
  'Viernes',
  'Sábado',
  'Domingo',
];

function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}
function addDays(d: Date, days: number) {
  const nd = new Date(d);
  nd.setDate(nd.getDate() + days);
  return nd;
}
function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}
function getMonday(date: Date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = (day === 0 ? -6 : 1) - day;
  d.setDate(d.getDate() + diff);
  return d;
}
function fmtYmd(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${dd}`;
}

export const Calendar: React.FC<CalendarProps> = ({
  absences = {},
  initialDate,
  onDayClick,
  className,
  headerTextClass,
  dayNumberClass,
  absencesNumberClass,
  cellBgClass,
}) => {
  const today = useMemo(() => new Date(), []);
  const [viewDate, setViewDate] = useState<Date>(() =>
    startOfMonth(initialDate ?? today)
  );

  // Aggregar inasistencias desde Students.json si no se proveen por props
  const [aggregatedAbsences, setAggregatedAbsences] = useState<AbsencesMap>({});
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const mod = await import('../data/Students.json');
        const students: StudentRec[] = (mod as any).default || mod;
        const map: AbsencesMap = {};
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
            map[iso] = (map[iso] || 0) + 1;
          });
        });
        if (mounted) setAggregatedAbsences(map);
      } catch (e) {
        // no-op: si falla la carga, simplemente no mostramos datos
      }
    };
    // Usar datos de Students solo si no llegan por props
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

  const gridDays = useMemo(() => {
    const start = getMonday(startOfMonth(viewDate));
    return Array.from({ length: 35 }, (_, i) => addDays(start, i));
  }, [viewDate]);

  const title = `${MONTHS_ES[viewDate.getMonth()]} ${viewDate.getFullYear()}`;

  const prevMonth = () =>
    setViewDate((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1));
  const nextMonth = () =>
    setViewDate((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1));

  const handleDayClick = (date: Date) => onDayClick?.(date);
  const openDialog = useStore((s) => s.openDialog);

  // Helper: obtener estudiantes que faltaron un día (por fecha ISO 'YYYY-MM-DD')
  const [studentsCache, setStudentsCache] = useState<StudentRec[] | null>(null);
  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const mod = await import('../data/Students.json');
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
    // Para fines de semana, no mostramos modal (opcional); igual podemos permitirlo
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
      <div
        className={[
          'w-full h-full flex flex-col border border-gray-200 rounded-lg overflow-hidden bg-white',
          className || '',
        ].join(' ')}
      >
        {/* Header de navegación */}
        <div className='flex items-center justify-between px-3 py-2 border-b border-gray-200'>
          <button
            type='button'
            onClick={prevMonth}
            className='px-2 py-1 rounded hover:bg-gray-100 active:bg-gray-200'
            aria-label='Mes anterior'
          >
            ◀
          </button>
          <div
            className={[
              'text-lg md:text-xl font-bold select-none',
              headerTextClass || '',
            ].join(' ')}
          >
            {title}
          </div>
          <button
            type='button'
            onClick={nextMonth}
            className='px-2 py-1 rounded hover:bg-gray-100 active:bg-gray-200'
            aria-label='Mes siguiente'
          >
            ▶
          </button>
        </div>

        {/* Encabezado de días de la semana */}
        <div className='grid grid-cols-7 px-2 py-1'>
          {WEEKDAYS_ES.map((d) => (
            <div
              key={d}
              className={[
                'text-center font-semibold text-sm md:text-base',
                headerTextClass || 'text-gray-700',
              ].join(' ')}
            >
              {d}
            </div>
          ))}
        </div>

        {/* Grilla del mes: 5 semanas x 7 días */}
        <div className='grid grid-cols-7 grid-rows-5 gap-px px-2 pb-2 grow min-h-0'>
          {gridDays.map((date) => {
            const inMonth = date.getMonth() === viewDate.getMonth();
            const key = fmtYmd(date);
            const abs = absencesSource[key] ?? 0;
            const isToday = isSameDay(date, today);
            const dayIdx = date.getDay(); // 0=Domingo, 6=Sábado
            const isWeekend = dayIdx === 0 || dayIdx === 6;

            // Fondo: fines de semana más oscuros que días hábiles
            const bgClass = inMonth
              ? isWeekend
                ? 'bg-gray-100'
                : cellBgClass || 'bg-white'
              : isWeekend
              ? 'bg-gray-200'
              : 'bg-gray-50';

            // Borde sutil para todos los días
            const borderClass = inMonth ? 'border-gray-300' : 'border-gray-200';
            return (
              <button
                type='button'
                key={key}
                onClick={() => {
                  handleDayClick(date);
                  // no mostrar número en fines de semana, pero sí permitir abrir el modal si se desea
                  openDayDetails(date);
                }}
                className={[
                  'relative w-full h-full rounded-md border',
                  bgClass,
                  'hover:bg-blue-50/40 active:bg-blue-100/40',
                  'flex flex-col items-center justify-center',
                  borderClass,
                  !inMonth ? 'text-gray-400' : '',
                  isToday ? 'ring-2 md:ring-4 ring-blue-500 ring-inset' : '',
                ].join(' ')}
              >
                {/* Número del día en esquina superior derecha */}
                <span
                  className={[
                    'absolute top-1 right-1 text-sm md:text-base font-semibold',
                    dayNumberClass || '',
                  ].join(' ')}
                >
                  {date.getDate()}
                </span>
                {/* Número de inasistencias centrado */}
                {!isWeekend && (
                  <span
                    className={[
                      'text-xl md:text-2xl font-bold',
                      absencesNumberClass ||
                        (abs > 0 ? 'text-red-500/70' : 'text-gray-300'),
                    ].join(' ')}
                  >
                    {abs}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </ErrorBoundary>
  );
};
