import React from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { useStore } from '../../store/Store';
import { CalendarUI } from './CalendarUI';
import { useCalendarLogic } from './useCalendarLogic';
import type { CalendarProps, AttendanceRecord } from '../../types/generalTypes';
import { fmtYmd } from './utils';
import {
  Box,
  Chip,
  Paper,
  Stack,
  Typography,
  IconButton,
  Tooltip,
} from '@mui/material';
import { DataGrid, type GridColDef } from '@mui/x-data-grid';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';

export const Calendar: React.FC<CalendarProps> = (props) => {
  const {
    today,
    viewDate,
    attendanceSource,
    attendanceDetails,
    attendancesByDay,
    gridDays,
    prevMonth,
    nextMonth,
    selectMonth,
    handleDayClick,
    attendancesLoading,
  } = useCalendarLogic(props);

  const specialDates = useStore((s) => s.specialDates);

  const openDialog = useStore((s) => s.openDialog);

  const openDayDetails = (date: Date) => {
    const iso = fmtYmd(date);
    const rows = attendancesByDay[iso] ?? [];
    const title = `Asistencias del ${date.toLocaleDateString('es-AR', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    })}`;
    openDialog(React.createElement(DayDetailsModal, { rows }), title);
  };

  return (
    <ErrorBoundary fallback={<div>Error loading calendar.</div>}>
      <Typography
        variant='h1'
        fontWeight={500}
        className='col-span-6 row-span-1'
        sx={{ fontSize: '2rem !important' }}
      >
        Calendario de asistencias
      </Typography>
      <CalendarUI
        className={props.className}
        headerTextClass={props.headerTextClass}
        dayNumberClass={props.dayNumberClass}
        absencesNumberClass={props.absencesNumberClass}
        cellBgClass={props.cellBgClass}
        toolbarEnabled={props.toolbarEnabled}
        viewDate={viewDate}
        today={today}
        gridDays={gridDays}
        attendanceSource={attendanceSource}
        detailsSource={attendanceDetails}
        onPrev={prevMonth}
        onNext={nextMonth}
        onSelectMonth={selectMonth}
        onDayClick={handleDayClick}
        openDayDetails={openDayDetails}
        specialDates={specialDates}
        loadingAttendances={attendancesLoading}
      />
    </ErrorBoundary>
  );
};

type DayDetailsModalProps = {
  rows: AttendanceRecord[];
};

const DayDetailsModal: React.FC<DayDetailsModalProps> = ({ rows }) => {
  const tableRows = React.useMemo(
    () =>
      rows.map((record) => ({
        id: record.id ?? `${record.student_id}-${record.date}`,
        studentId: record.student_id,
        studentLabel: `#${record.student_id}`,
        status: record.status,
        fractionLabel:
          typeof record.fraction === 'number'
            ? record.fraction.toFixed(2)
            : record.fraction ?? '—',
        checkInLabel: record.checkInTime ?? '—',
        checkOutLabel: record.checkOutTime ?? '—',
        notesLabel: record.notes ?? '—',
      })),
    [rows]
  );

  const totalAbsences = React.useMemo(
    () => rows.filter((record) => record.status !== 'PRESENT').length,
    [rows]
  );
  const totalAttendances = rows.length - totalAbsences;

  const columns = React.useMemo<GridColDef[]>(
    () => [
      {
        field: 'studentLabel',
        headerName: 'Estudiante',
        flex: 1,
        minWidth: 140,
      },
      {
        field: 'status',
        headerName: 'Estado',
        flex: 1,
        minWidth: 150,
        sortable: false,
        renderCell: (params) => (
          <Chip
            label={params.value === 'PRESENT' ? 'Asistencia' : 'Inasistencia'}
            size='small'
            color={params.value === 'PRESENT' ? 'success' : 'warning'}
          />
        ),
      },
      { field: 'fractionLabel', headerName: 'Fracción', width: 120 },
      { field: 'checkInLabel', headerName: 'Ingreso', width: 130 },
      { field: 'checkOutLabel', headerName: 'Salida', width: 130 },
      { field: 'notesLabel', headerName: 'Notas', flex: 1, minWidth: 180 },
      {
        field: 'actions',
        headerName: 'Acciones',
        width: 110,
        sortable: false,
        filterable: false,
        renderCell: (params) => {
          const isAbsence = params.row.status !== 'PRESENT';
          return (
            <Tooltip title='Editar inasistencia'>
              <span>
                <IconButton
                  size='small'
                  disabled={!isAbsence}
                  onClick={() => {}}
                >
                  <EditOutlinedIcon fontSize='small' />
                </IconButton>
              </span>
            </Tooltip>
          );
        },
      },
    ],
    []
  );

  return (
    <Box
      sx={{
        p: 2,
        minWidth: { xs: 320, md: 540 },
        height: '60vh',
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
      }}
    >
      <Stack direction='row' spacing={2}>
        <Paper variant='outlined' sx={{ p: 1.5, minWidth: 140, flex: 1 }}>
          <Typography variant='caption' color='text.secondary'>
            Asistencias
          </Typography>
          <Typography variant='h5' color='success.main' fontWeight={700}>
            {totalAttendances}
          </Typography>
        </Paper>
        <Paper variant='outlined' sx={{ p: 1.5, minWidth: 140, flex: 1 }}>
          <Typography variant='caption' color='text.secondary'>
            Inasistencias
          </Typography>
          <Typography variant='h5' color='warning.main' fontWeight={700}>
            {totalAbsences}
          </Typography>
        </Paper>
      </Stack>
      {tableRows.length === 0 ? (
        <Paper variant='outlined' sx={{ p: 3 }}>
          <Typography color='text.secondary'>
            No hay asistencias registradas para este día.
          </Typography>
        </Paper>
      ) : (
        <Box sx={{ flex: 1, minHeight: 0 }}>
          <DataGrid
            rows={tableRows}
            columns={columns}
            hideFooter
            disableColumnMenu
            disableRowSelectionOnClick
            sx={{ height: '100%', border: 0 }}
          />
        </Box>
      )}
    </Box>
  );
};
