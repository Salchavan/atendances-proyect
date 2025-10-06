import { useState } from 'react';
import { changePageTitle } from '../../Logic';
import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  Switch,
  Typography,
} from '@mui/material';
import InvertColorsIcon from '@mui/icons-material/InvertColors';
import RecordVoiceOverIcon from '@mui/icons-material/RecordVoiceOver';
import HealthAndSafetyIcon from '@mui/icons-material/HealthAndSafety';

export const ConfigAccessibility = () => {
  changePageTitle('Configuración - Accesibilidad');

  // Estado local decorativo (sin función real aún)
  const [colorBlindMode, setColorBlindMode] = useState(false);
  const [dictationEnabled, setDictationEnabled] = useState(false);
  const [epilepsyProtection, setEpilepsyProtection] = useState(false);

  return (
    <Box sx={{ paddingLeft: 2 }}>
      <Typography variant='h3'>Accesibilidad</Typography>
      <List>
        {/* Modo daltonismo */}
        <ListItem disableGutters>
          <ListItemButton onClick={() => setColorBlindMode((v) => !v)}>
            <ListItemIcon>
              <InvertColorsIcon sx={{ color: 'primary.main' }} />
            </ListItemIcon>
            <Typography>Modo para daltonismo</Typography>
            <Switch
              checked={colorBlindMode}
              onChange={() => setColorBlindMode((v) => !v)}
              onClick={(e) => e.stopPropagation()}
              sx={{ ml: 'auto' }}
            />
          </ListItemButton>
        </ListItem>

        {/* Dictado para personas ciegas */}
        <ListItem disableGutters>
          <ListItemButton onClick={() => setDictationEnabled((v) => !v)}>
            <ListItemIcon>
              <RecordVoiceOverIcon sx={{ color: 'primary.main' }} />
            </ListItemIcon>
            <Typography>Dictado para personas ciegas</Typography>
            <Switch
              checked={dictationEnabled}
              onChange={() => setDictationEnabled((v) => !v)}
              onClick={(e) => e.stopPropagation()}
              sx={{ ml: 'auto' }}
            />
          </ListItemButton>
        </ListItem>

        {/* Protección contra epilepsia */}
        <ListItem disableGutters>
          <ListItemButton onClick={() => setEpilepsyProtection((v) => !v)}>
            <ListItemIcon>
              <HealthAndSafetyIcon sx={{ color: 'primary.main' }} />
            </ListItemIcon>
            <Typography>Protección contra epilepsia</Typography>
            <Switch
              checked={epilepsyProtection}
              onChange={() => setEpilepsyProtection((v) => !v)}
              onClick={(e) => e.stopPropagation()}
              sx={{ ml: 'auto' }}
            />
          </ListItemButton>
        </ListItem>
      </List>
    </Box>
  );
};
