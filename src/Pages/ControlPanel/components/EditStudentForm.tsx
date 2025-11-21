import { useMemo, useState, type ChangeEvent } from 'react';
import {
  Box,
  Button,
  Divider,
  MenuItem,
  FormControlLabel,
  Switch,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { putStudent } from '../../../api/client';
import { useStore } from '../../../store/Store';
import type {
  ClassroomRecord,
  DivisionRecord,
  YearRecord,
} from '../../../store/APIStore';
import {
  buildClassroomLabel,
  buildDivisionMap,
  buildYearMap,
} from './classroomUtils';

interface EditableStudent {
  id: number;
  first_name?: string;
  last_name?: string;
  username?: string;
  classroom_id?: number;
  classroom?: string;
  status?: string;
  active?: boolean;
}

interface EditStudentFormProps {
  student: EditableStudent;
  classrooms: ClassroomRecord[];
  divisions: DivisionRecord[];
  years: YearRecord[];
}

const OriginalField = ({
  label,
  value,
}: {
  label: string;
  value?: string | number | null;
}) => (
  <Box>
    <Typography variant='caption' color='text.secondary'>
      {label}
    </Typography>
    <Typography variant='body1'>
      {value !== undefined && value !== null && value !== '' ? value : '—'}
    </Typography>
  </Box>
);

export const EditStudentForm = ({
  student,
  classrooms,
  divisions,
  years,
}: EditStudentFormProps) => {
  const closeDialog = useStore((s) => s.closeDialog);
  const queryClient = useQueryClient();
  const [formValues, setFormValues] = useState({
    first_name: student.first_name ?? '',
    last_name: student.last_name ?? '',
    username: student.username ?? '',
    classroomId: student.classroom_id ? String(student.classroom_id) : '',
    active:
      typeof student.active === 'boolean'
        ? student.active
        : student.status !== 'Inactivo',
  });
  const [formError, setFormError] = useState<string | null>(null);

  const divisionsMap = useMemo(() => buildDivisionMap(divisions), [divisions]);
  const yearsMap = useMemo(() => buildYearMap(years), [years]);

  const classroomOptions = useMemo(() => {
    return classrooms.map((classroom) => ({
      value: classroom.id,
      label: buildClassroomLabel(classroom, divisionsMap, yearsMap),
    }));
  }, [classrooms, divisionsMap, yearsMap]);

  const currentClassroomLabel = useMemo(() => {
    if (student.classroom && student.classroom !== 'N/A') {
      return student.classroom;
    }
    const classroomRecord = classrooms.find((cls) => {
      if (cls?.id === undefined || student.classroom_id === undefined) {
        return false;
      }
      return String(cls.id) === String(student.classroom_id);
    });
    if (!classroomRecord) return 'Sin curso';
    return buildClassroomLabel(classroomRecord, divisionsMap, yearsMap);
  }, [
    student.classroom,
    student.classroom_id,
    classrooms,
    divisionsMap,
    yearsMap,
  ]);

  const originalStatusLabel = useMemo(() => {
    if (typeof student.active === 'boolean') {
      return student.active ? 'Activo' : 'Inactivo';
    }
    return student.status ?? 'Activo';
  }, [student.active, student.status]);

  const { mutateAsync } = useMutation({
    mutationFn: (payload: {
      first_name: string;
      last_name: string;
      username: string;
      classroom_id: number;
      active: boolean;
    }) => putStudent(student.id, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['students'] });
      closeDialog();
    },
  });

  const updateField = (field: string, value: string) => {
    setFormValues((prev) => ({ ...prev, [field]: value }));
  };

  const handleActiveChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { checked } = event.target;
    setFormValues((prev) => ({ ...prev, active: checked }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);
    if (
      !formValues.first_name ||
      !formValues.last_name ||
      !formValues.username ||
      !formValues.classroomId
    ) {
      setFormError('Completa todos los campos requeridos.');
      return;
    }

    try {
      await mutateAsync({
        first_name: formValues.first_name.trim(),
        last_name: formValues.last_name.trim(),
        username: formValues.username.trim(),
        classroom_id: Number(formValues.classroomId),
        active: formValues.active,
      });
    } catch (error) {
      setFormError('No pudimos actualizar el estudiante. Intenta nuevamente.');
      console.error(error);
    }
  };

  return (
    <Box component='form' onSubmit={handleSubmit} sx={{ mt: 1 }}>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
          columnGap: 3,
          rowGap: 2,
        }}
      >
        <Stack spacing={1.5}>
          <Typography variant='subtitle1'>Datos actuales</Typography>
          <OriginalField label='Nombre' value={student.first_name} />
          <OriginalField label='Apellido' value={student.last_name} />
          <OriginalField label='Usuario' value={student.username} />
          <OriginalField label='Curso' value={currentClassroomLabel} />
          <OriginalField label='Estado' value={originalStatusLabel} />
        </Stack>
        <Stack spacing={2}>
          <Typography variant='subtitle1'>Actualizar información</Typography>
          <TextField
            label='Nombre'
            value={formValues.first_name}
            onChange={(event) => updateField('first_name', event.target.value)}
            required
          />
          <TextField
            label='Apellido'
            value={formValues.last_name}
            onChange={(event) => updateField('last_name', event.target.value)}
            required
          />
          <TextField
            label='Usuario'
            value={formValues.username}
            onChange={(event) => updateField('username', event.target.value)}
            required
          />
          <TextField
            select
            label='Curso'
            value={formValues.classroomId}
            onChange={(event) => updateField('classroomId', event.target.value)}
            required
          >
            {classroomOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>
          <FormControlLabel
            control={
              <Switch
                checked={formValues.active}
                onChange={handleActiveChange}
                color='primary'
              />
            }
            label={formValues.active ? 'Activo' : 'Inactivo'}
          />
        </Stack>
      </Box>
      {formError ? (
        <Typography color='error' variant='body2' sx={{ mt: 2 }}>
          {formError}
        </Typography>
      ) : null}
      <Divider sx={{ my: 2 }} />
      <Stack direction='row' spacing={1} justifyContent='flex-end'>
        <Button onClick={closeDialog}>Cancelar</Button>
        <Button type='submit' variant='contained'>
          Guardar cambios
        </Button>
      </Stack>
    </Box>
  );
};
