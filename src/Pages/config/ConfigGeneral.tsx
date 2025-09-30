import {
  Typography,
  Box,
  List,
  ListItem,
  Switch,
  ListItemIcon,
  ListItemButton,
} from '@mui/material';
import { changePageTitle } from '../../Logic';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import FontDownloadIcon from '@mui/icons-material/FontDownload';
import { useStore } from '../../Store/Store.ts';
import { FontPicker } from '../../components/FontPicker';

export const ConfigGeneral = () => {
  changePageTitle('Configuración - General');
  const themeMode = useStore((s) => s.themeMode);
  const toggleThemeMode = useStore((s) => s.toggleThemeMode);
  const fontFamily = useStore((s) => s.fontFamily);
  const openDialog = useStore((s) => s.openDialog);

  return (
    <Box sx={{ paddingLeft: 2 }}>
      <Typography variant='h3'>Configuración General</Typography>
      <List>
        <ListItem disableGutters>
          <ListItemButton onClick={toggleThemeMode}>
            <ListItemIcon>
              <DarkModeIcon sx={{ color: 'primary.main' }} />
            </ListItemIcon>
            <Typography>Modo oscuro</Typography>
            <Switch
              checked={themeMode === 'dark'}
              onChange={toggleThemeMode}
              onClick={(e) => e.stopPropagation()}
              sx={{ ml: 'auto' }}
            />
          </ListItemButton>
        </ListItem>
        <ListItem disableGutters>
          <ListItemButton
            onClick={() =>
              openDialog(<FontPicker />, 'Seleccionar fuente', 'small')
            }
          >
            <ListItemIcon>
              <FontDownloadIcon sx={{ color: 'primary.main' }} />
            </ListItemIcon>
            <Typography>Cambiar fuente</Typography>
            <Box
              sx={{ ml: 'auto', display: 'flex', alignItems: 'center', gap: 2 }}
            >
              <Typography variant='body2' color='text.secondary'>
                Muestra:
              </Typography>
              <Typography sx={{ fontFamily, maxWidth: 240 }} noWrap>
                The quick brown fox jumps over the lazy dog
              </Typography>
            </Box>
          </ListItemButton>
        </ListItem>
      </List>
    </Box>
  );
};
