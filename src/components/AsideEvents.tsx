import { useState, useEffect } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { ErrorFallback } from './ErrorFallback';
import { useStore } from '../Store/Store';
import { fmtYmd } from './Calendar/utils';

interface AsideEventsProps {
  grid: string;
}

interface SpecialDay {
  date: string;
  title: string;
}

export const AsideEvents = ({ grid }: AsideEventsProps) => {
  const [specialDays, setSpecialDays] = useState<SpecialDay[]>([]);
  const [loading, setLoading] = useState(true);
  const setSpecialDates = useStore((s) => s.setSpecialDates);

  useEffect(() => {
    async function fetchHolidays() {
      try {
        const currentYear = new Date().getFullYear();
        const response = await fetch(
          `https://date.nager.at/api/v3/PublicHolidays/${currentYear}/AR`
        );
        const holidays = await response.json();

        type HolidayApiResponse = {
          date: string;
          localName: string;
          [key: string]: any;
        };

        const formattedHolidays = (holidays as HolidayApiResponse[]).map(
          (holiday) => ({
            title: holiday.localName,
            date: new Date(holiday.date).toLocaleDateString('es-AR'),
            dateObj: new Date(holiday.date),
          })
        );

        const futureHolidays = formattedHolidays.filter(
          (day) => day.dateObj.getTime() >= new Date().setHours(0, 0, 0, 0)
        );

        setSpecialDays(futureHolidays);

        // Publicar al store en formato YYYY-MM-DD
        const ymdList = futureHolidays.map((d) => fmtYmd(d.dateObj));
        setSpecialDates(ymdList);
      } catch (error) {
        console.error('Error fetching holidays', error);
      } finally {
        setLoading(false);
      }
    }
    fetchHolidays();
  }, [setSpecialDates]);

  if (loading) {
    return <div>Cargando días especiales...</div>;
  }

  return (
    <ErrorBoundary fallback={<ErrorFallback />}>
      <div className={`${grid} bg-secondary rounded-xl p-2`}>
        <div
          className='rounded-xl bg-secondary text-neutralLight text-3xl px-2 py-1'
          style={{ color: '#f2f2f2' }}
        >
          Próximos Días Especiales
        </div>
        <ul>
          {specialDays.map((day, index) => (
            <li
              key={index}
              className='flex flex-col items-start rounded-xl bg-neutralLight/70 text-text my-1 p-2'
            >
              <span className='text-xl font-bold'>{day.date}</span>
              <span className='text-sm'>{day.title}</span>
            </li>
          ))}
        </ul>
      </div>
    </ErrorBoundary>
  );
};
