import { Box } from '@mui/material';

import { CommandK } from './ComandPaletteSearch.tsx';

import { ErrorBoundary } from 'react-error-boundary';

interface NavbarProps {
  grid: string;
}

export const Navbar = ({ grid }: NavbarProps) => {
  return (
    <ErrorBoundary fallback={<div>Error loading navbar.</div>}>
      <Box
        className={grid}
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <CommandK />
        <img
          src='https://www.ipetym69.edu.ar/images/colegiologo.png'
          alt='Logo IPETYM 69'
          className='max-w-15'
        />
      </Box>
    </ErrorBoundary>
  );
};
