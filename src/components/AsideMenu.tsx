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
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';

import { ErrorBoundary } from 'react-error-boundary';

import { useUserStore } from '../Store/UserStore';
import { useStore } from '../Store/Store.ts';

import { useNavigateTo } from '../Logic.ts';

interface AsideMenuProps {
  grid: string;
}

export const AsideMenu = ({ grid }: AsideMenuProps) => {
  const navigate = useNavigateTo();
  const logOut = useUserStore((s) => s.logOut);

  const userData = useUserStore((s) => s.userData);
  const setPerfilUserSelected = useStore((s) => s.setPerfilUserSelected);

  const displayName = useUserStore((store) => {
    const u = store.userData as any;
    if (!u) return undefined;
    // Prefer new schema full name
    if (u.firstName || u.lastName) {
      return `${u.firstName ?? ''} ${u.lastName ?? ''}`.trim();
    }
    return u.Username; // legacy fallback
  });

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
    <ErrorBoundary fallback={<div>Error loading menu.</div>}>
      <Box
        className={`bg-primary h-full rounded-2xl text-neutralLight flex flex-col relative ${grid}`}
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
                  {displayName
                    ?.split(' ')
                    .map((word: string) => word[0]?.toUpperCase())
                    .join('')}
                </Avatar>
              </ListItemIcon>
              {displayName}
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
              <MenuItem
                onClick={() => {
                  navigate('perfil');
                  setPerfilUserSelected(
                    userData
                      ? { ...userData, rol: Number((userData as any).rol) }
                      : undefined
                  );
                }}
              >
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
            <ListItemButton onClick={() => navigate('/home')}>
              <ListItemIcon>
                <HomeIcon sx={{ color: '#B5CAD9' }} />
              </ListItemIcon>
              Inicio
            </ListItemButton>
          </ListItem>
          <ListItem>
            <ListItemButton onClick={() => navigate('classrooms')}>
              <ListItemIcon>
                <FormatListBulletedIcon sx={{ color: '#B5CAD9' }} />
              </ListItemIcon>
              Cursos
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

          {(userData as any)?.rol === 'admin' ? (
            <ListItem>
              <ListItemButton onClick={() => navigate('admin-panel')}>
                <ListItemIcon>
                  <AdminPanelSettingsIcon sx={{ color: '#B5CAD9' }} />
                </ListItemIcon>
                Panel de administrador
              </ListItemButton>
            </ListItem>
          ) : null}
        </List>
        <ListItem className='mt-auto mb-[10px]'>
          <ListItemButton onClick={() => navigate('config')}>
            <ListItemIcon>
              <SettingsIcon sx={{ color: '#B5CAD9' }} />
            </ListItemIcon>
            Configuración
          </ListItemButton>
        </ListItem>
      </Box>
    </ErrorBoundary>
  );
};
