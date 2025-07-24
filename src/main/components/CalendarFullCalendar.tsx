import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import esLocale from '@fullcalendar/core/locales/es';
import { Box } from '@mui/material';

export const CalendarFullCalendar = () => {
  const eventContentX = () => {
    return (
      <img
        src='https://external-content.duckduckgo.com/iu/?u=http%3A%2F%2F2.bp.blogspot.com%2F-uGAqHSwQ0KY%2FUrIZwe_VJpI%2FAAAAAAAAlmk%2F8qqf4dTi_M0%2Fs1600%2Fgato.jpg&f=1&nofb=1&ipt=466328b732b64d5b4b11c59e92757802332c9af3a30d8e8d7d9181206bab59c1'
        alt='sss'
      />
    );
  };
  const handleDateClick = (arg: any) => {
    return alert(`${arg.startStr} - ${arg.endStr}`);
  };
  return (
    <Box className='ml-3 mr-3 bg-[#d5e4ec] h-full rounded-2xl p-3.5 w-full box-content'>
      <FullCalendar
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView='dayGridMonth'
        locale={esLocale}
        fixedWeekCount={false}
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,dayGridWeek,dayGridDay',
        }}
        eventContent={eventContentX}
        selectable={true}
        select={handleDateClick}
        height='100%'
        aspectRatio={0}
      />
    </Box>
  );
};
