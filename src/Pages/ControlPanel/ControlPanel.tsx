import {
  Box,
  Card,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
} from '@mui/material';
import SchoolIcon from '@mui/icons-material/School';
import GroupsIcon from '@mui/icons-material/Groups';
import BadgeIcon from '@mui/icons-material/Badge';
import ViewWeekIcon from '@mui/icons-material/ViewWeek';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { changePageTitle } from '../../Logic';
import { Outlet } from 'react-router';
import { useNavigateTo } from '../../Logic';

export const AdminPanel = () => {
  changePageTitle('Panel de Administración');
  const navigateTo = useNavigateTo();

  const navItems = [
    {
      key: 'students',
      label: 'Estudiantes',
      icon: <GroupsIcon sx={{ color: 'primary.main' }} />,
      disabled: false,
    },
    {
      key: 'courses',
      label: 'Cursos',
      icon: <SchoolIcon sx={{ color: 'primary.main' }} />,
      disabled: false,
    },
    {
      key: 'divisions',
      label: 'Divisiones',
      icon: <ViewWeekIcon sx={{ color: 'primary.main' }} />,
      disabled: false,
    },
    {
      key: 'years',
      label: 'Años',
      icon: <CalendarMonthIcon sx={{ color: 'primary.main' }} />,
      disabled: false,
    },
    {
      key: 'specialties',
      label: 'Especialidades',
      icon: <WorkspacePremiumIcon sx={{ color: 'primary.main' }} />,
      disabled: true,
    },
    {
      key: 'special-days',
      label: 'Dias especiales',
      icon: <EventAvailableIcon sx={{ color: 'primary.main' }} />,
      disabled: true,
    },
    {
      key: 'administration',
      label: 'Administradores',
      icon: <AdminPanelSettingsIcon sx={{ color: 'primary.main' }} />,
      disabled: true,
    },
    {
      key: 'secretary',
      label: 'Secretaria',
      icon: <BadgeIcon sx={{ color: 'primary.main' }} />,
      disabled: true,
    },
    {
      key: 'preceptors',
      label: 'Preceptores',
      icon: <AccountCircleIcon sx={{ color: 'primary.main' }} />,
      disabled: true,
    },
  ];

  return (
    <Box className='col-span-8 row-span-9 grid grid-cols-5 gap-2'>
      {/* Lado izquierdo: navegación (igual a Config) */}
      <Card className='col-span-1'>
        <List className='text-base rounded-lg'>
          {navItems.map(({ key, label, icon, disabled }) => (
            <ListItem key={key}>
              <ListItemButton
                disabled={disabled}
                onClick={() => {
                  if (!disabled) navigateTo(key);
                }}
              >
                <ListItemIcon>{icon}</ListItemIcon>
                {label}
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Card>

      {/* Lado derecho: contenido */}
      <Box className='col-span-4 col-start-2'>
        <Outlet />
      </Box>
    </Box>
  );
};
