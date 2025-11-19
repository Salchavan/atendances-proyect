import React from 'react';
import { useStore } from '../store/Store';
import { changePageTitle } from '../Logic';
import {
  Box,
  Typography,
  Chip,
  Paper,
  Stack,
  Tooltip,
  IconButton,
  Button,
} from '@mui/material';
import { DataGrid, type GridColDef } from '@mui/x-data-grid';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { MultiChart } from '../components/MultiChart/MultiChart';
import { Notes } from '../components/Notes';
import type { StudentRec } from '../types/generalTypes';

const fallback = 'NO Definido';

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

export const StudentProfile = () => {
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

  const copyToClipboard = (value?: string | number) => {
    if (!value) return;
    navigator.clipboard?.writeText(String(value)).catch(() => {});
  };

  const field = (label: string, value?: string | number, copy?: boolean) => (
    <Box display='flex' alignItems='center' gap={1}>
      <Box>
        <Typography variant='caption' color='text.secondary'>
          {label}
        </Typography>
        <Typography variant='body1' fontWeight={500}>
          {value ?? fallback}
        </Typography>
      </Box>
      {copy && value && (
        <Tooltip title={`Copiar ${label}`}>
          <IconButton size='small' onClick={() => copyToClipboard(value)}>
            <ContentCopyIcon fontSize='inherit' />
          </IconButton>
        </Tooltip>
      )}
    </Box>
  );

  if (!isStudent) {
    return (
      <Box
        sx={{
          p: 4,
          height: '100%',
          gridColumn: '1 / -1',
          gridRow: '1 / -1',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Paper sx={{ p: 4, maxWidth: 480, textAlign: 'center' }}>
          <Typography variant='h6' gutterBottom>
            Selecciona un estudiante
          </Typography>
          <Typography color='text.secondary'>
            Abre la tabla de estudiantes o usa el buscador para elegir un
            perfil.
          </Typography>
        </Paper>
      </Box>
    );
  }

  const absences: NonNullable<StudentRec['unassistences']> = Array.isArray(
    student.unassistences
  )
    ? (student.unassistences as NonNullable<StudentRec['unassistences']>)
    : [];

  const lastAbsence = absences[absences.length - 1]?.day;
  const handleOpenAbsenceModal = () => {
    if (!absences.length) return;
    openDialog(
      React.createElement(AbsencesModal, { absences }),
      `Historial de faltas - ${displayName}`,
      'big'
    );
  };

  return (
    <Box
      sx={{
        p: 2,
        height: '100%',
        minHeight: 0,
        gridColumn: '1 / -1',
        gridRow: '1 / -1',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr 1fr',
        gap: 2,
      }}
    >
      <Box
        sx={{
          display: 'grid',
          gridTemplateRows: '2fr 1fr',
          gap: 2,
          minHeight: 0,
        }}
      >
        <Paper
          variant='outlined'
          sx={{
            p: 2,
            display: 'flex',
            flexDirection: 'column',
            minHeight: 0,
            overflow: 'auto',
          }}
        >
          <Box display='flex' alignItems='center' gap={2} flexWrap='wrap'>
            <Typography
              variant='h4'
              fontWeight='bold'
              sx={{ fontSize: '1.5rem !important' }}
            >
              {displayName}
            </Typography>
            <Chip
              label={student.classroom ? `Curso ${student.classroom}` : 'Curso'}
              color='primary'
              variant='outlined'
            />
          </Box>

          <Stack spacing={2} sx={{ mt: 2 }}>
            {field('ID', student.id, true)}
            {field('Usuario', student.username, true)}
            {field(
              'Curso',
              student.classroom ??
                (student.classroom_id
                  ? `Aula ${student.classroom_id}`
                  : undefined)
            )}
            {field(
              'Estado',
              typeof student.active === 'boolean'
                ? student.active
                  ? 'Activo'
                  : 'Inactivo'
                : undefined
            )}
            {field(
              'Última falta',
              lastAbsence ? formatDayLabel(lastAbsence) : 'Sin registros'
            )}
          </Stack>
        </Paper>
        <Box
          sx={{
            display: 'grid',
            minHeight: 0,
          }}
        >
          <Notes />
        </Box>
      </Box>

      <Box
        sx={{
          gridColumn: '2 / 4',
          display: 'grid',
          gridTemplateRows: '1fr auto',
          gap: 2,
          minHeight: 0,
        }}
      >
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
          Ver historial de faltas
        </Button>
      </Box>
    </Box>
  );
};

type AbsencesModalProps = {
  absences: NonNullable<StudentRec['unassistences']>;
};

const AbsencesModal: React.FC<AbsencesModalProps> = ({ absences }) => {
  const rows = React.useMemo(
    () =>
      absences.map((absence, index) => ({
        id: index,
        dateLabel: formatDayLabel(absence.day),
        statusLabel: absence.isJustified ? 'Justificada' : 'Injustificada',
      })),
    [absences]
  );

  const columns = React.useMemo<GridColDef[]>(
    () => [
      { field: 'dateLabel', headerName: 'Fecha', flex: 1, minWidth: 180 },
      { field: 'statusLabel', headerName: 'Estado', flex: 1, minWidth: 140 },
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
