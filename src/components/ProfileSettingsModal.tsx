import { useMemo } from 'react';
import {
  Avatar,
  Box,
  Button,
  Divider,
  List,
  ListItem,
  ListItemAvatar,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import QueryStatsIcon from '@mui/icons-material/QueryStats';
import { useStore } from '../store/Store.ts';

export const ProfileSettingsModal = () => {
  const selectedUser = useStore((s) => s.perfilUserSelected) as
    | { firstName?: string; lastName?: string; Username?: string }
    | undefined;

  const displayName = useMemo(() => {
    const full = [selectedUser?.firstName, selectedUser?.lastName]
      .filter(Boolean)
      .join(' ');
    return full || selectedUser?.Username || 'Usuario';
  }, [selectedUser]);

  const initials = useMemo(() => {
    const parts = displayName.trim().split(/\s+/);
    return parts
      .slice(0, 2)
      .map((p) => p[0])
      .join('')
      .toUpperCase();
  }, [displayName]);

  return (
    <Box sx={{ p: 2, height: '100%', boxSizing: 'border-box' }}>
      <List>
        <ListItem disableGutters>
          <ListItemAvatar>
            <Avatar sx={{ width: 48, height: 48 }}>{initials}</Avatar>
          </ListItemAvatar>
          <ListItemText
            primary={`Foto de perfil de ${displayName}`}
            secondary='Vista previa de la foto actual'
          />
          <Button startIcon={<PhotoCameraIcon />} disabled>
            Cambiar foto
          </Button>
        </ListItem>

        <Divider sx={{ my: 1 }} />

        <ListItem disableGutters>
          <ListItemButton disabled>
            <ListItemIcon>
              <QueryStatsIcon color='primary' />
            </ListItemIcon>
            <ListItemText
              primary='Ver actividad del preceptor completa'
              secondary='Abrir vista detallada de actividad'
            />
          </ListItemButton>
        </ListItem>
      </List>
    </Box>
  );
};
