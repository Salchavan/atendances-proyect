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

import { postClassroom } from '../../../api/client';
import { useStore } from '../../../store/Store';
import type { DivisionRecord, YearRecord } from '../../../store/APIStore';

const shiftOptions = [
  { value: 'MORNING', label: 'Mañana' },
  { value: 'AFTERNOON', label: 'Tarde' },
  { value: 'EVENING', label: 'Noche' },
] as const;

type ShiftValue = (typeof shiftOptions)[number]['value'];

interface AddCourseFormProps {
  years: YearRecord[];
  divisions: DivisionRecord[];
}

export const AddCourseForm = ({ years, divisions }: AddCourseFormProps) => {
  const closeDialog = useStore((s) => s.closeDialog);
  const queryClient = useQueryClient();
  const [formValues, setFormValues] = useState({
    idYear: '',
    idDivision: '',
    shift: 'MORNING' as ShiftValue,
  });
  const [formError, setFormError] = useState<string | null>(null);

  const yearOptions = useMemo(() => {
    return years
      .slice()
      .sort((a, b) => (a.year_number ?? 0) - (b.year_number ?? 0))
      .map((year) => ({ value: year.id, label: year.year_number ?? year.id }));
  }, [years]);

  const divisionOptions = useMemo(() => {
    return divisions
      .slice()
      .sort((a, b) =>
        (a.division_letter ?? '').localeCompare(b.division_letter ?? '')
      )
      .map((division) => ({
        value: division.id,
        label: division.division_letter ?? division.id,
      }));
  }, [divisions]);

  const { mutateAsync } = useMutation({
    mutationFn: (payload: {
      idYear: number;
      idDivision: number;
      shift: ShiftValue;
    }) => postClassroom(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['classrooms'] });
      closeDialog();
    },
  });

  const updateField = (field: string, value: string) => {
    setFormValues((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);
    if (!formValues.idYear || !formValues.idDivision || !formValues.shift) {
      setFormError('Completa todos los campos requeridos.');
      return;
    }

    const parsedYearId = Number(formValues.idYear);
    const parsedDivisionId = Number(formValues.idDivision);
    const invalidYear = !Number.isInteger(parsedYearId) || parsedYearId <= 0;
    const invalidDivision =
      !Number.isInteger(parsedDivisionId) || parsedDivisionId <= 0;

    if (invalidYear || invalidDivision) {
      setFormError('Selecciona combinaciones de año y división válidas.');
      return;
    }

    try {
      await mutateAsync({
        idYear: parsedYearId,
        idDivision: parsedDivisionId,
        shift: formValues.shift,
      });
    } catch (error) {
      console.error(error);
      setFormError('No pudimos crear el curso. Intenta nuevamente.');
    }
  };

  return (
    <Box component='form' onSubmit={handleSubmit} sx={{ mt: 1 }}>
      <Stack spacing={2}>
        <Typography variant='subtitle1'>Nuevo curso</Typography>
        <TextField
          select
          label='Año'
          value={formValues.idYear}
          onChange={(event) => updateField('idYear', event.target.value)}
          required
        >
          {yearOptions.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          select
          label='División'
          value={formValues.idDivision}
          onChange={(event) => updateField('idDivision', event.target.value)}
          required
        >
          {divisionOptions.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          select
          label='Turno'
          value={formValues.shift}
          onChange={(event) =>
            updateField('shift', event.target.value as ShiftValue)
          }
          required
        >
          {shiftOptions.map((option) => (
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
