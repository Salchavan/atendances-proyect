import {
  Box,
  Card,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import SchoolIcon from '@mui/icons-material/School';
import GroupsIcon from '@mui/icons-material/Groups';
import { changePageTitle } from '../../Logic';
import { Outlet } from 'react-router';
import { useNavigateTo } from '../../Logic';

export const AdminPanel = () => {
  changePageTitle('Panel de Administración');
  const navigateTo = useNavigateTo();

  return (
    <Box className='col-span-8 row-span-9 grid grid-cols-5 gap-2'>
      {/* Lado izquierdo: navegación (igual a Config) */}
      <Card className='col-span-1'>
        <List className='text-base rounded-lg'>
          <ListItem>
            <ListItemButton onClick={() => navigateTo('upload')}>
              <ListItemIcon>
                <CloudUploadIcon sx={{ color: 'primary.main' }} />
              </ListItemIcon>
              Subir datos
            </ListItemButton>
          </ListItem>

          <ListItem>
            <ListItemButton onClick={() => navigateTo('download')}>
              <ListItemIcon>
                <CloudDownloadIcon sx={{ color: 'primary.main' }} />
              </ListItemIcon>
              Bajar datos
            </ListItemButton>
          </ListItem>

          <ListItem>
            <ListItemButton onClick={() => navigateTo('courses')}>
              <ListItemIcon>
                <SchoolIcon sx={{ color: 'primary.main' }} />
              </ListItemIcon>
              Cursos y estudiantes
            </ListItemButton>
          </ListItem>

          <ListItem>
            <ListItemButton onClick={() => navigateTo('preceptors')}>
              <ListItemIcon>
                <GroupsIcon sx={{ color: 'primary.main' }} />
              </ListItemIcon>
              Preceptores
            </ListItemButton>
          </ListItem>
        </List>
      </Card>

      {/* Lado derecho: contenido */}
      <Box className='col-span-4 col-start-2'>
        <Outlet />
      </Box>
    </Box>
  );
};
