// import { DateRangePicker } from 'react-date-range';
// import { addDays, format, isWeekend } from 'date-fns';
// import { useState } from 'react';
// import 'react-date-range/dist/styles.css'; // main style file
// import 'react-date-range/dist/theme/default.css'; // theme css file
// import CancelIcon from '@mui/icons-material/Cancel';
// import { Dialog, DialogTitle } from '@mui/material';
// import { useStore } from '../../store/Store';

// export const Calendar = () => {
//   const dialog = useStore((state) => state.isDialogOpen);
//   const [state, setState] = useState({
//     selection: {
//       startDate: new Date(),
//       endDate: undefined,
//       key: 'selection',
//     },
//   });

//   const renderStaticRangeLabel = (range: any) => {
//     if (range.label === 'Hoy') {
//       return (
//         <div className='flex items-center gap-2 text-blue-700'>
//           <span className='font-semibold'>📅 {range.label}</span>
//         </div>
//       );
//     }

//     return <span>{range.label}</span>;
//   };

//   const customNonWeekendDay = (day: number | Date) => {
//     const isDisabled = isWeekend(day);

//     return (
//       <div
//         className={`rdrDayNumber flex items justify-between ${
//           isDisabled ? 'opacity-30' : ''
//         }`}
//       >
//         <div className='flex items-center justify-around'>
//           {isDisabled ? (
//             <CancelIcon style={{ fontSize: 12, color: '#f95f62' }} />
//           ) : (
//             <span>{format(day, 'd')}</span>
//           )}
//         </div>
//       </div>
//     );
//   };

//   return (
//     <Dialog open={dialog}>
//       <DialogTitle></DialogTitle>
//       <DateRangePicker
//         onChange={(item) => setState({ ...state, ...item })}
//         months={2}
//         minDate={addDays(new Date(), -365)}
//         maxDate={addDays(new Date(), 30)}
//         direction='vertical'
//         ranges={[state.selection]}
//         dayContentRenderer={customNonWeekendDay}
//         editableDateInputs={true}
//         renderStaticRangeLabel={renderStaticRangeLabel}
//         inputRanges={[]}
//         disabledDay={(date) => isWeekend(date)}
//       />
//     </Dialog>
//   );
// };

import { DateRangePicker } from 'rsuite';

export const Calendar = () => {
  return <DateRangePicker />;
};
