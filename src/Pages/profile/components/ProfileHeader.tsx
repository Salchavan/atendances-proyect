import React from 'react';
import { Box, Typography, Chip, Stack, type ChipProps } from '@mui/material';

export type ProfileHeaderChip = {
  label: string;
  color?: ChipProps['color'];
  variant?: ChipProps['variant'];
};

export type ProfileHeaderProps = {
  title: string;
  chips?: ProfileHeaderChip[];
  actions?: React.ReactNode;
};

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  title,
  chips,
  actions,
}) => (
  <Box display='flex' alignItems='center' gap={2} flexWrap='wrap'>
    <Box display='flex' alignItems='center' gap={1}>
      <Typography
        variant='h4'
        fontWeight='bold'
        sx={{ fontSize: '1.5rem !important' }}
      >
        {title}
      </Typography>
      {actions}
    </Box>
    {!!chips?.length && (
      <Stack direction='row' sx={{ flexWrap: 'wrap', gap: 1 }}>
        {chips.map((chip) => (
          <Chip key={chip.label} size='small' {...chip} />
        ))}
      </Stack>
    )}
  </Box>
);
