import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  Card,
  CardContent,
} from '@mui/material';
import AccessibilityIcon from '@mui/icons-material/Accessibility';
import SettingsIcon from '@mui/icons-material/Settings';
import { changePageTitle, useNavigateTo } from '../../Logic';
import { Outlet } from 'react-router';

export const Config = () => {
  const navigateTo = useNavigateTo();
  changePageTitle('Configuración');
  return (
    <Box className='col-span-8 row-span-9 grid grid-cols-5 gap-2'>
      <Card className='col-span-1'>
        <CardContent>
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
          </List>
        </CardContent>
      </Card>
      <Box className='col-span-4 col-start-2'>
        <Outlet />
      </Box>
    </Box>
  );
};
