// components/CustomDialog.tsx

import CloseIcon from '@mui/icons-material/Close';
import { useStore } from '../Store/Store.ts';
import { Modal, Box, Typography, IconButton } from '@mui/material';

export const CustomModal = () => {
  const dialogTitle = useStore((state) => state.dialogTitle);
  const dialogContent = useStore((state) => state.dialogContent);
  const closeDialog = useStore((state) => state.closeDialog);
  const isOpen = useStore((state) => state.isDialogOpen);

  return (
    <Modal
      open={isOpen}
      onClose={closeDialog}
      className='flex items-center justify-center p-4'
    >
      <Box className='w-full max-w-[1000px] max-h-[85vh]'>
        <Box className='bg-white p-2 flex justify-between items-center rounded-t-md'>
          <Typography>{dialogTitle}</Typography>
          <IconButton onClick={() => closeDialog()}>
            <CloseIcon />
          </IconButton>
        </Box>
        <Box className='bg-white p-2 rounded-b-md overflow-auto max-h-[75vh]'>
          {dialogContent}
        </Box>
      </Box>
    </Modal>
  );
};
