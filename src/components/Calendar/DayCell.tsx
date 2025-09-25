import React from 'react';
import { fmtYmd, isSameDay } from './utils';
import type { AbsencesDetailMap, AbsencesMap } from './types';

type DayCellProps = {
  date: Date;
  viewMonth: number;
  today: Date;
  onClick: (date: Date) => void;
  absencesSource: AbsencesMap;
  detailsSource: AbsencesDetailMap;
  dayNumberClass?: string;
  absencesNumberClass?: string;
  cellBgClass?: string;
  openDayDetails?: (d: Date) => void;
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
}) => {
  const inMonth = date.getMonth() === viewMonth;
  const key = fmtYmd(date);
  const abs = absencesSource[key] ?? 0;
  const isToday = isSameDay(date, today);
  const dayIdx = date.getDay();
  const isWeekend = dayIdx === 0 || dayIdx === 6;

  const bgClass = inMonth
    ? isWeekend
      ? 'bg-gray-100'
      : cellBgClass || 'bg-white'
    : isWeekend
    ? 'bg-gray-200'
    : 'bg-gray-50';
  const borderClass = inMonth ? 'border-gray-300' : 'border-gray-200';

  return (
    <button
      type='button'
      onClick={() => {
        onClick(date);
        openDayDetails?.(date);
      }}
      className={[
        'group relative w-full h-full rounded-md border',
        bgClass,
        'hover:bg-blue-50/40 active:bg-blue-100/40',
        'flex flex-col items-center justify-center',
        borderClass,
        !inMonth ? 'text-gray-400' : '',
        isToday ? 'ring-2 md:ring-4 ring-blue-500 ring-inset' : '',
      ].join(' ')}
    >
      <span
        className={[
          'absolute top-1 right-1 text-sm md:text-base font-semibold',
          dayNumberClass || '',
        ].join(' ')}
      >
        {date.getDate()}
      </span>

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

      <div className='pointer-events-none absolute top-2 left-2 rounded-md bg-white/95 shadow-lg border border-gray-300 p-3 text-[11px] md:text-sm hidden group-hover:flex flex-col gap-1.5 z-20'>
        <div className='font-semibold text-gray-900'>Inasistencias</div>
        <div className='flex flex-col gap-1.5'>
          <div className='flex items-center'>
            <span className='inline-block w-4 h-4 md:w-5 md:h-5 rounded-sm bg-error mr-2'></span>
            <span className='text-error'>
              Total: <span className='font-semibold'>{abs}</span>
            </span>
          </div>
          {detailsSource[key] && (
            <>
              <div className='flex items-center'>
                <span className='inline-block w-4 h-4 md:w-5 md:h-5 rounded-sm bg-green-600 mr-2'></span>
                <span className='text-green-700'>
                  Justificadas:{' '}
                  <span className='font-semibold'>
                    {detailsSource[key].justified}
                  </span>
                </span>
              </div>
              <div className='flex items-center'>
                <span className='inline-block w-4 h-4 md:w-5 md:h-5 rounded-sm bg-red-600 mr-2'></span>
                <span className='text-red-700'>
                  No justificadas:{' '}
                  <span className='font-semibold'>
                    {detailsSource[key].unjustified}
                  </span>
                </span>
              </div>
            </>
          )}
        </div>
      </div>
    </button>
  );
};
