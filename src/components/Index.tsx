import { TextField, InputAdornment } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

export const Index = () => {
  return (
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
  );
};
