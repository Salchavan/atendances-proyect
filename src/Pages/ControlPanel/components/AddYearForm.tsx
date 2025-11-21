import { useState } from 'react';
import { Box, Button, Stack, TextField, Typography } from '@mui/material';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { postYear } from '../../../api/client';
import { useStore } from '../../../store/Store';

export const AddYearForm = () => {
  const closeDialog = useStore((s) => s.closeDialog);
  const queryClient = useQueryClient();
  const [yearNumber, setYearNumber] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const mutation = useMutation<any, Error, { label: number }>({
    mutationFn: (payload: { label: number }) => postYear(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['years'] });
      closeDialog();
    },
  });

  const { mutateAsync } = mutation;
  const isLoading = mutation.status === 'pending';

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);
    const parsed = Number(yearNumber);
    if (!Number.isInteger(parsed) || parsed <= 0) {
      setFormError('Ingresa un número de año válido (ej. 1, 2, 3).');
      return;
    }

    try {
      await mutateAsync({ label: parsed });
    } catch (error) {
      console.error('Error creating year', error);
      setFormError('No pudimos crear el año. Intenta nuevamente.');
    }
  };

  return (
    <Box component='form' onSubmit={handleSubmit} sx={{ mt: 1 }}>
      <Stack spacing={2}>
        <Typography variant='subtitle1'>Nuevo año escolar</Typography>
        <TextField
          label='Número de año'
          type='number'
          value={yearNumber}
          onChange={(event) => setYearNumber(event.target.value)}
          inputProps={{ min: 1 }}
          helperText='Ejemplo: 1, 2, 3, 4'
          required
        />
        {formError ? (
          <Typography color='error' variant='body2'>
            {formError}
          </Typography>
        ) : null}
        <Stack direction='row' spacing={1} justifyContent='flex-end'>
          <Button onClick={closeDialog} disabled={isLoading}>
            Cancelar
          </Button>
          <Button type='submit' variant='contained' disabled={isLoading}>
            Guardar
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
};
