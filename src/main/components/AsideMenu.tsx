import { useState } from 'react';

import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  Avatar,
  Menu,
  MenuItem,
  ListSubheader,
} from '@mui/material';

import SchoolIcon from '@mui/icons-material/School';
import ClassIcon from '@mui/icons-material/Class';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LogoutIcon from '@mui/icons-material/Logout';
import HomeIcon from '@mui/icons-material/Home';
import SettingsIcon from '@mui/icons-material/Settings';

export const AsideMenu = () => {
  const [anchorElAcountMenu, setAnchorElAcountMenu] =
    useState<null | HTMLElement>(null);
  const open = Boolean(anchorElAcountMenu);

  const handleClickAcountMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElAcountMenu(event.currentTarget);
  };

  const handleCloseAcountMenu = () => {
    setAnchorElAcountMenu(null);
  };

  return (
    <div>
      <Box
        sx={{
          maxWidth: '25vw',
          minWidth: '20vw',
          bgcolor: '#555D86',
          height: '100%',
          borderRadius: '16px',
          color: '#ffffff',
          display: 'flex',
          flexDirection: 'column',
          position: 'realtive',
        }}
      >
        <List>
          <ListItem>
            <ListItemButton
              onClick={handleClickAcountMenu}
              id='basic-button'
              aria-controls={open ? 'basic-menu' : undefined}
              aria-haspopup='true'
              aria-expanded={open ? 'true' : undefined}
            >
              <ListItemIcon>
                <Avatar className='bg-[#B5CAD9]'>SC</Avatar>
              </ListItemIcon>
              Salvador Castellanos
            </ListItemButton>

            <Menu
              id='basic-menu'
              anchorEl={anchorElAcountMenu}
              open={open}
              onClose={handleCloseAcountMenu}
              slotProps={{
                list: {
                  'aria-labelledby': 'basic-button',
                },
              }}
            >
              <MenuItem onClick={handleCloseAcountMenu}>
                <ListItemIcon>
                  <AccountCircleIcon />
                </ListItemIcon>{' '}
                My account
              </MenuItem>
              <MenuItem onClick={handleCloseAcountMenu}>
                <ListItemIcon>
                  <LogoutIcon />
                </ListItemIcon>
                Logout
              </MenuItem>
            </Menu>
          </ListItem>
        </List>

        <List
          subheader={
            <ListSubheader
              sx={{ bgcolor: '#555D86', color: '#ffffff', fontSize: '20px' }}
            >
              Colegio
            </ListSubheader>
          }
        >
          <ListItem>
            <ListItemButton>
              <ListItemIcon>
                <HomeIcon sx={{ color: '#B5CAD9' }} />
              </ListItemIcon>
              Inicio
            </ListItemButton>
          </ListItem>
          <ListItem>
            <ListItemButton>
              <ListItemIcon>
                <SchoolIcon sx={{ color: '#B5CAD9' }} />
              </ListItemIcon>
              Lista Estudiantes
            </ListItemButton>
          </ListItem>
          <ListItem>
            <ListItemButton>
              <ListItemIcon>
                <ClassIcon sx={{ color: '#B5CAD9' }} />
              </ListItemIcon>
              Lista Cursos
            </ListItemButton>
          </ListItem>
        </List>
        <ListItem sx={{ marginTop: 'auto', marginBottom: '10px' }}>
          <ListItemButton>
            <ListItemIcon>
              <SettingsIcon sx={{ color: '#B5CAD9' }} />
            </ListItemIcon>
            Configuración
          </ListItemButton>
        </ListItem>
      </Box>
    </div>
  );
};
