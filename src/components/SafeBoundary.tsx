import React from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { Box, Button, Typography } from '@mui/material';

const Fallback: React.FC<{ error: unknown; resetErrorBoundary: () => void }> = ({
  error,
  resetErrorBoundary,
}) => {
  return (
    <Box
      role='alert'
      sx={{
        p: 2,
        border: '1px dashed',
        borderColor: 'divider',
        bgcolor: 'background.paper',
        color: 'text.primary',
        borderRadius: 1,
      }}
    >
      <Typography variant='subtitle1' sx={{ fontWeight: 700, mb: 1 }}>
        Ocurrió un error en esta sección
      </Typography>
      <Typography variant='body2' sx={{ mb: 1 }}>
        {error instanceof Error ? error.message : String(error)}
      </Typography>
      <Button variant='outlined' size='small' onClick={resetErrorBoundary}>
        Reintentar
      </Button>
    </Box>
  );
};

export const SafeBoundary: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  return (
    <ErrorBoundary FallbackComponent={Fallback} onReset={() => {}}>
      {children}
    </ErrorBoundary>
  );
};

export default SafeBoundary;
