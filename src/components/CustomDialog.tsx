// components/CustomDialog.tsx
import { Dialog, DialogTitle, DialogContent, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useStore } from '../store/Store';

export const CustomDialog = () => {
  const isOpen = useStore((state) => state.isDialogOpen);
  const closeDialog = useStore((state) => state.closeDialog);
  const dialogTitle = useStore((state) => state.dialogTitle);
  const dialogContent = useStore((state) => state.dialogContent);

  return (
    <Dialog open={isOpen} onClose={closeDialog}>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between' }}>
        {dialogTitle}
        <IconButton onClick={closeDialog}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>{dialogContent}</DialogContent>
    </Dialog>
  );
};
