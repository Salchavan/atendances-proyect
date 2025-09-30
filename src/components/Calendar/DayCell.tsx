import React from 'react';
import { Box, Typography, ButtonBase, Tooltip } from '@mui/material';
import { fmtYmd } from './utils';
import type { AbsencesMap, AbsencesDetailMap } from '../../types/generalTypes';

type DayCellProps = {
  date: Date;
  viewMonth: number;
  today: Date;
  onClick: (d: Date) => void;
  absencesSource: AbsencesMap;
  detailsSource: AbsencesDetailMap;
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

  const weekendLike = isWeekend || isSpecial;
  const absences = absencesSource[ymd] || 0;
  const details = detailsSource[ymd];

  const handleClick = () => {
    onClick(date);
    openDayDetails?.(date);
  };

  const CellContent = (
    <Box
      component={ButtonBase}
      onClick={handleClick}
      sx={{
        position: 'relative',
        width: '100%',
        height: '100%',
        borderRadius: 1,
        border: '1px solid',
        borderColor: weekendLike ? 'transparent' : 'divider',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        // Weekdays (laborales) -> gris; fines de semana -> color del fondo (paper)
        bgcolor: inMonth
          ? weekendLike
            ? 'background.default' // weekend/special inside month: blend with container
            : 'background.paper' // weekdays inside month: grey-ish
          : 'background.default', // out-of-month: de-emphasize
        '&:hover': {
          bgcolor: weekendLike ? 'background.default' : 'action.hover',
        },
        outline: isToday ? '2px solid' : 'none',
        outlineColor: isToday ? 'primary.main' : 'transparent',
        outlineOffset: isToday ? -1 : 0,
      }}
    >
      {/* Número del día */}
      <Typography
        variant='caption'
        sx={{
          position: 'absolute',
          top: 6,
          right: 6,
          userSelect: 'none',
          color: inMonth
            ? weekendLike
              ? 'text.disabled'
              : 'text.primary'
            : 'text.disabled',
        }}
        className={
          dayNumberClass
            ? `${dayNumberClass} calendar-day-number`
            : 'calendar-day-number'
        }
      >
        {date.getDate()}
      </Typography>

      {/* Número de inasistencias (oculto en fines de semana y días especiales) */}
      {!weekendLike && (
        <Typography
          variant='h5'
          fontWeight={800}
          color='error.main'
          className={
            absencesNumberClass
              ? `${absencesNumberClass} calendar-absences-number`
              : 'calendar-absences-number'
          }
          sx={{ userSelect: 'none' }}
        >
          {absences}
        </Typography>
      )}
    </Box>
  );

  if (!details) return CellContent;

  const tooltip = (
    <Box sx={{ p: 1 }}>
      <Typography variant='subtitle2' fontWeight={600} sx={{ mb: 0.5 }}>
        Inasistencias
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
        <Box
          sx={{ width: 16, height: 16, borderRadius: 0.5, bgcolor: 'grey.800' }}
        />
        <Typography variant='body2' color='text.secondary'>
          Total:
        </Typography>
        <Typography variant='body2' fontWeight={600}>
          {details.total}
        </Typography>
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
        <Box
          sx={{
            width: 16,
            height: 16,
            borderRadius: 0.5,
            bgcolor: 'success.main',
          }}
        />
        <Typography variant='body2' color='text.secondary'>
          Justificadas:
        </Typography>
        <Typography variant='body2' fontWeight={600}>
          {details.justified}
        </Typography>
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Box
          sx={{
            width: 16,
            height: 16,
            borderRadius: 0.5,
            bgcolor: 'error.main',
          }}
        />
        <Typography variant='body2' color='text.secondary'>
          No justificadas:
        </Typography>
        <Typography variant='body2' fontWeight={600}>
          {details.unjustified}
        </Typography>
      </Box>
    </Box>
  );

  return (
    <Tooltip title={tooltip} placement='top-start' enterDelay={300} arrow>
      {CellContent}
    </Tooltip>
  );
};
