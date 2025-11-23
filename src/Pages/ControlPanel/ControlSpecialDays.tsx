import {
  useMemo,
  useState,
  useCallback,
  useEffect,
  type FormEvent,
  type MouseEvent,
} from 'react';
import {
  Stack,
  Typography,
  Button,
  Divider,
  Box,
  Alert,
  Menu,
  MenuItem,
  TextField,
  FormControl,
  InputLabel,
  Select,
  type SelectChangeEvent,
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';
import {
  DataGrid,
  type GridColDef,
  type GridCellParams,
} from '@mui/x-data-grid';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import {
  getNotSchoolDays,
  postNotSchoolDay,
  delNotSchoolDay,
  assignNotSchoolDay,
  getNotSchoolDayAssignments,
  delNotSchoolDayAssignment,
} from '../../api/client';
import { useStore } from '../../store/Store';
import { useDebouncedValue } from '../../hooks/useDebouncedValue';
import { SearchActionBar } from './components/SearchActionBar';
import { useAcademicCatalog } from '../../store/APIStore';
import type { ClassroomRecord } from '../../store/APIStore';
import {
  buildDivisionMap,
  buildYearMap,
  buildClassroomLabel,
} from './components/classroomUtils';

type NotSchoolDayRecord = {
  id?: number | string;
  date?: string;
  reason?: string;
  created_at?: string;
  updated_at?: string;
};

type NotSchoolDayAssignmentRecord = NotSchoolDayRecord & {
  classroom_id?: number | string;
  classroomId?: number | string;
  classroom?: ClassroomRecord;
};

type SpecialDayRow = {
  id: number | string;
  date: string;
  reason: string;
  created_at?: string;
  updated_at?: string;
  record: NotSchoolDayRecord;
};

type AssignmentRow = {
  id: number | string;
  date: string;
  reason: string;
  classroomLabel: string;
  classroomId: number | string | null;
  created_at?: string;
  updated_at?: string;
  record: NotSchoolDayAssignmentRecord;
};

type ClassroomOption = {
  id: string;
  label: string;
};

const formatDate = (value?: string) => {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('es-AR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

type ValueFormatterParams = { value?: unknown };

const formatDateFromParams = (params: ValueFormatterParams) => {
  const rawValue = params?.value;
  return formatDate(typeof rawValue === 'string' ? rawValue : undefined);
};

const globalColumns: GridColDef[] = [
  { field: 'id', headerName: 'ID', width: 80 },
  {
    field: 'date',
    headerName: 'Fecha',
    width: 140,
    valueFormatter: formatDateFromParams,
  },
  { field: 'reason', headerName: 'Motivo', flex: 1, minWidth: 220 },
  {
    field: 'created_at',
    headerName: 'Creado',
    width: 140,
    valueFormatter: formatDateFromParams,
  },
  {
    field: 'updated_at',
    headerName: 'Actualizado',
    width: 140,
    valueFormatter: formatDateFromParams,
  },
];

const assignmentColumns: GridColDef[] = [
  { field: 'id', headerName: 'ID', width: 80 },
  { field: 'classroomLabel', headerName: 'Curso', flex: 1, minWidth: 180 },
  {
    field: 'date',
    headerName: 'Fecha',
    width: 140,
    valueFormatter: formatDateFromParams,
  },
  { field: 'reason', headerName: 'Motivo', flex: 1, minWidth: 220 },
];

const extractArrayPayload = <T,>(
  payload: unknown,
  candidateKeys: string[]
): T[] => {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload as T[];
  if (typeof payload !== 'object') return [];
  const source = payload as Record<string, unknown>;
  for (const key of candidateKeys) {
    const maybeArray = source[key];
    if (Array.isArray(maybeArray)) return maybeArray as T[];
  }
  if (Array.isArray(source.data)) {
    return source.data as T[];
  }
  return [];
};

export const ControlSpecialDays = () => {
  const [searchValue, setSearchValue] = useState('');
  const debouncedSearch = useDebouncedValue(searchValue, 750);
  const queryClient = useQueryClient();
  const openDialog = useStore((s) => s.openDialog);
  const closeDialog = useStore((s) => s.closeDialog);
  const { classrooms, divisions, years } = useAcademicCatalog();

  const divisionMap = useMemo(() => buildDivisionMap(divisions), [divisions]);
  const yearMap = useMemo(() => buildYearMap(years), [years]);

  const classroomLabelMap = useMemo(() => {
    const map = new Map<string, string>();
    classrooms.forEach((classroom) => {
      if (classroom?.id === undefined || classroom?.id === null) return;
      map.set(
        String(classroom.id),
        buildClassroomLabel(classroom, divisionMap, yearMap)
      );
    });
    return map;
  }, [classrooms, divisionMap, yearMap]);

  const classroomOptions = useMemo<ClassroomOption[]>(() => {
    return classrooms
      .filter(
        (classroom) => classroom?.id !== undefined && classroom?.id !== null
      )
      .map((classroom) => ({
        id: String(classroom.id),
        label: buildClassroomLabel(classroom, divisionMap, yearMap),
      }))
      .sort((a, b) => a.label.localeCompare(b.label, 'es'));
  }, [classrooms, divisionMap, yearMap]);

  const {
    data: globalDaysData,
    isLoading: isLoadingGlobal,
    isError: isGlobalError,
    refetch: refetchGlobal,
  } = useQuery({
    queryKey: ['not-school-days'],
    queryFn: getNotSchoolDays,
  });

  const {
    data: assignmentsData,
    isLoading: isLoadingAssignments,
    isError: isAssignmentsError,
    refetch: refetchAssignments,
  } = useQuery({
    queryKey: ['not-school-day-assignments'],
    queryFn: getNotSchoolDayAssignments,
  });

  const globalRows = useMemo<SpecialDayRow[]>(() => {
    const records = extractArrayPayload<NotSchoolDayRecord>(globalDaysData, [
      'days',
      'notSchoolDays',
      'not_school_days',
      'items',
    ]);
    return records.map((record, index) => ({
      id: record.id ?? `day-${index}`,
      date: record.date ?? '',
      reason: record.reason ?? '—',
      created_at: record.created_at,
      updated_at: record.updated_at,
      record,
    }));
  }, [globalDaysData]);

  const assignmentRows = useMemo<AssignmentRow[]>(() => {
    const records = extractArrayPayload<NotSchoolDayAssignmentRecord>(
      assignmentsData,
      ['assignments', 'notSchoolDayAssignments', 'items']
    );
    return records.map((record, index) => {
      const id = record.id ?? `assignment-${index}`;
      const inlineClassroom = record.classroom as ClassroomRecord | undefined;
      const rawClassroomId =
        record.classroom_id ??
        record.classroomId ??
        inlineClassroom?.id ??
        null;
      const labelFromStore =
        rawClassroomId !== null
          ? classroomLabelMap.get(String(rawClassroomId))
          : undefined;
      const labelFromRecord = inlineClassroom
        ? buildClassroomLabel(inlineClassroom, divisionMap, yearMap)
        : undefined;
      const classroomLabel =
        labelFromStore ??
        labelFromRecord ??
        (inlineClassroom as any)?.name ??
        (rawClassroomId ? `Curso ${rawClassroomId}` : '—');

      return {
        id,
        date: record.date ?? '',
        reason: record.reason ?? '—',
        classroomLabel,
        classroomId: rawClassroomId,
        created_at: record.created_at,
        updated_at: record.updated_at,
        record,
      };
    });
  }, [assignmentsData, classroomLabelMap, divisionMap, yearMap]);

  const normalizedSearch = debouncedSearch.trim().toLowerCase();
  const filteredGlobalRows = useMemo(() => {
    if (!normalizedSearch) return globalRows;
    return globalRows.filter((row) =>
      [row.reason, row.date, row.id]
        .map((value) => String(value ?? '').toLowerCase())
        .some((value) => value.includes(normalizedSearch))
    );
  }, [globalRows, normalizedSearch]);

  const filteredAssignmentRows = useMemo(() => {
    if (!normalizedSearch) return assignmentRows;
    return assignmentRows.filter((row) =>
      [row.reason, row.date, row.classroomLabel, row.id]
        .map((value) => String(value ?? '').toLowerCase())
        .some((value) => value.includes(normalizedSearch))
    );
  }, [assignmentRows, normalizedSearch]);

  const [globalMenuAnchor, setGlobalMenuAnchor] = useState<null | HTMLElement>(
    null
  );
  const [selectedGlobal, setSelectedGlobal] = useState<SpecialDayRow | null>(
    null
  );
  const [assignmentMenuAnchor, setAssignmentMenuAnchor] =
    useState<null | HTMLElement>(null);
  const [selectedAssignment, setSelectedAssignment] =
    useState<AssignmentRow | null>(null);

  const handleGlobalCellClick = useCallback(
    (params: GridCellParams, event: MouseEvent<HTMLElement>) => {
      event.preventDefault();
      setSelectedGlobal(params.row as SpecialDayRow);
      setGlobalMenuAnchor(event.currentTarget as HTMLElement);
    },
    []
  );

  const handleAssignmentCellClick = useCallback(
    (params: GridCellParams, event: MouseEvent<HTMLElement>) => {
      event.preventDefault();
      setSelectedAssignment(params.row as AssignmentRow);
      setAssignmentMenuAnchor(event.currentTarget as HTMLElement);
    },
    []
  );

  const createGlobalMutation = useMutation({
    mutationFn: postNotSchoolDay,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['not-school-days'] });
    },
  });

  const deleteGlobalMutation = useMutation({
    mutationFn: (id: number | string) => delNotSchoolDay(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['not-school-days'] });
    },
  });

  const assignDayMutation = useMutation({
    mutationFn: assignNotSchoolDay,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['not-school-day-assignments'],
      });
    },
  });

  const deleteAssignmentMutation = useMutation({
    mutationFn: (id: number | string) => delNotSchoolDayAssignment(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['not-school-day-assignments'],
      });
    },
  });

  const combinedLoading = isLoadingGlobal || isLoadingAssignments;

  const handleOpenCreateGlobal = () => {
    openDialog(
      <CreateSpecialDayForm
        onSubmit={async (values) => {
          await createGlobalMutation.mutateAsync(values);
          closeDialog();
        }}
        onCancel={closeDialog}
      />,
      'Registrar día sin clases',
      { width: 420, height: 360 }
    );
  };

  const handleOpenAssignDay = () => {
    openDialog(
      <AssignSpecialDayForm
        classroomOptions={classroomOptions}
        onSubmit={async (values) => {
          await assignDayMutation.mutateAsync(values);
          closeDialog();
        }}
        onCancel={closeDialog}
      />,
      'Asignar día especial a un curso',
      { width: 460, height: 420 }
    );
  };

  const handleDeleteGlobalDay = async () => {
    if (!selectedGlobal) return;
    const confirmed = window.confirm(
      `¿Eliminar el día especial del ${formatDate(selectedGlobal.date)}?`
    );
    if (!confirmed) {
      setGlobalMenuAnchor(null);
      return;
    }
    try {
      await deleteGlobalMutation.mutateAsync(selectedGlobal.id);
    } catch (error) {
      console.error('Error deleting special day', error);
    } finally {
      setGlobalMenuAnchor(null);
    }
  };

  const handleDeleteAssignment = async () => {
    if (!selectedAssignment) return;
    const confirmed = window.confirm(
      `¿Eliminar la asignación del ${formatDate(
        selectedAssignment.date
      )} para ${selectedAssignment.classroomLabel}?`
    );
    if (!confirmed) {
      setAssignmentMenuAnchor(null);
      return;
    }
    try {
      await deleteAssignmentMutation.mutateAsync(selectedAssignment.id);
    } catch (error) {
      console.error('Error deleting special day assignment', error);
    } finally {
      setAssignmentMenuAnchor(null);
    }
  };

  const refetchAll = () => {
    void refetchGlobal();
    void refetchAssignments();
  };

  return (
    <Box sx={{ paddingLeft: 2 }}>
      <Stack spacing={2}>
        <Typography variant='h5'>Días especiales</Typography>
        <Typography variant='body2' color='text.secondary'>
          Gestiona los días sin clases globales y las asignaciones específicas
          por curso.
        </Typography>
        <SearchActionBar
          value={searchValue}
          onChange={setSearchValue}
          placeholder='Buscar por fecha, motivo o curso'
          actions={
            <>
              <Button
                variant='contained'
                startIcon={<EventAvailableIcon />}
                onClick={handleOpenCreateGlobal}
              >
                Nuevo día global
              </Button>
              <Button
                variant='outlined'
                startIcon={<AssignmentIndIcon />}
                onClick={handleOpenAssignDay}
                disabled={!classroomOptions.length}
              >
                Asignar a curso
              </Button>
              <Button
                variant='text'
                startIcon={<RefreshIcon />}
                onClick={refetchAll}
                disabled={combinedLoading}
              >
                Actualizar
              </Button>
            </>
          }
        />
        <Divider />

        <Stack spacing={4}>
          <Box>
            <Typography variant='h6' gutterBottom>
              Días globales
            </Typography>
            {isGlobalError ? (
              <Alert
                severity='error'
                action={
                  <Button color='inherit' onClick={() => refetchGlobal()}>
                    Reintentar
                  </Button>
                }
              >
                No pudimos cargar los días globales.
              </Alert>
            ) : (
              <Box
                sx={{
                  width: '100%',
                  minWidth: 0,
                  height: { xs: 320, md: 360 },
                  maxHeight: 380,
                  overflowX: 'auto',
                  overflowY: 'hidden',
                  pr: 1,
                }}
              >
                <DataGrid
                  rows={filteredGlobalRows}
                  columns={globalColumns}
                  loading={isLoadingGlobal}
                  disableRowSelectionOnClick
                  onCellClick={handleGlobalCellClick}
                  initialState={{
                    pagination: {
                      paginationModel: { pageSize: 5, page: 0 },
                    },
                  }}
                  pageSizeOptions={[5, 10, 25]}
                />
              </Box>
            )}
          </Box>

          <Box>
            <Typography variant='h6' gutterBottom>
              Asignaciones por curso
            </Typography>
            {isAssignmentsError ? (
              <Alert
                severity='error'
                action={
                  <Button color='inherit' onClick={() => refetchAssignments()}>
                    Reintentar
                  </Button>
                }
              >
                No pudimos cargar las asignaciones.
              </Alert>
            ) : (
              <Box
                sx={{
                  width: '100%',
                  minWidth: 0,
                  height: { xs: 320, md: 360 },
                  maxHeight: 380,
                  overflowX: 'auto',
                  overflowY: 'hidden',
                  pr: 1,
                }}
              >
                <DataGrid
                  rows={filteredAssignmentRows}
                  columns={assignmentColumns}
                  loading={isLoadingAssignments}
                  disableRowSelectionOnClick
                  onCellClick={handleAssignmentCellClick}
                  initialState={{
                    pagination: {
                      paginationModel: { pageSize: 5, page: 0 },
                    },
                  }}
                  pageSizeOptions={[5, 10, 25]}
                />
              </Box>
            )}
          </Box>
        </Stack>

        <Menu
          anchorEl={globalMenuAnchor}
          open={Boolean(globalMenuAnchor)}
          onClose={() => setGlobalMenuAnchor(null)}
        >
          <MenuItem
            sx={{ color: 'error.main' }}
            onClick={handleDeleteGlobalDay}
            disabled={deleteGlobalMutation.isPending}
          >
            Eliminar
          </MenuItem>
        </Menu>

        <Menu
          anchorEl={assignmentMenuAnchor}
          open={Boolean(assignmentMenuAnchor)}
          onClose={() => setAssignmentMenuAnchor(null)}
        >
          <MenuItem
            sx={{ color: 'error.main' }}
            onClick={handleDeleteAssignment}
            disabled={deleteAssignmentMutation.isPending}
          >
            Eliminar
          </MenuItem>
        </Menu>
      </Stack>
    </Box>
  );
};

