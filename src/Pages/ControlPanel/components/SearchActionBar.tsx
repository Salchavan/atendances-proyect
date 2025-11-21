import type { ReactNode } from 'react';
import {
  Stack,
  TextField,
  InputAdornment,
  type TextFieldProps,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

interface SearchActionBarProps {
  value: string;
  placeholder: string;
  onChange: (newValue: string) => void;
  actions: ReactNode;
  textFieldProps?: Partial<TextFieldProps>;
}

export const SearchActionBar = ({
  value,
  placeholder,
  onChange,
  actions,
  textFieldProps,
}: SearchActionBarProps) => {
  return (
    <Stack
      direction={{ xs: 'column', md: 'row' }}
      spacing={1.5}
      alignItems={{ md: 'center' }}
      justifyContent='space-between'
      flexWrap='wrap'
    >
      <TextField
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        size='small'
        InputProps={{
          startAdornment: (
            <InputAdornment position='start'>
              <SearchIcon fontSize='small' />
            </InputAdornment>
          ),
        }}
        sx={{ minWidth: { xs: '100%', md: 320 }, maxWidth: 420 }}
        {...textFieldProps}
      />
      <Stack direction='row' spacing={1} flexWrap='wrap'>
        {actions}
      </Stack>
    </Stack>
  );
};
