import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
} from '@mui/material';
import AccessibilityIcon from '@mui/icons-material/Accessibility';
import SettingsIcon from '@mui/icons-material/Settings';
import { changePageTitle, useNavigateTo } from '../../Logic';
import { Outlet } from 'react-router';
import { ErrorBoundary } from 'react-error-boundary';
import { ErrorFallback } from '../../components/ErrorFallback';

export const Config = () => {
  const navigateTo = useNavigateTo();
  changePageTitle('Configuración');
  return (
    <ErrorBoundary fallback={<ErrorFallback />}>
      <Box className='col-span-8 row-span-9 grid grid-cols-7 gap-2'>
        <List className='col-span-2 '>
          <ListItem>
            <ListItemButton
              onClick={() => {
                navigateTo('general');
              }}
            >
              <ListItemIcon>
                <SettingsIcon sx={{ color: '#B5CAD9' }} />
              </ListItemIcon>
              General
            </ListItemButton>
          </ListItem>
          <ListItem>
            <ListItemButton onClick={() => navigateTo('accessibility')}>
              <ListItemIcon>
                <AccessibilityIcon sx={{ color: '#B5CAD9' }} />
              </ListItemIcon>
              Accessibilidad
            </ListItemButton>
          </ListItem>
        </List>
        <Box className='col-span-6 col-start-3'>
          <Outlet />
        </Box>
      </Box>
    </ErrorBoundary>
  );
};
