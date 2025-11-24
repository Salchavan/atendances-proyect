import React from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { useQuery } from '@tanstack/react-query';
import { DataGrid, type GridColDef } from '@mui/x-data-grid';
import type { GridRenderCellParams } from '@mui/x-data-grid';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import {
  Box,
  Chip,
  Paper,
  Stack,
  Typography,
  IconButton,
  Tooltip,
} from '@mui/material';
import { useStore } from '../../store/Store';
import { CalendarUI } from './CalendarUI';
import { useCalendarLogic } from './useCalendarLogic';
import type {
  CalendarProps,
  AttendanceRecord,
  StudentRec,
} from '../../types/generalTypes';
import { fmtYmd } from './utils';
import { getAllStudents } from '../../api/client';

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

type AttendanceRow = {
  id: string | number;
  studentId?: number;
  studentLabel: string;
  status: string;
  fractionLabel: string | number;
  checkInLabel: string;
  checkOutLabel: string;
};

const buildStudentLabel = (record: AttendanceRecord) => {
  const firstName =
    record.student?.first_name ??
    record.student_first_name ??
    record.first_name ??
    undefined;
  const lastName =
    record.student?.last_name ??
    record.student_last_name ??
    record.last_name ??
    undefined;
  const label = [firstName, lastName]
    .filter((part): part is string => Boolean(part && part.trim()))
    .join(' ')
    .trim();
  if (label) return label;
  if (record.student_id !== undefined && record.student_id !== null) {
    return `#${record.student_id}`;
  }
  return 'Estudiante';
};

const formatTimeLabel = (value?: string | null) => {
  if (!value) return '—';
  const trimmed = value.trim();
  if (!trimmed) return '—';
  const parsed = new Date(trimmed);
  if (!Number.isNaN(parsed.getTime())) {
    return parsed.toLocaleTimeString('es-AR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }
  const match = trimmed.match(/^([0-2]\d):([0-5]\d)(?::([0-5]\d))?$/);
  if (match) {
    return `${match[1]}:${match[2]}`;
  }
  return trimmed;
};

const extractStudentsFromPayload = (payload: unknown): StudentRec[] => {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload as StudentRec[];
  const source = payload as Record<string, unknown>;
  for (const key of ['students', 'data', 'items', 'results']) {
    const maybeArray = source[key];
    if (Array.isArray(maybeArray)) return maybeArray as StudentRec[];
  }
  return [];
};

const DayDetailsModal: React.FC<DayDetailsModalProps> = ({ rows }) => {
  const [menuAnchorEl, setMenuAnchorEl] = React.useState<null | HTMLElement>(
    null
  );
  const [menuRow, setMenuRow] = React.useState<AttendanceRow | null>(null);

  const { data: studentsPayload } = useQuery({
    queryKey: ['students', 'calendar'],
    queryFn: getAllStudents,
    staleTime: 5 * 60 * 1000,
  });

  const studentsLookup = React.useMemo(() => {
    const map = new Map<number, string>();
    const students = extractStudentsFromPayload(studentsPayload);
    students.forEach((student) => {
      const id = typeof student.id === 'number' ? student.id : undefined;
      if (!id) return;
      const label = `${student.first_name ?? ''} ${student.last_name ?? ''}`
        .trim()
        .replace(/\s+/g, ' ');
      if (label) map.set(id, label);
    });
    return map;
  }, [studentsPayload]);

  const tableRows = React.useMemo<AttendanceRow[]>(
    () =>
      rows.map((record) => {
        const studentId = record.student_id;
        const studentLabelFromLookup =
          (studentId !== undefined
            ? studentsLookup.get(studentId)
            : undefined) ?? buildStudentLabel(record);

        return {
          id: record.id ?? `${record.student_id}-${record.date}`,
          studentId,
          studentLabel: studentLabelFromLookup,
          status: record.status,
          fractionLabel:
            typeof record.fraction === 'number'
              ? record.fraction.toFixed(2)
              : record.fraction ?? '—',
          checkInLabel: formatTimeLabel(record.checkInTime),
          checkOutLabel: formatTimeLabel(record.checkOutTime),
        };
      }),
    [rows, studentsLookup]
  );

  const handleOpenRowMenu = React.useCallback(
    (event: React.MouseEvent<HTMLElement>, row: AttendanceRow) => {
      event.stopPropagation();
      setMenuAnchorEl(event.currentTarget);
      setMenuRow(row);
    },
    []
  );

  const handleCloseRowMenu = React.useCallback(() => {
    setMenuAnchorEl(null);
    setMenuRow(null);
  }, []);

  const handleEditRow = React.useCallback(() => {
    if (menuRow) {
      // TODO: connect with edit modal once API is ready
      console.log('Editar asistencia', menuRow);
    }
    handleCloseRowMenu();
  }, [handleCloseRowMenu, menuRow]);

  const handleDeleteRow = React.useCallback(() => {
    if (menuRow) {
      // TODO: trigger delete confirmation when backend endpoint exists
      console.log('Eliminar asistencia', menuRow);
    }
    handleCloseRowMenu();
  }, [handleCloseRowMenu, menuRow]);

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
        minWidth: 100,
        sortable: false,
        renderCell: (params) => (
          <Chip
            label={params.value === 'PRESENT' ? 'Asistencia' : 'Inasistencia'}
            size='small'
            color={params.value === 'PRESENT' ? 'success' : 'warning'}
          />
        ),
      },
      { field: 'fractionLabel', headerName: 'Fracción', width: 80 },
      { field: 'checkInLabel', headerName: 'Ingreso', width: 100 },
      { field: 'checkOutLabel', headerName: 'Salida', width: 100 },
      {
        field: 'actions',
        headerName: '',
        width: 50,
        sortable: false,
        filterable: false,
        renderCell: (params: GridRenderCellParams<any, AttendanceRow>) => {
          const isAbsence = params.row.status !== 'PRESENT';
          return (
            <Tooltip title='Acciones'>
              <span>
                <IconButton
                  size='small'
                  disabled={!isAbsence}
                  onClick={(event) =>
                    handleOpenRowMenu(event, params.row as any)
                  }
                >
                  <EditOutlinedIcon fontSize='small' />
                </IconButton>
              </span>
            </Tooltip>
          );
        },
      },
    ],
    [handleOpenRowMenu]
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
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleCloseRowMenu}
      >
        <MenuItem onClick={handleEditRow}>Editar</MenuItem>
        <MenuItem onClick={handleDeleteRow}>Eliminar</MenuItem>
      </Menu>
    </Box>
  );
};
