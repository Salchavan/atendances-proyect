import { TextField, InputAdornment } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

import { ErrorBoundary } from 'react-error-boundary';

export const ComandPaletteSearch = () => {
  return (
    <ErrorBoundary fallback={<div>Error loading search.</div>}>
      <TextField
        sx={{ width: '100%' }}
        variant='outlined'
        label='Buscador'
        slotProps={{
          input: {
            endAdornment: (
              <InputAdornment position='start'>
                <SearchIcon />
              </InputAdornment>
            ),
          },
        }}
      />
    </ErrorBoundary>
  );
};
