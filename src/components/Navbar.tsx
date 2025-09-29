import { List, ListItem } from '@mui/material';

import { ComandPaletteSearch } from './ComandPaletteSearch.tsx';

import { ErrorBoundary } from 'react-error-boundary';
import { ErrorFallback } from './ErrorFallback';

interface NavbarProps {
  grid: string;
}

export const Navbar = ({ grid }: NavbarProps) => {
  return (
    <ErrorBoundary fallback={<ErrorFallback />}>
      <List sx={{ display: 'flex', flexDirection: 'row' }} className={grid}>
        <ListItem>
          <ComandPaletteSearch />
        </ListItem>
        <ListItem sx={{ boxSizing: 'content-box', maxWidth: '60px' }}>
          <img
            src='https://www.ipetym69.edu.ar/images/colegiologo.png'
            alt='Logo IPETYM 69'
            className='max-w-15'
          />
        </ListItem>
      </List>
    </ErrorBoundary>
  );
};
