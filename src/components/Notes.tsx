import {
  Paper,
  TextField,
  Typography,
  IconButton,
  Tooltip,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import { useRef, useState } from 'react';

export const Notes = () => {
  const [notes, setNotes] = useState<string>('');
  const notesRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null);
  return (
    <Paper
      variant='outlined'
      sx={{
        p: 2,
        overflow: 'auto',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        minHeight: 0,
      }}
      onClick={() => notesRef.current?.focus()}
    >
      <Typography variant='h6' gutterBottom>
        Notas y Observaciones
      </Typography>
      <IconButton
        size='small'
        sx={{ position: 'absolute', top: 8, right: 8 }}
        onClick={(e) => e.stopPropagation()}
      >
        <Tooltip title='Editar Notas'>
          <EditIcon fontSize='inherit' sx={{ color: 'primary.main' }} />
        </Tooltip>
      </IconButton>
      <TextField
        inputRef={notesRef}
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder='Escribe tus notas aquí...'
        variant='outlined'
        fullWidth
        multiline
        minRows={3}
        sx={{
          mt: 1,
          flex: 1,
          minHeight: 0,
          display: 'flex',
          '& .MuiInputBase-root': {
            height: '100%',
            alignItems: 'stretch',
          },
          '& .MuiInputBase-inputMultiline': {
            height: '100%',
            overflow: 'auto',
          },
          '& textarea': {
            height: '100% !important',
            resize: 'none',
          },
        }}
      />
    </Paper>
  );
};
