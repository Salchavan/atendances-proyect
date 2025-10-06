import { useState } from 'react';
import {
  Stack,
  Typography,
  Button,
  Menu,
  MenuItem,
  ListItemIcon,
  Box,
} from '@mui/material';
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import DescriptionIcon from '@mui/icons-material/Description';
import TableChartIcon from '@mui/icons-material/TableChart';
import DataObjectIcon from '@mui/icons-material/DataObject';

export const PanelDownload = () => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const openMenu = Boolean(anchorEl);

  const handleOpenMenu = (e: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(e.currentTarget);
  };
  const handleCloseMenu = () => setAnchorEl(null);

  return (
    <Box sx={{ paddingLeft: 2 }}>
      <Stack spacing={2}>
        <Typography variant='h5'>Bajar datos</Typography>
        <Typography variant='body2' color='text.secondary'>
          Elige el tipo de archivo para descargar los datos. (UI decorativa)
        </Typography>
        <Stack direction='row' spacing={1}>
          <Button
            id='download-button'
            aria-controls={openMenu ? 'download-menu' : undefined}
            aria-haspopup='true'
            aria-expanded={openMenu ? 'true' : undefined}
            variant='contained'
            endIcon={<CloudDownloadIcon />}
            onClick={handleOpenMenu}
          >
            Descargar
          </Button>
          <Menu
            id='download-menu'
            anchorEl={anchorEl}
            open={openMenu}
            onClose={handleCloseMenu}
            MenuListProps={{ 'aria-labelledby': 'download-button' }}
          >
            <MenuItem onClick={handleCloseMenu}>
              <ListItemIcon>
                <DescriptionIcon fontSize='small' />
              </ListItemIcon>
              CSV
            </MenuItem>
            <MenuItem onClick={handleCloseMenu}>
              <ListItemIcon>
                <DataObjectIcon fontSize='small' />
              </ListItemIcon>
              JSON
            </MenuItem>
            <MenuItem onClick={handleCloseMenu}>
              <ListItemIcon>
                <TableChartIcon fontSize='small' />
              </ListItemIcon>
              XLSX
            </MenuItem>
          </Menu>
        </Stack>
      </Stack>
    </Box>
  );
};
