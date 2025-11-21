import React from 'react';
import { Box, Typography } from '@mui/material';

export type MetricCardProps = {
  label: string;
  value?: string | number;
};

export const MetricCard: React.FC<MetricCardProps> = ({ label, value }) => (
  <Box
    sx={{
      border: '1px solid',
      borderColor: 'divider',
      borderRadius: 2,
      px: 2,
      py: 1.5,
      minWidth: 140,
    }}
  >
    <Typography variant='caption' color='text.secondary'>
      {label}
    </Typography>
    <Typography variant='h6' fontWeight={600}>
      {value ?? '—'}
    </Typography>
  </Box>
);

export type SummaryCardProps = MetricCardProps & {
  color?: string;
};

export const SummaryCard: React.FC<SummaryCardProps> = ({
  label,
  value,
  color = 'text.primary',
}) => (
  <Box
    sx={{
      borderRadius: 2,
      border: '1px solid',
      borderColor: 'divider',
      px: 2,
      py: 1,
      minWidth: 140,
    }}
  >
    <Typography variant='caption' color='text.secondary'>
      {label}
    </Typography>
    <Typography variant='h6' fontWeight={600} color={color}>
      {value ?? '—'}
    </Typography>
  </Box>
);
