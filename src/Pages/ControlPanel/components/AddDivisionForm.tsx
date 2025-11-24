import { useState } from 'react';
import { Box, Button, Stack, TextField, Typography } from '@mui/material';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { postDivision } from '../../../api/client';
import { useCachedStore } from '../../../store/CachedStore';
import { useStore } from '../../../store/Store';

export const AddDivisionForm = () => {
  const closeDialog = useStore((s) => s.closeDialog);
  const setAlert = useCachedStore((s) => s.setAlert);
  const queryClient = useQueryClient();
  const [divisionLetter, setDivisionLetter] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: (payload: { label: string }) => postDivision(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['divisions'] });
      setAlert({ type: 'success', text: 'División creada correctamente.' });
      closeDialog();
    },
  });

  const mutateAsync = mutation.mutateAsync;
  const isLoading = mutation.status === 'pending';

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);
    const trimmed = divisionLetter.trim().toUpperCase();
    if (!trimmed) {
      setFormError('Ingresa una letra para la división.');
      return;
    }

    try {
      await mutateAsync({ label: trimmed });
    } catch (error) {
      console.error('Error creating division', error);
      setFormError('No pudimos crear la división. Intenta nuevamente.');
      setAlert({ type: 'error', text: 'No pudimos crear la división.' });
    }
  };

  return (
    <Box component='form' onSubmit={handleSubmit} sx={{ mt: 1 }}>
      <Stack spacing={2}>
        <Typography variant='subtitle1'>Nueva división</Typography>
        <TextField
          label='Letra de división'
          value={divisionLetter}
          onChange={(event) => setDivisionLetter(event.target.value)}
          inputProps={{ maxLength: 2, style: { textTransform: 'uppercase' } }}
          helperText='Ejemplo: A, B, C'
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
