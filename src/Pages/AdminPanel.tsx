import { Box } from '@mui/material';
import { BoxNull } from '../components/BoxNull';
import { ErrorBoundary } from 'react-error-boundary';
import { ErrorFallback } from '../components/ErrorFallback';

export const AdminPanel = () => {
  return (
    <ErrorBoundary fallback={<ErrorFallback />}>
      <Box className='col-span-8 row-span-9 grid grid-cols-7 gap-2'>
        <BoxNull className='col-span-2' />
        <BoxNull className='col-span-6 col-start-3' />
      </Box>
    </ErrorBoundary>
  );
};
