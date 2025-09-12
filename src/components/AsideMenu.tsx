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
} from '@mui/material';

import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LogoutIcon from '@mui/icons-material/Logout';
import HomeIcon from '@mui/icons-material/Home';
import SettingsIcon from '@mui/icons-material/Settings';
import DataSaverOffIcon from '@mui/icons-material/DataSaverOff';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';

import { useNavigate } from 'react-router';

import { useUserStore } from '../Store/UserStore';

interface AsideMenuProps {
  grid: string;
}

export const AsideMenu = ({ grid }: AsideMenuProps) => {
  const logOut = useUserStore((store) => store.logOut);
  const navigate = useNavigate();

  const username = useUserStore((store) => store.username);

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
    <Box
      sx={{
        bgcolor: '#555D86',
        height: '100%',
        borderRadius: '16px',
        color: '#ffffff',
        display: 'flex',
        flexDirection: 'column',
        position: 'realtive',
      }}
      className={grid}
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
              <Avatar className='bg-[#B5CAD9]'>
                {username
                  ?.split(' ')
                  .map((word) => word[0]?.toUpperCase())
                  .join('')}
              </Avatar>
            </ListItemIcon>
            {username}
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
            <MenuItem onClick={() => navigate('perfil')}>
              <ListItemIcon>
                <AccountCircleIcon />
              </ListItemIcon>{' '}
              Mi cuenta
            </MenuItem>
            <MenuItem
              onClick={() => {
                logOut?.();
                navigate('/login');
              }}
            >
              <ListItemIcon>
                <LogoutIcon />
              </ListItemIcon>
              Salir
            </MenuItem>
          </Menu>
        </ListItem>
      </List>

      <List>
        <ListItem>
          <ListItemButton onClick={() => navigate('main')}>
            <ListItemIcon>
              <HomeIcon sx={{ color: '#B5CAD9' }} />
            </ListItemIcon>
            Inicio
          </ListItemButton>
        </ListItem>
        <ListItem>
          <ListItemButton>
            <ListItemIcon>
              <FormatListBulletedIcon sx={{ color: '#B5CAD9' }} />
            </ListItemIcon>
            Listas
          </ListItemButton>
        </ListItem>
        <ListItem>
          <ListItemButton onClick={() => navigate('statics')}>
            <ListItemIcon>
              <DataSaverOffIcon sx={{ color: '#B5CAD9' }} />
            </ListItemIcon>
            Estadisticas
          </ListItemButton>
        </ListItem>
      </List>
      <ListItem sx={{ marginTop: 'auto', marginBottom: '10px' }}>
        <ListItemButton onClick={() => navigate('config')}>
          <ListItemIcon>
            <SettingsIcon sx={{ color: '#B5CAD9' }} />
          </ListItemIcon>
          Configuración
        </ListItemButton>
      </ListItem>
    </Box>
  );
};
