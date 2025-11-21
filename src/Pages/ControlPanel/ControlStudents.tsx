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
import ViewListIcon from '@mui/icons-material/ViewList';
import PersonAddAltIcon from '@mui/icons-material/PersonAddAlt';
import RefreshIcon from '@mui/icons-material/Refresh';
import {
  DataGrid,
  type GridColDef,
  type GridCellParams,
} from '@mui/x-data-grid';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { getAllStudents, delStudents } from '../../api/client';
import { useAcademicCatalog } from '../../store/APIStore';
import { useStore } from '../../store/Store';
import { useNavigateTo } from '../../Logic';
import { useDebouncedValue } from '../../hooks/useDebouncedValue';
import { SearchActionBar } from './components/SearchActionBar';
import { AddStudentForm } from './components/AddStudentForm';
import { EditStudentForm } from './components/EditStudentForm';

type StudentRecord = {
  id: number;
  first_name: string;
  last_name: string;
  username?: string;
  classroom_id?: number;
  active?: boolean;
  created_at?: string;
  updated_at?: string;
};

type StudentRow = StudentRecord & {
  classroom: string;
  status: string;
  email: string;
  dni: string;
};

const studentColumns: GridColDef[] = [
  { field: 'id', headerName: 'ID', width: 50 },
  { field: 'first_name', headerName: 'Nombre', width: 120 },
  { field: 'last_name', headerName: 'Apellido', width: 120 },
  { field: 'classroom', headerName: 'Curso', width: 140 },
  { field: 'status', headerName: 'Estado', width: 100 },
];

const normalizeString = (value?: string | number | null) => {
  if (value === null || value === undefined) return 'N/A';
  return String(value).trim() || 'N/A';
};

const computeStatus = (active: StudentRecord['active']) => {
  if (typeof active === 'boolean') {
    return active ? 'Activo' : 'Inactivo';
  }
  if (active === undefined || active === null) return 'Activo';
  const lowered = String(active).toLowerCase();
  if (['0', 'false', 'inactive', 'inactivo'].includes(lowered)) {
    return 'Inactivo';
  }
  return 'Activo';
};

const extractClassroomLabelFallback = () => 'N/A';

