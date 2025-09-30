// components/CustomDialog.tsx

import CloseIcon from '@mui/icons-material/Close';
import { useStore } from '../Store/Store.ts';
import { Modal, Box, Typography, IconButton } from '@mui/material';

import { ErrorBoundary } from 'react-error-boundary';

export const CustomModal = () => {
  const dialogTitle = useStore((state) => state.dialogTitle);
  const dialogContent = useStore((state) => state.dialogContent);
  const closeDialog = useStore((state) => state.closeDialog);
  const isOpen = useStore((state) => state.isDialogOpen);
  const dialogSize = useStore((state) => state.dialogSize);

  const getDimensions = () => {
    if (dialogSize === 'big') {
      return { width: '70vw', height: '85vh' };
    }
    if (dialogSize === 'small') {
      return { width: '50vw', height: '50vh' };
    }
    if (typeof dialogSize === 'object' && dialogSize) {
      const w = Math.max(200, dialogSize.width || 0);
      const h = Math.max(160, dialogSize.height || 0);
      return { width: `${w}px`, height: `${h}px` };
    }
    return { width: '70vw', height: '85vh' };
  };
  const { width, height } = getDimensions();

  return (
    <ErrorBoundary fallback={<div>Error loading dialog.</div>}>
      <Modal
        open={isOpen}
        onClose={closeDialog}
        className='flex items-center justify-center p-4'
      >
        <Box
          sx={{
            width,
            height,
            backgroundColor: 'background.default',
            padding: '0.5rem',
          }}
          className=' rounded-xl'
        >
          <Box className='flex justify-between items-center rounded-t-md'>
            <Typography>{dialogTitle}</Typography>
            <IconButton onClick={() => closeDialog()}>
              <CloseIcon />
            </IconButton>
          </Box>
          <Box
            className='rounded-b-md overflow-auto mb-4'
            sx={{ height: `calc(${height} - 48px)` }}
          >
            {dialogContent}
          </Box>
        </Box>
      </Modal>
    </ErrorBoundary>
  );
};
