import React from 'react';
import { Box, Typography, Tooltip, IconButton } from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';

const fallback = 'NO Definido';

export type InfoFieldProps = {
  label: string;
  value?: string | number | React.ReactNode;
  copyValue?: string | number;
};

export const InfoField: React.FC<InfoFieldProps> = ({
  label,
  value,
  copyValue,
}) => {
  const copyToClipboard = (val?: string | number) => {
    if (val === undefined || val === null) return;
    navigator.clipboard?.writeText(String(val)).catch(() => {});
  };

  const canCopy =
    copyValue !== undefined && copyValue !== null && copyValue !== '';

  return (
    <Box display='flex' alignItems='center' gap={1}>
      <Box>
        <Typography variant='caption' color='text.secondary'>
          {label}
        </Typography>
        <Typography variant='body1' fontWeight={500}>
          {value ?? fallback}
        </Typography>
      </Box>
      {canCopy && (
        <Tooltip title={`Copiar ${label}`}>
          <IconButton size='small' onClick={() => copyToClipboard(copyValue)}>
            <ContentCopyIcon fontSize='inherit' />
          </IconButton>
        </Tooltip>
      )}
    </Box>
  );
};
