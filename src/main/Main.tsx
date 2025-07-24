import { useEffect } from 'react';
import { AsideMenu } from './components/AsideMenu';
import { Navbar } from './components/Navbar';
import { CalendarFullCalendar } from './components/CalendarFullCalendar';

export const Main = () => {
  useEffect(() => {
    document.title = 'Inicio';
  }, []);
  return (
    <div className='flex flex-row h-[100vh] w-[100vw] p-3 '>
      <AsideMenu />

      <div className='w-full'>
        <Navbar />

        <div className='w-[75%] flex flex-row '>
          <CalendarFullCalendar />
        </div>
      </div>
    </div>
  );
};
