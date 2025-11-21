import React from 'react';
import { Box, Paper, Typography } from '@mui/material';

export type EmptyProfileStateProps = {
  title: string;
  description: string;
};

export const EmptyProfileState: React.FC<EmptyProfileStateProps> = ({
  title,
  description,
}) => (
  <Box
    sx={{
      p: 4,
      height: '100%',
      gridColumn: '1 / -1',
      gridRow: '1 / -1',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}
  >
    <Paper sx={{ p: 4, maxWidth: 480, textAlign: 'center' }}>
      <Typography variant='h6' gutterBottom>
        {title}
      </Typography>
      <Typography color='text.secondary'>{description}</Typography>
    </Paper>
  </Box>
);
