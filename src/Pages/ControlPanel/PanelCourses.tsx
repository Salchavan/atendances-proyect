import { useMemo, useState, useCallback, type MouseEvent } from 'react';
import {
  Stack,
  Typography,
  Button,
  Divider,
  Box,
  Alert,
  Menu,
  MenuItem,
} from '@mui/material';
import SchoolIcon from '@mui/icons-material/School';
import RefreshIcon from '@mui/icons-material/Refresh';
import ViewListIcon from '@mui/icons-material/ViewList';
import {
  DataGrid,
  type GridColDef,
  type GridCellParams,
} from '@mui/x-data-grid';
import {
  useQuery,
  useQueries,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';

import {
  getClassrooms,
  getStudentsByClassroom,
  delClassrooms,
} from '../../api/client';
import { useAcademicCatalog } from '../../store/APIStore';
import { useStore } from '../../store/Store';
import { useNavigateTo } from '../../Logic';
import { useDebouncedValue } from '../../hooks/useDebouncedValue';
import { SearchActionBar } from './components/SearchActionBar';
import { AddCourseForm } from './components/AddCourseForm';
import { buildDivisionMap, buildYearMap } from './components/classroomUtils';

type ClassroomRecord = {
  id?: number | string;
  year_id?: number;
  year?: number;
  division_id?: string | number;
  division_letter?: string;
  division?: string;
  char?: string;
  shift?: string;
  turn?: string;
  students_count?: number;
  numberStudents?: number;
  students?: unknown[];
  created_at?: string;
  createdAt?: string;
  updated_at?: string;
  updatedAt?: string;
};

type ClassroomRow = {
  id: number | string;
  yearLabel: string | number;
  divisionLabel: string | number;
  shift: string;
  students: number;
  created_at?: string;
  updated_at?: string;
  record: ClassroomRecord;
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

const classroomColumns: GridColDef[] = [
  { field: 'id', headerName: 'ID', width: 50 },
  { field: 'yearLabel', headerName: 'Año', width: 75 },
  { field: 'divisionLabel', headerName: 'División', width: 75 },
  { field: 'shift', headerName: 'Turno', width: 100 },
  {
    field: 'students',
    headerName: 'Estudiantes',
    width: 100,
    type: 'number',
  },
  {
    field: 'created_at',
    headerName: 'Creado',
    flex: 1,
    minWidth: 100,
    valueFormatter: ({ value }) => formatDate(value as string | undefined),
  },
  {
    field: 'updated_at',
    headerName: 'Actualizado',
    flex: 1,
    minWidth: 100,
    valueFormatter: ({ value }) => formatDate(value as string | undefined),
  },
];

export const PanelCourses = () => {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['classrooms'],
    queryFn: getClassrooms,
  });
  const [searchValue, setSearchValue] = useState('');
  const debouncedSearch = useDebouncedValue(searchValue, 750);
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedRow, setSelectedRow] = useState<ClassroomRow | null>(null);
  const { divisions, years } = useAcademicCatalog();
  const queryClient = useQueryClient();
  const openDialog = useStore((s) => s.openDialog);
  const setPerfilUserSelected = useStore((s) => s.setPerfilUserSelected);
  const setProfileView = useStore((s) => s.setProfileView);
  const navigateTo = useNavigateTo();

  const divisionMap = useMemo(() => buildDivisionMap(divisions), [divisions]);
  const yearMap = useMemo(() => buildYearMap(years), [years]);

  const classrooms = useMemo(() => {
    if (!data) return [];
    if (Array.isArray(data)) return data as ClassroomRecord[];
    if (Array.isArray((data as any)?.classrooms)) {
      return (data as any).classrooms as ClassroomRecord[];
    }
    if (Array.isArray((data as any)?.data)) {
      return (data as any).data as ClassroomRecord[];
    }
    return [];
  }, [data]);

  const rows = useMemo<ClassroomRow[]>(() => {
    return classrooms.map((classroom, index) => {
      const yearKey = classroom.year_id ?? classroom.year;
      const resolvedYear =
        (yearKey !== undefined
          ? yearMap.get(yearKey)?.year_number
          : undefined) ??
        classroom.year ??
        classroom.year_id ??
        '—';
      const divisionKey =
        classroom.division_id ??
        classroom.division_letter ??
        classroom.division ??
        classroom.char;
      const resolvedDivision =
        (divisionKey !== undefined
          ? divisionMap.get(divisionKey)?.division_letter
          : undefined) ??
        classroom.division_letter ??
        classroom.division ??
        classroom.char ??
        '—';
      const shift = classroom.shift ?? classroom.turn ?? '—';
      const studentsCount =
        classroom.students_count ??
        classroom.numberStudents ??
        (Array.isArray(classroom.students)
          ? classroom.students.length
          : undefined) ??
        0;

      return {
        id:
          classroom.id ??
          `${resolvedYear}-${resolvedDivision}-${shift}-${index}`,
        yearLabel: resolvedYear,
        divisionLabel: resolvedDivision,
        shift,
        students: studentsCount,
        created_at: classroom.created_at ?? classroom.createdAt,
        updated_at: classroom.updated_at ?? classroom.updatedAt,
        record: classroom,
      };
    });
  }, [classrooms, yearMap, divisionMap]);

  const studentCountQueries = useQueries({
    queries: rows.map((row) => ({
      queryKey: ['classroom-students', row.record.id ?? row.id],
      queryFn: async () => {
        const response = await getStudentsByClassroom(
          String(row.record.id ?? row.id)
        );
        if (!response) return 0;
        if (Array.isArray(response)) return response.length;
        const candidateKeys = ['students', 'data', 'items', 'results'];
        for (const key of candidateKeys) {
          const maybeArray = (response as Record<string, unknown>)[key];
          if (Array.isArray(maybeArray)) {
            return maybeArray.length;
          }
        }
        return 0;
      },
      enabled: Boolean(row.record?.id),
      staleTime: 60_000,
    })),
  });

  const studentCountMap = useMemo(() => {
    const map = new Map<ClassroomRow['id'], number>();
    studentCountQueries.forEach((query, index) => {
      const rowId = rows[index]?.id;
      if (!rowId) return;
      if (typeof query.data === 'number') {
        map.set(rowId, query.data);
      }
    });
    return map;
  }, [studentCountQueries, rows]);

  const rowsWithCounts = useMemo(() => {
    if (!rows.length) return rows;
    return rows.map((row) => ({
      ...row,
      students: studentCountMap.get(row.id) ?? row.students,
    }));
  }, [rows, studentCountMap]);

  const normalizedSearch = debouncedSearch.trim().toLowerCase();
  const filteredRows = useMemo(() => {
    if (!normalizedSearch) return rowsWithCounts;
    return rowsWithCounts.filter((row) => {
      const candidates = [row.yearLabel, row.divisionLabel, row.shift, row.id];
      return candidates.some((value) =>
        String(value ?? '')
          .toLowerCase()
          .includes(normalizedSearch)
      );
    });
  }, [rowsWithCounts, normalizedSearch]);

  const handleCellClick = useCallback(
    (params: GridCellParams, event: MouseEvent<HTMLElement>) => {
      event.preventDefault();
      setSelectedRow(params.row as ClassroomRow);
      setMenuAnchorEl(event.currentTarget);
    },
    []
  );

  const handleMenuClose = () => setMenuAnchorEl(null);

  const deleteClassroomMutation = useMutation({
    mutationFn: (ids: number[]) => delClassrooms(ids),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['classrooms'] });
      await queryClient.invalidateQueries({ queryKey: ['students'] });
    },
  });

  const handleGoToProfile = () => {
    if (!selectedRow) return;
    setPerfilUserSelected({
      ...(selectedRow.record as any),
      yearLabel: selectedRow.yearLabel,
      divisionLabel: selectedRow.divisionLabel,
      shift: selectedRow.shift,
    } as any);
    setProfileView('CLASSROOM');
    navigateTo('/home/profile');
    handleMenuClose();
  };

  const handleOpenAddCourse = () => {
    openDialog(
      <AddCourseForm years={years} divisions={divisions} />,
      'Añadir curso',
      { width: 480, height: 420 }
    );
  };

  const handleDeleteCourse = async () => {
    if (!selectedRow?.record?.id) return;
    const classroomId = Number(selectedRow.record.id);
    if (!Number.isInteger(classroomId)) {
      console.warn('Invalid classroom id for deletion', selectedRow.record.id);
      handleMenuClose();
      return;
    }
    const confirmed = window.confirm(
      `¿Eliminar el curso ${selectedRow.yearLabel} ${selectedRow.divisionLabel}? Esta acción no se puede deshacer.`
    );
    if (!confirmed) {
      handleMenuClose();
      return;
    }
    try {
      await deleteClassroomMutation.mutateAsync([classroomId]);
    } catch (error) {
      console.error('Error deleting course', error);
    } finally {
      handleMenuClose();
    }
  };

  return (
    <Box sx={{ paddingLeft: 2 }}>
      <Stack spacing={2}>
        <Typography variant='h5'>Cursos</Typography>
        <Typography variant='body2' color='text.secondary'>
          Agrega, edita o elimina cursos desde esta sección administrativa.
        </Typography>
        <SearchActionBar
          value={searchValue}
          onChange={setSearchValue}
          placeholder='Buscar por año, división o turno'
          actions={
            <>
              <Button
                variant='contained'
                startIcon={<SchoolIcon />}
                onClick={handleOpenAddCourse}
              >
                Añadir curso
              </Button>
              <Button variant='outlined' startIcon={<ViewListIcon />} disabled>
                Importar lista
              </Button>
              <Button
                variant='text'
                startIcon={<RefreshIcon />}
                onClick={() => refetch()}
                disabled={isLoading}
              >
                Actualizar
              </Button>
            </>
          }
        />
        <Divider />
        {isError ? (
          <Alert
            severity='error'
            action={
              <Button color='inherit' onClick={() => refetch()}>
                Reintentar
              </Button>
            }
          >
            No pudimos cargar los cursos. Intenta nuevamente.
          </Alert>
        ) : (
          <Box
            sx={{
              width: '100%',
              minWidth: 0,
              height: { xs: 420, md: '65vh' },
              maxHeight: '65vh',
              overflowX: 'auto',
              overflowY: 'hidden',
              pr: 1,
            }}
          >
            <DataGrid
              rows={filteredRows}
              columns={classroomColumns}
              loading={isLoading}
              disableRowSelectionOnClick
              onCellClick={handleCellClick}
              initialState={{
                pagination: { paginationModel: { pageSize: 10, page: 0 } },
              }}
              pageSizeOptions={[5, 10, 25]}
            />
          </Box>
        )}

        <Menu
          anchorEl={menuAnchorEl}
          open={Boolean(menuAnchorEl)}
          onClose={handleMenuClose}
        >
          <MenuItem onClick={handleGoToProfile}>Perfil</MenuItem>
          <MenuItem
            sx={{ color: 'error.main' }}
            onClick={handleDeleteCourse}
            disabled={deleteClassroomMutation.isPending}
          >
            Eliminar
          </MenuItem>
        </Menu>
      </Stack>
    </Box>
  );
};
