import React from 'react';
import {
  Box,
  Paper,
  Stack,
  Tooltip,
  IconButton,
  Divider,
  Menu,
  MenuItem,
  Button,
  Chip,
  Typography,
} from '@mui/material';
import { DataGrid, type GridColDef } from '@mui/x-data-grid';
import EditIcon from '@mui/icons-material/Edit';
import { useQuery } from '@tanstack/react-query';

import { useStore } from '../../../store/Store';
import { changePageTitle } from '../../../Logic';
import { MultiChart } from '../../../components/MultiChart/MultiChart';
import { getStats } from '../../../api/client';
import type { StudentRec } from '../../../types/generalTypes';
import { EmptyProfileState } from './EmptyProfileState';
import { InfoField } from './InfoField';
import { ProfileHeader } from './ProfileHeader';
import { MetricCard, SummaryCard } from './MetricCards';

const parseDayKey = (value?: string) => {
  if (!value) return null;
  const [dd, mm, yy] = value.split('-').map((p) => Number(p));
  if (!dd || !mm) return null;
  const year = yy >= 100 ? yy : 2000 + yy;
  const date = new Date(year, mm - 1, dd);
  return Number.isNaN(date.getTime()) ? null : date.getTime();
};

const formatDayLabel = (value?: string) => {
  const millis = parseDayKey(value);
  if (!millis) return value ?? 'Sin fecha';
  return new Date(millis).toLocaleDateString('es-AR', {
    weekday: 'short',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
};

export const StudentProfileView: React.FC = () => {
  const student = useStore((s) => s.perfilUserSelected) as
    | StudentRec
    | undefined;
  const openDialog = useStore((s) => s.openDialog);
  const displayName = student
    ? `${student.first_name ?? ''} ${student.last_name ?? ''}`.trim() ||
      student.first_name ||
      'Estudiante'
    : 'Estudiante';
  changePageTitle(`Perfil del estudiante - ${displayName}`);

  const normalizedRole = 'STUDENT';
  const isStudent =
    !!student &&
    (normalizedRole === 'STUDENT' || Array.isArray(student?.unassistences));

  const [menuAnchorEl, setMenuAnchorEl] = React.useState<null | HTMLElement>(
    null
  );
  const menuOpen = Boolean(menuAnchorEl);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setMenuAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
  };

  if (!isStudent) {
    return (
      <EmptyProfileState
        title='Selecciona un estudiante'
        description='Abre la tabla de estudiantes o usa el buscador para elegir un perfil.'
      />
    );
  }

  const absences: NonNullable<StudentRec['unassistences']> = Array.isArray(
    student.unassistences
  )
    ? (student.unassistences as NonNullable<StudentRec['unassistences']>)
    : [];

  const studentId = Number(student.id ?? 0);
  const {
    data: statsData,
    isLoading: statsLoading,
    isError: statsError,
  } = useQuery({
    queryKey: ['student-stats', studentId],
    queryFn: () => getStats({ type: 'STUDENT', id: studentId }),
    enabled: Boolean(studentId),
    staleTime: 60_000,
  });
  const metrics = statsData?.metrics;

  const lastAbsence = absences[absences.length - 1]?.day;
  const handleOpenAbsenceModal = () => {
    if (!absences.length) return;
    openDialog(
      React.createElement(AbsencesModal, { absences, metrics }),
      `Historial de faltas - ${displayName}`,
      'big'
    );
  };

  return (
    <Box className='grid h-full min-h-0 gap-4 p-2 grid-cols-3 col-span-full row-span-full'>
      <Box className='flex min-h-0 flex-col gap-4'>
        <Paper
          variant='outlined'
          sx={{
            p: 2,
            display: 'flex',
            flexDirection: 'column',
            minHeight: 0,
            flex: 1,
            overflow: 'auto',
          }}
        >
          <ProfileHeader
            title={displayName}
            chips={[
              {
                label: student.classroom
                  ? `Curso ${student.classroom}`
                  : 'Curso',
                color: 'primary',
                variant: 'outlined',
              },
            ]}
            actions={
              <Tooltip title='Editar'>
                <IconButton
                  size='small'
                  onClick={handleMenuOpen}
                  aria-haspopup='true'
                  aria-controls={menuOpen ? 'student-edit-menu' : undefined}
                >
                  <EditIcon fontSize='small' />
                </IconButton>
              </Tooltip>
            }
          />

          <Menu
            id='student-edit-menu'
            anchorEl={menuAnchorEl}
            open={menuOpen}
            onClose={handleMenuClose}
          >
            <MenuItem onClick={handleMenuClose}>Editar</MenuItem>
            <MenuItem onClick={handleMenuClose}>Registrar falta</MenuItem>
            <MenuItem onClick={handleMenuClose}>Registrar asistencia</MenuItem>
            <MenuItem onClick={handleMenuClose}>Eliminar</MenuItem>
          </Menu>

          <Stack spacing={2} sx={{ mt: 2 }}>
            <InfoField label='ID' value={student.id} copyValue={student.id} />
            <InfoField
              label='Usuario'
              value={student.username}
              copyValue={student.username}
            />
            <InfoField
              label='Curso'
              value={
                student.classroom ??
                (student.classroom_id
                  ? `Aula ${student.classroom_id}`
                  : undefined)
              }
            />
            <InfoField
              label='Estado'
              value={
                typeof student.active === 'boolean'
                  ? student.active
                    ? 'Activo'
                    : 'Inactivo'
                  : undefined
              }
            />
            <InfoField
              label='Última falta'
              value={
                lastAbsence ? formatDayLabel(lastAbsence) : 'Sin registros'
              }
            />
          </Stack>
          <Divider sx={{ my: 2 }} />
          {statsLoading && (
            <Typography variant='body2' color='text.secondary'>
              Calculando métricas...
            </Typography>
          )}
          {statsError && !statsLoading && (
            <Typography variant='body2' color='error.main'>
              No se pudieron cargar las métricas.
            </Typography>
          )}
          {!statsLoading && !statsError && metrics && (
            <Stack direction='row' flexWrap='wrap' sx={{ gap: 1 }}>
              <MetricCard
                label='Asistencia'
                value={
                  metrics.attendancePct != null
                    ? `${metrics.attendancePct.toFixed(1)}%`
                    : undefined
                }
              />
              <MetricCard label='Presentes' value={metrics.present} />
              <MetricCard label='Inasistencias' value={metrics.absent} />
              <MetricCard label='Llegadas tarde' value={metrics.late} />
              <MetricCard label='Días total' value={metrics.totalDays} />
            </Stack>
          )}
        </Paper>
      </Box>

      <Box className='min-h-0 flex flex-col gap-4 lg:col-span-2'>
        <Box sx={{ minHeight: 0 }}>
          <MultiChart
            title='Inasistencias del estudiante'
            toolbarEnabled
            grid=''
            data={student ? [student] : []}
            disableTableOnClick
          />
        </Box>

        <Button
          variant='contained'
          size='large'
          onClick={handleOpenAbsenceModal}
          disabled={!absences.length}
        >
          Ver historial
        </Button>
      </Box>
    </Box>
  );
};

type StudentMetrics = {
  attendancePct?: number;
  absent?: number;
  present?: number;
  late?: number;
  totalDays?: number;
};

type AbsencesModalProps = {
  absences: NonNullable<StudentRec['unassistences']>;
  metrics?: StudentMetrics;
};

const AbsencesModal: React.FC<AbsencesModalProps> = ({ absences, metrics }) => {
  const rows = React.useMemo(
    () =>
      absences.map((absence, index) => ({
        id: index,
        dateLabel: formatDayLabel(absence.day),
        statusLabel: absence.isJustified ? 'Justificada' : 'Injustificada',
        justified: absence.isJustified,
      })),
    [absences]
  );

  const columns = React.useMemo<GridColDef[]>(
    () => [
      { field: 'dateLabel', headerName: 'Fecha', flex: 1, minWidth: 180 },
      {
        field: 'statusLabel',
        headerName: 'Estado',
        flex: 1,
        minWidth: 160,
        renderCell: (params) => (
          <Chip
            size='small'
            label={params.row.statusLabel}
            color={params.row.justified ? 'success' : 'warning'}
          />
        ),
      },
    ],
    []
  );

  return (
    <Paper
      variant='outlined'
      sx={{
        p: 2,
        minHeight: '55vh',
        height: '60vh',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Typography variant='h6' fontWeight={600} gutterBottom>
        Faltas registradas
      </Typography>
      <Stack direction='row' spacing={2} sx={{ mb: 2 }}>
        <SummaryCard
          label='Asistencias'
          value={metrics?.present}
          color='success.main'
        />
        <SummaryCard
          label='Faltas'
          value={metrics?.absent ?? absences.length}
          color='error.main'
        />
      </Stack>
      <Box sx={{ flex: 1, minHeight: 0 }}>
        <DataGrid
          rows={rows}
          columns={columns}
          disableColumnMenu
          hideFooter
          sx={{ height: '100%', border: 0 }}
        />
      </Box>
    </Paper>
  );
};
