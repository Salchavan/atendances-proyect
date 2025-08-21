// components/CustomDialog.tsx

import CloseIcon from '@mui/icons-material/Close';
import { useStore } from '../store/Store';
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
      className='flex flex-col justify-center items-center p-4'
    >
      <Box className='h-[75%] w-[90%] '>
        <Box className='bg-white p-2 flex justify-between items-center'>
          <Typography>{dialogTitle}</Typography>
          <IconButton onClick={() => closeDialog()}>
            <CloseIcon />
          </IconButton>
        </Box>
        <Box className='bg-white p-2 '>{dialogContent}</Box>
      </Box>
    </Modal>
  );
};