export const ControlStudents = () => {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['students'],
    queryFn: getAllStudents,
  });
  const [searchValue, setSearchValue] = useState('');
  const debouncedSearch = useDebouncedValue(searchValue, 750);
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedRow, setSelectedRow] = useState<StudentRow | null>(null);
  const { classrooms, divisions, years } = useAcademicCatalog();
  const queryClient = useQueryClient();
  const setPerfilUserSelected = useStore((s) => s.setPerfilUserSelected);
  const setProfileView = useStore((s) => s.setProfileView);
  const openDialog = useStore((s) => s.openDialog);
  const navigateTo = useNavigateTo();

  const classroomMap = useMemo(() => {
    const map = new Map<string, (typeof classrooms)[number]>();
    classrooms.forEach((classroom) => {
      if (classroom?.id !== undefined && classroom?.id !== null) {
        map.set(String(classroom.id), classroom);
      }
    });
    return map;
  }, [classrooms]);

  const divisionMap = useMemo(() => {
    const map = new Map<string, (typeof divisions)[number]>();
    divisions.forEach((division) => {
      if (division?.id !== undefined && division?.id !== null) {
        map.set(String(division.id), division);
      }
    });
    return map;
  }, [divisions]);

  const yearMap = useMemo(() => {
    const map = new Map<string, (typeof years)[number]>();
    years.forEach((year) => {
      if (year?.id !== undefined && year?.id !== null) {
        map.set(String(year.id), year);
      }
    });
    return map;
  }, [years]);

  const resolveClassroomLabel = useCallback(
    (student: StudentRecord) => {
      const toKey = (value: unknown) =>
        value === undefined || value === null ? undefined : String(value);

      const classroomKey = toKey(student.classroom_id);

      if (classroomKey) {
        const classroom = classroomMap.get(classroomKey);
        if (classroom) {
          const yearKey = toKey(classroom.year_id ?? classroom.year);
          const divisionKey = toKey(
            classroom.division_id ??
              classroom.division_letter ??
              classroom.division
          );
          const yearLabel =
            (yearKey && yearMap.get(yearKey)?.year_number) ??
            classroom.year ??
            classroom.year_id;
          const divisionLabel =
            (divisionKey && divisionMap.get(divisionKey)?.division_letter) ??
            classroom.division_letter ??
            classroom.division;
          if (yearLabel || divisionLabel) {
            return `${yearLabel ?? ''} ${divisionLabel ?? ''}`.trim() || 'N/A';
          }
        }
      }

      return extractClassroomLabelFallback();
    },
    [classroomMap, divisionMap, yearMap]
  );

  const students = useMemo(() => {
    if (!data) return [];
    if (Array.isArray(data)) return data as StudentRecord[];
    const candidates = ['students', 'data', 'items', 'results'];
    for (const key of candidates) {
      const maybeArray = (data as Record<string, unknown>)[key];
      if (Array.isArray(maybeArray)) {
        return maybeArray as StudentRecord[];
      }
    }
    return [];
  }, [data]);

  const rows = useMemo<StudentRow[]>(() => {
    return students.map((student, index) => {
      const derivedFirstName = student.first_name ?? 'N/A';
      const lastName = student.last_name ?? 'N/A';
      const email = 'N/A';
      const dni = 'N/A';
      const status = computeStatus(student.active);

      return {
        ...student,
        id: student.id ?? index,
        dni: normalizeString(dni),
        first_name: normalizeString(derivedFirstName),
        last_name: normalizeString(lastName ?? 'N/A'),
        classroom: resolveClassroomLabel(student),
        status,
        email: normalizeString(email),
      };
    });
  }, [students, resolveClassroomLabel]);

  const normalizedSearch = debouncedSearch.trim().toLowerCase();
  const filteredRows = useMemo(() => {
    return rows.filter((row) => {
      if (row.status !== 'Activo') return false;
      if (!normalizedSearch) return true;
      const searchableValues = [
        row.dni,
        row.first_name,
        row.last_name,
        row.classroom,
        row.email,
      ];
      return searchableValues.some((value) =>
        String(value ?? '')
          .toLowerCase()
          .includes(normalizedSearch)
      );
    });
  }, [rows, normalizedSearch]);

  const handleCellClick = useCallback(
    (params: GridCellParams, event: MouseEvent<HTMLElement>) => {
      event.preventDefault();
      setSelectedRow(params.row as StudentRow);
      setMenuAnchorEl(event.currentTarget);
    },
    []
  );

  const handleMenuClose = () => setMenuAnchorEl(null);

  const deleteStudentMutation = useMutation({
    mutationFn: (ids: number[]) => delStudents(ids),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['students'] });
    },
  });

  const handleGoToProfile = () => {
    if (!selectedRow) return;
    setPerfilUserSelected({ ...selectedRow });
    setProfileView('STUDENT');
    navigateTo('/home/profile');
    handleMenuClose();
  };

  const handleDeleteStudent = async () => {
    if (!selectedRow?.id) return;
    const confirmed = window.confirm(
      `¿Eliminar al estudiante "${selectedRow.first_name} ${selectedRow.last_name}"? Esta acción no se puede deshacer.`
    );
    if (!confirmed) {
      handleMenuClose();
      return;
    }
    try {
      await deleteStudentMutation.mutateAsync([Number(selectedRow.id)]);
    } catch (error) {
      console.error('Error deleting student', error);
    } finally {
      handleMenuClose();
    }
  };

  const handleOpenAddStudent = () => {
    openDialog(
      <AddStudentForm
        classrooms={classrooms}
        divisions={divisions}
        years={years}
      />,
      'Añadir estudiante',
      { width: 520, height: 560 }
    );
  };

  const handleOpenEditStudent = () => {
    if (!selectedRow) return;
    handleMenuClose();
    openDialog(
      <EditStudentForm
        student={selectedRow}
        classrooms={classrooms}
        divisions={divisions}
        years={years}
      />,
      'Editar estudiante',
      { width: 760, height: 520 }
    );
  };

  return (
    <Box sx={{ paddingLeft: 2 }}>
      <Stack spacing={2}>
        <Typography variant='h5'>Estudiantes</Typography>
        <Typography variant='body2' color='text.secondary'>
          Consulta y gestiona el listado de estudiantes cargados en el sistema.
        </Typography>
        <SearchActionBar
          value={searchValue}
          onChange={setSearchValue}
          placeholder='Buscar por nombre, apellido, curso o DNI'
          actions={
            <>
              <Button
                variant='contained'
                startIcon={<PersonAddAltIcon />}
                onClick={handleOpenAddStudent}
              >
                Añadir estudiante
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
            No pudimos cargar los estudiantes. Intenta nuevamente.
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
              columns={studentColumns}
              loading={isLoading}
              disableRowSelectionOnClick
              onCellClick={handleCellClick}
              initialState={{
                pagination: { paginationModel: { pageSize: 10, page: 0 } },
              }}
              pageSizeOptions={[5, 10, 25, 50]}
            />
          </Box>
        )}

        <Menu
          anchorEl={menuAnchorEl}
          open={Boolean(menuAnchorEl)}
          onClose={handleMenuClose}
        >
          <MenuItem onClick={handleGoToProfile}>Perfil</MenuItem>
          <MenuItem onClick={handleOpenEditStudent}>Editar</MenuItem>
          <MenuItem
            sx={{ color: 'error.main' }}
            onClick={handleDeleteStudent}
            disabled={deleteStudentMutation.isPending}
          >
            Eliminar
          </MenuItem>
        </Menu>
      </Stack>
    </Box>
  );
};
