import React from 'react';
import { fmtYmd } from './utils';

type DayCellProps = {
  date: Date;
  viewMonth: number;
  today: Date;
  onClick: (d: Date) => void;
  absencesSource: Record<string, number>;
  detailsSource: Record<
    string,
    { total: number; justified: number; unjustified: number }
  >;

  dayNumberClass?: string;
  absencesNumberClass?: string;
  cellBgClass?: string;
  openDayDetails?: (d: Date) => void;
  specialDates?: string[]; // YYYY-MM-DD
};

export const DayCell: React.FC<DayCellProps> = ({
  date,
  viewMonth,
  today,
  onClick,
  absencesSource,
  detailsSource,
  dayNumberClass,
  absencesNumberClass,
  cellBgClass,
  openDayDetails,
  specialDates = [],
}) => {
  const ymd = fmtYmd(date);
  const inMonth = date.getMonth() === viewMonth;
  const isWeekend = date.getDay() === 0 || date.getDay() === 6;
  const isSpecial = specialDates.includes(ymd);
  const isToday =
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate();

  // Aplica estilo de "domingo" si es especial
  const weekendLike = isWeekend || isSpecial;

  const baseBg = inMonth ? 'bg-white' : 'bg-gray-50';
  const weekendBg = inMonth ? 'bg-gray-100' : 'bg-gray-200';
  const bgClass = weekendLike ? weekendBg : cellBgClass || baseBg;

  const borderClass = inMonth ? 'border-gray-300' : 'border-gray-200';
  const ringClass = isToday ? 'ring-2 md:ring-4 ring-blue-500 ring-inset' : '';

  const absences = absencesSource[ymd] || 0;
  const details = detailsSource[ymd];

  const handleClick = () => {
    onClick(date);
    openDayDetails?.(date);
  };

  return (
    <button
      type='button'
      onClick={handleClick}
      className={[
        'relative w-full h-full rounded-md border flex flex-col items-center justify-center hover:bg-blue-50/40 group',
        bgClass,
        borderClass,
        ringClass,
      ].join(' ')}
    >
      {/* Número del día */}
      <div
        className={[
          'absolute top-1 right-1 text-xs md:text-sm select-none',
          inMonth ? 'text-gray-900' : 'text-gray-400',
          dayNumberClass || '',
        ].join(' ')}
      >
        {date.getDate()}
      </div>

      {/* Número de inasistencias (oculto en fines de semana y días especiales) */}
      {!weekendLike && (
        <div
          className={[
            'font-extrabold text-red-600 text-xl md:text-2xl select-none',
            absencesNumberClass || '',
          ].join(' ')}
        >
          {absences}
        </div>
      )}

      {/* Tooltip (si existe) */}
      {details && (
        <div className='hidden group-hover:flex absolute top-2 left-2 z-20 bg-white border border-gray-300 rounded-md shadow p-3 text-[11px] md:text-sm flex-col gap-1.5'>
          <div className='font-semibold text-gray-800'>Inasistencias</div>
          <div className='flex items-center gap-2'>
            <span className='w-4 h-4 md:w-5 md:h-5 rounded-sm bg-slate-700' />
            <span className='text-gray-700'>Total:</span>
            <span className='font-semibold text-gray-900'>{details.total}</span>
          </div>
          <div className='flex items-center gap-2'>
            <span className='w-4 h-4 md:w-5 md:h-5 rounded-sm bg-green-600' />
            <span className='text-gray-700'>Justificadas:</span>
            <span className='font-semibold text-gray-900'>
              {details.justified}
            </span>
          </div>
          <div className='flex items-center gap-2'>
            <span className='w-4 h-4 md:w-5 md:h-5 rounded-sm bg-red-600' />
            <span className='text-gray-700'>No justificadas:</span>
            <span className='font-semibold text-gray-900'>
              {details.unjustified}
            </span>
          </div>
        </div>
      )}
    </button>
  );
};
