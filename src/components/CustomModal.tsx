// components/CustomDialog.tsx

import CloseIcon from '@mui/icons-material/Close';
import { useStore } from '../store/Store';
import { Box, Typography, IconButton } from '@mui/material';
import { createPortal } from 'react-dom';
import { ErrorBoundary } from 'react-error-boundary';
import { useEffect, useMemo } from 'react';

export const CustomModal = () => {
  const dialogTitle = useStore((state) => state.dialogTitle);
  const dialogContent = useStore((state) => state.dialogContent);
  const closeDialog = useStore((state) => state.closeDialog);
  const isOpen = useStore((state) => state.isDialogOpen);
  const dialogSize = useStore((state) => state.dialogSize);

  const { width, height } = useMemo(() => {
    if (dialogSize === 'big') return { width: '70vw', height: '85vh' };
    if (dialogSize === 'small') return { width: '50vw', height: '50vh' };
    if (typeof dialogSize === 'object' && dialogSize) {
      const w = Math.max(200, dialogSize.width || 0);
      const h = Math.max(160, dialogSize.height || 0);
      return { width: `${w}px`, height: `${h}px` };
    }
    return { width: '70vw', height: '85vh' };
  }, [dialogSize]);

  // Lock body scroll while modal is open
  useEffect(() => {
    if (!isOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const overlay = (
    <div
      role='presentation'
      onClick={closeDialog}
      style={{
        position: 'fixed',
        inset: 0,
        width: '100vw',
        height: '100vh',
        background: 'rgba(0,0,0,0.4)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        zIndex: 1300,
        overflow: 'hidden',
      }}
    >
      <Box
        role='dialog'
        aria-modal='true'
        aria-labelledby='custom-modal-title'
        onClick={(e) => e.stopPropagation()}
        sx={{
          width,
          height,
          backgroundColor: 'background.default',
          padding: '0.5rem',
          display: 'flex',
          flexDirection: 'column',
          borderRadius: 2,
          boxShadow:
            '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -4px rgba(0,0,0,0.1)',
          maxWidth: '100%',
          maxHeight: '100%',
          minWidth: 0,
          minHeight: 0,
        }}
        className='rounded-xl'
      >
        <Box
          id='custom-modal-title'
          className='flex justify-between items-center rounded-t-md'
          sx={{ flexShrink: 0 }}
        >
          <Typography>{dialogTitle}</Typography>
          <IconButton onClick={() => closeDialog()} aria-label='Cerrar'>
            <CloseIcon />
          </IconButton>
        </Box>
        <Box
          className='rounded-b-md mb-1'
          sx={{
            flex: 1,
            minHeight: 0,
            minWidth: 0,
            overflowY: 'auto',
            overflowX: 'hidden',
          }}
        >
          <ErrorBoundary
            fallback={<Box sx={{ p: 2 }}>Error loading content.</Box>}
          >
            {dialogContent}
          </ErrorBoundary>
        </Box>
      </Box>
    </div>
  );

  return createPortal(overlay, document.body);
};
