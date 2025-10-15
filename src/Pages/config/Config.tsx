import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  Card,
} from '@mui/material';
import AccessibilityIcon from '@mui/icons-material/Accessibility';
import SettingsIcon from '@mui/icons-material/Settings';
import { changePageTitle, useNavigateTo } from '../../Logic';
import { useStore } from '../../store/Store';
import React from 'react';
import { ProfileSettingsModal } from '../../components/ProfileSettingsModal';
import { Outlet } from 'react-router';
import PersonIcon from '@mui/icons-material/Person';
import InfoOutlineIcon from '@mui/icons-material/InfoOutline';
import { useUserStore } from '../../store/UserStore';

export const Config = () => {
  const navigateTo = useNavigateTo();
  changePageTitle('Configuración');
  const openDialog = useStore((s) => s.openDialog);
  const userData = useUserStore((s) => s.userData);
  const setPerfilUserSelected = useStore((s) => s.setPerfilUserSelected);

  return (
    <Box className='col-span-8 row-span-9 grid grid-cols-5 gap-2'>
      <Card className='col-span-1'>
        <List className=' text-base rounded-lg'>
          <ListItem>
            <ListItemButton
              onClick={() => {
                navigateTo('general');
              }}
            >
              <ListItemIcon>
                <SettingsIcon sx={{ color: 'primary.main' }} />
              </ListItemIcon>
              General
            </ListItemButton>
          </ListItem>
          <ListItem>
            <ListItemButton onClick={() => navigateTo('accessibility')}>
              <ListItemIcon>
                <AccessibilityIcon sx={{ color: 'primary.main' }} />
              </ListItemIcon>
              Accesibilidad
            </ListItemButton>
          </ListItem>
          <ListItem>
            <ListItemButton
              onClick={() => {
                navigateTo('/home/profile');
                // Abrir modal con opciones
                openDialog(
                  React.createElement(ProfileSettingsModal),
                  'Opciones de perfil',
                  'small'
                );
                setPerfilUserSelected(
                  userData
                    ? { ...userData, rol: Number((userData as any).rol) }
                    : undefined
                );
              }}
            >
              <ListItemIcon>
                <PersonIcon sx={{ color: 'primary.main' }} />
              </ListItemIcon>
              Perfil
            </ListItemButton>
          </ListItem>

          <ListItem>
            <ListItemButton onClick={() => navigateTo('about')}>
              <ListItemIcon>
                <InfoOutlineIcon sx={{ color: 'primary.main' }} />
              </ListItemIcon>
              Acerca de
            </ListItemButton>
          </ListItem>
        </List>
      </Card>
      <Box className='col-span-4 col-start-2'>
        <Outlet />
      </Box>
    </Box>
  );
};
