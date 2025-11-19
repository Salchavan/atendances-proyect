import React from 'react';
import { WEEKDAYS_ES, MONTHS_ES } from './utils';
import { DayCell } from './DayCell';
import type {
  CalendarProps,
  AttendanceDetailMap,
  AttendanceMap,
} from '../../types/generalTypes';
import {
  Box,
  IconButton,
  Typography,
  Paper,
  Button,
  Menu,
  MenuItem,
  CircularProgress,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';

type CalendarUIProps = Pick<
  CalendarProps,
  | 'className'
  | 'headerTextClass'
  | 'dayNumberClass'
  | 'absencesNumberClass'
  | 'cellBgClass'
> & {
  toolbarEnabled?: boolean;
  viewDate: Date;
  today: Date;
  gridDays: Date[];
  attendanceSource: AttendanceMap;
  detailsSource: AttendanceDetailMap;
  onPrev: () => void;
  onNext: () => void;
  onDayClick: (d: Date) => void;
  onSelectMonth?: (monthIndex: number) => void;
  openDayDetails?: (d: Date) => void;
  specialDates?: string[]; // YYYY-MM-DD
  loadingAttendances?: boolean;
};

export const CalendarUI: React.FC<CalendarUIProps> = ({
  className,
  headerTextClass,
  dayNumberClass,
  absencesNumberClass,
  cellBgClass,
  toolbarEnabled = true,
  viewDate,
  today,
  gridDays,
  attendanceSource,
  detailsSource,
  onPrev,
  onNext,
  onDayClick,
  onSelectMonth,
  openDayDetails,
  specialDates = [],
  loadingAttendances = false,
}) => {
  const title = `${MONTHS_ES[viewDate.getMonth()]} ${viewDate.getFullYear()}`;
  const [monthAnchor, setMonthAnchor] = React.useState<null | HTMLElement>(
    null
  );
  const openMonthMenu = Boolean(monthAnchor);
  const handleMonthClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (!onSelectMonth) return;
    setMonthAnchor(event.currentTarget);
  };
  const handleMonthClose = () => setMonthAnchor(null);
  const handleMonthSelect = (monthIndex: number) => {
    onSelectMonth?.(monthIndex);
    handleMonthClose();
  };

  return (
    <Paper
      className={className}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        borderRadius: 2,
        overflow: 'hidden',
        // Keep calendar in system font regardless of global typography
        fontFamily:
          'system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif',
      }}
      variant='outlined'
    >
      {toolbarEnabled && (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            px: 2,
            py: 1,
            borderBottom: 1,
            borderColor: 'divider',
          }}
        >
          <IconButton aria-label='Mes anterior' onClick={onPrev} size='small'>
            <ArrowBackIcon />
          </IconButton>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            className={
              headerTextClass
                ? `${headerTextClass} calendar-header`
                : 'calendar-header'
            }
          >
            <Button
              variant='text'
              size='large'
              endIcon={<ArrowDropDownIcon />}
              onClick={handleMonthClick}
              sx={{ fontWeight: 'bold', textTransform: 'none' }}
              disabled={!onSelectMonth}
            >
              {title}
            </Button>
            {loadingAttendances && (
              <CircularProgress size={18} sx={{ ml: 1 }} />
            )}
            <Menu
              anchorEl={monthAnchor}
              open={openMonthMenu}
              onClose={handleMonthClose}
            >
              {MONTHS_ES.map((month, idx) => (
                <MenuItem
                  key={month}
                  selected={idx === viewDate.getMonth()}
                  onClick={() => handleMonthSelect(idx)}
                >
                  {month}
                </MenuItem>
              ))}
            </Menu>
          </Box>
          <IconButton aria-label='Mes siguiente' onClick={onNext} size='small'>
            <ArrowForwardIcon />
          </IconButton>
        </Box>
      )}

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          px: 2,
          py: 1,
          gap: 0,
        }}
      >
        {WEEKDAYS_ES.map((d) => (
          <Box key={d} sx={{ textAlign: 'center' }}>
            <Typography
              variant='subtitle2'
              fontWeight={600}
              className={
                headerTextClass
                  ? `${headerTextClass} calendar-header`
                  : 'calendar-header'
              }
              color={!headerTextClass ? 'text.secondary' : undefined}
            >
              {d}
            </Typography>
          </Box>
        ))}
      </Box>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          gap: 0.5,
          px: 2,
          pb: 2,
          flexGrow: 1,
          minHeight: 0,
        }}
      >
        {gridDays.map((date) => (
          <Box key={date.toISOString()}>
            <DayCell
              date={date}
              viewMonth={viewDate.getMonth()}
              today={today}
              onClick={onDayClick}
              attendanceSource={attendanceSource}
              detailsSource={detailsSource}
              dayNumberClass={dayNumberClass}
              absencesNumberClass={absencesNumberClass}
              cellBgClass={cellBgClass}
              openDayDetails={openDayDetails}
              specialDates={specialDates}
            />
          </Box>
        ))}
      </Box>
    </Paper>
  );
};
