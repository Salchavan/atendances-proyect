import { Button, IconButton } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

import { ErrorBoundary } from 'react-error-boundary';

export const ComandPaletteSearch = () => {
  return (
    <ErrorBoundary fallback={<div>Error loading index.</div>}>
      <Button variant='outlined' startIcon={<SearchIcon />}>
        <IconButton>
          <SearchIcon />
        </IconButton>
      </Button>
    </ErrorBoundary>
  );
};
