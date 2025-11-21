import { useMemo, useState } from 'react';
import {
  Box,
  Button,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { postStudent } from '../../../api/client';
import { useStore } from '../../../store/Store';
import type {
  ClassroomRecord,
  DivisionRecord,
  YearRecord,
} from '../../../store/APIStore';
import {
  buildDivisionMap,
  buildYearMap,
  buildClassroomLabel,
} from './classroomUtils';

interface AddStudentFormProps {
  classrooms: ClassroomRecord[];
  divisions: DivisionRecord[];
  years: YearRecord[];
}

export const AddStudentForm = ({
  classrooms,
  divisions,
  years,
}: AddStudentFormProps) => {
  const closeDialog = useStore((s) => s.closeDialog);
  const queryClient = useQueryClient();
  const [formValues, setFormValues] = useState({
    first_name: '',
    last_name: '',
    username: '',
    classroomId: '',
  });
  const [formError, setFormError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: postStudent,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['students'] });
      closeDialog();
    },
  });

  const divisionsMap = useMemo(() => buildDivisionMap(divisions), [divisions]);
  const yearsMap = useMemo(() => buildYearMap(years), [years]);

  const classroomOptions = useMemo(() => {
    return classrooms.map((classroom) => ({
      value: classroom.id,
      label: buildClassroomLabel(classroom, divisionsMap, yearsMap),
    }));
  }, [classrooms, divisionsMap, yearsMap]);

  const updateField = (field: string, value: string) => {
    setFormValues((prev) => ({ ...prev, [field]: value }));
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
      await mutation.mutateAsync({
        first_name: formValues.first_name.trim(),
        last_name: formValues.last_name.trim(),
        username: formValues.username.trim(),
        classroomId: Number(formValues.classroomId),
      });
    } catch (error) {
      setFormError('No pudimos crear el estudiante. Intenta nuevamente.');
      console.error(error);
    }
  };

  return (
    <Box component='form' onSubmit={handleSubmit} sx={{ mt: 1 }}>
      <Stack spacing={2}>
        <Typography variant='subtitle1'>Nuevo estudiante</Typography>
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
        {formError ? (
          <Typography color='error' variant='body2'>
            {formError}
          </Typography>
        ) : null}
        <Stack direction='row' spacing={1} justifyContent='flex-end'>
          <Button onClick={closeDialog}>Cancelar</Button>
          <Button type='submit' variant='contained'>
            Guardar
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
};