type CreateSpecialDayFormProps = {
  onSubmit: (values: { date: string; reason: string }) => Promise<void>;
  onCancel: () => void;
};

const CreateSpecialDayForm = ({
  onSubmit,
  onCancel,
}: CreateSpecialDayFormProps) => {
  const today = new Date().toISOString().split('T')[0];
  const [formValues, setFormValues] = useState({ date: today, reason: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      await onSubmit(formValues);
    } catch (error) {
      console.error('Error creating global special day', error);
      setErrorMessage(
        'No se pudo guardar el día especial. Intenta nuevamente.'
      );
      return;
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box component='form' onSubmit={handleSubmit} sx={{ mt: 1 }}>
      <Stack spacing={2}>
        <TextField
          label='Fecha'
          type='date'
          value={formValues.date}
          onChange={(event) =>
            setFormValues((prev) => ({ ...prev, date: event.target.value }))
          }
          InputLabelProps={{ shrink: true }}
          required
        />
        <TextField
          label='Motivo'
          value={formValues.reason}
          onChange={(event) =>
            setFormValues((prev) => ({ ...prev, reason: event.target.value }))
          }
          multiline
          minRows={2}
          required
        />
        {errorMessage ? <Alert severity='error'>{errorMessage}</Alert> : null}
        <Stack direction='row' spacing={1} justifyContent='flex-end'>
          <Button onClick={onCancel} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button
            type='submit'
            variant='contained'
            startIcon={<EventAvailableIcon />}
            disabled={isSubmitting || !formValues.date || !formValues.reason}
          >
            Guardar
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
};

type AssignSpecialDayFormProps = {
  classroomOptions: ClassroomOption[];
  onSubmit: (values: {
    classroomId: number | string;
    date: string;
    reason: string;
  }) => Promise<void>;
  onCancel: () => void;
};

const AssignSpecialDayForm = ({
  classroomOptions,
  onSubmit,
  onCancel,
}: AssignSpecialDayFormProps) => {
  const today = new Date().toISOString().split('T')[0];
  const [formValues, setFormValues] = useState({
    classroomId: classroomOptions[0]?.id ?? '',
    date: today,
    reason: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    setFormValues((prev) => ({
      ...prev,
      classroomId: prev.classroomId || classroomOptions[0]?.id || '',
    }));
  }, [classroomOptions]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!formValues.classroomId) return;
    setIsSubmitting(true);
    setErrorMessage(null);
    const numericId = Number(formValues.classroomId);
    const classroomId = Number.isFinite(numericId)
      ? numericId
      : formValues.classroomId;
    try {
      await onSubmit({
        classroomId,
        date: formValues.date,
        reason: formValues.reason,
      });
    } catch (error) {
      console.error('Error assigning special day', error);
      setErrorMessage(
        'No se pudo asignar el día especial. Verifica los datos e intenta nuevamente.'
      );
      return;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSelectChange = (event: SelectChangeEvent<string>) => {
    setFormValues((prev) => ({ ...prev, classroomId: event.target.value }));
  };

  return (
    <Box component='form' onSubmit={handleSubmit} sx={{ mt: 1 }}>
      <Stack spacing={2}>
        <FormControl fullWidth required>
          <InputLabel id='classroom-select-label'>Curso</InputLabel>
          <Select
            labelId='classroom-select-label'
            label='Curso'
            value={formValues.classroomId}
            onChange={handleSelectChange}
          >
            {classroomOptions.map((option) => (
              <MenuItem key={option.id} value={option.id}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <TextField
          label='Fecha'
          type='date'
          value={formValues.date}
          onChange={(event) =>
            setFormValues((prev) => ({ ...prev, date: event.target.value }))
          }
          InputLabelProps={{ shrink: true }}
          required
        />
        <TextField
          label='Motivo'
          value={formValues.reason}
          onChange={(event) =>
            setFormValues((prev) => ({ ...prev, reason: event.target.value }))
          }
          multiline
          minRows={2}
          required
        />
        {errorMessage ? <Alert severity='error'>{errorMessage}</Alert> : null}
        <Stack direction='row' spacing={1} justifyContent='flex-end'>
          <Button onClick={onCancel} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button
            type='submit'
            variant='contained'
            startIcon={<AssignmentIndIcon />}
            disabled={
              isSubmitting || !formValues.classroomId || !formValues.reason
            }
          >
            Asignar
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
};
