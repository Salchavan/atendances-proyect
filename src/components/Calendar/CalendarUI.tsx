import React from 'react';
import { WEEKDAYS_ES, MONTHS_ES } from './utils';
import { DayCell } from './DayCell';
import type { AbsencesDetailMap, AbsencesMap, CalendarProps } from './types';

type CalendarUIProps = Pick<
  CalendarProps,
  | 'className'
  | 'headerTextClass'
  | 'dayNumberClass'
  | 'absencesNumberClass'
  | 'cellBgClass'
> & {
  viewDate: Date;
  today: Date;
  gridDays: Date[];
  absencesSource: AbsencesMap;
  detailsSource: AbsencesDetailMap;
  onPrev: () => void;
  onNext: () => void;
  onDayClick: (d: Date) => void;
  openDayDetails?: (d: Date) => void;
  specialDates?: string[]; // YYYY-MM-DD
};

export const CalendarUI: React.FC<CalendarUIProps> = ({
  className,
  headerTextClass,
  dayNumberClass,
  absencesNumberClass,
  cellBgClass,
  viewDate,
  today,
  gridDays,
  absencesSource,
  detailsSource,
  onPrev,
  onNext,
  onDayClick,
  openDayDetails,
  specialDates = [],
}) => {
  const title = `${MONTHS_ES[viewDate.getMonth()]} ${viewDate.getFullYear()}`;

  return (
    <div
      className={[
        'w-full h-full flex flex-col border border-gray-200 rounded-lg overflow-hidden bg-white',
        className || '',
      ].join(' ')}
    >
      <div className='flex items-center justify-between px-3 py-2 border-b border-gray-200'>
        <button
          type='button'
          onClick={onPrev}
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
          onClick={onNext}
          className='px-2 py-1 rounded hover:bg-gray-100 active:bg-gray-200'
          aria-label='Mes siguiente'
        >
          ▶
        </button>
      </div>

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

      <div className='grid grid-cols-7 grid-rows-5 gap-px px-2 pb-2 grow min-h-0'>
        {gridDays.map((date) => (
          <DayCell
            key={date.toISOString()}
            date={date}
            viewMonth={viewDate.getMonth()}
            today={today}
            onClick={onDayClick}
            absencesSource={absencesSource}
            detailsSource={detailsSource}
            dayNumberClass={dayNumberClass}
            absencesNumberClass={absencesNumberClass}
            cellBgClass={cellBgClass}
            openDayDetails={openDayDetails}
            specialDates={specialDates}
          />
        ))}
      </div>
    </div>
  );
};
