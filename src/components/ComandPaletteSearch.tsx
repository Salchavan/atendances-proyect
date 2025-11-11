import { useState, useEffect, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  TextField,
  List,
  ListItem,
  ListItemButton,
  Box,
  Typography,
  Chip,
  Divider,
} from '@mui/material';
import {
  Search,
  Settings,
  Analytics,
  Book,
  School,
  Home,
} from '@mui/icons-material';

import { useNavigateTo } from '../Logic.ts';

// Tipos TypeScript
interface Command {
  id: string;
  name: string;
  category: string;
  icon: any;
  action: () => void;
  keywords?: string[];
}

export const CommandK = () => {
  const navigate = useNavigateTo();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Comandos disponibles
  const commands: Command[] = [
    {
      id: '1',
      name: 'Home',
      category: 'Sistema',
      icon: <Home />,
      action: () => navigate('home'),
      keywords: ['inicio', 'casa', 'main', 'home'],
    },
    {
      id: '2',
      name: 'Configuración',
      category: 'Sistema',
      icon: <Settings />,
      action: () => navigate('config'),
      keywords: ['settings', 'preferencias'],
    },
    {
      id: '3',
      name: 'Estadisticas',
      category: 'Utilidades',
      icon: <Analytics />,
      action: () => navigate('statics'),
      keywords: ['estadisticas', 'analiticas'],
    },
    {
      id: '4',
      name: 'Cursos',
      category: 'Registros',
      icon: <School />,
      action: () => navigate('classrooms'),
      keywords: ['cursos', 'aulas'],
    },
    {
      id: '5',
      name: 'Registros',
      category: 'Registros',
      icon: <Book />,
      action: () => navigate('config'),
      keywords: ['settings', 'preferencias'],
    },
  ];

  // Filtrar comandos
  const filteredCommands = commands.filter(
    (cmd) =>
      cmd.name.toLowerCase().includes(search.toLowerCase()) ||
      cmd.category.toLowerCase().includes(search.toLowerCase()) ||
      cmd.keywords?.some((keyword) =>
        keyword.toLowerCase().includes(search.toLowerCase())
      )
  );

  // Atajos de teclado
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setOpen(true);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Resetear selección cuando cambia la búsqueda
  useEffect(() => {
    setSelectedIndex(0);
  }, [search]);

  // Navegación con teclado
  useEffect(() => {
    const handleKeyNavigation = (e: KeyboardEvent) => {
      if (!open) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex((prev) =>
            prev < filteredCommands.length - 1 ? prev + 1 : prev
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex((prev) => (prev > 0 ? prev - 1 : prev));
          break;
        case 'Enter':
          e.preventDefault();
          if (filteredCommands[selectedIndex]) {
            filteredCommands[selectedIndex].action();
            setOpen(false);
            setSearch('');
          }
          break;
        case 'Escape':
          setSearch('');
          setOpen(false);
          break;
      }
    };

    document.addEventListener('keydown', handleKeyNavigation);
    return () => document.removeEventListener('keydown', handleKeyNavigation);
  }, [open, selectedIndex, filteredCommands]);

  // Focus al abrir
  useEffect(() => {
    if (open) {
      // Timeout más largo para asegurar que el Dialog esté renderizado
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
          inputRef.current.select();

          // Forzar el foco si no funciona lo anterior
          inputRef.current.setSelectionRange(0, inputRef.current.value.length);
        }
      }, 150); // Aumenta el timeout
    }
  }, [open]);

  const handleCommandSelect = (command: Command) => {
    command.action();
    setOpen(false);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <>
      {/* Trigger Button */}
      <TextField
        placeholder='Buscar comandos (Ctrl+K)'
        onClick={() => setOpen(true)}
        sx={{
          width: 300,
          '& .MuiOutlinedInput-root': {
            cursor: 'pointer',
            backgroundColor: 'background.paper',
          },
          minWidth: 600,
          justifySelf: 'center',
        }}
      />

      {/* Command Palette Dialog */}
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth='md'
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            mt: 10,
            maxHeight: '60vh',
          },
        }}
      >
        <DialogContent sx={{ p: 0 }}>
          {/* Header */}
          <Box sx={{ p: 2, pb: 1 }}>
            <TextField
              fullWidth
              placeholder='Escribe un comando...'
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              inputRef={inputRef}
              InputProps={{
                startAdornment: (
                  <Search sx={{ mr: 1, color: 'text.secondary' }} />
                ),
                endAdornment: (
                  <Chip
                    label='Esc'
                    size='small'
                    variant='outlined'
                    sx={{ fontSize: '0.75rem' }}
                  />
                ),
              }}
              variant='standard'
              sx={{
                '& .MuiInput-underline:before': { display: 'none' },
                '& .MuiInput-underline:after': { display: 'none' },
              }}
            />
          </Box>

          <Divider />

          {/* Lista de comandos */}
          <List sx={{ py: 0, maxHeight: 400, overflow: 'auto' }}>
            {filteredCommands.length > 0 ? (
              filteredCommands.map((command, index) => (
                <ListItem key={command.id} disablePadding>
                  <ListItemButton
                    selected={index === selectedIndex}
                    onClick={() => handleCommandSelect(command)}
                    sx={{
                      py: 1.5,
                      px: 2,
                      '&.Mui-selected': {
                        backgroundColor: 'action.selected',
                      },
                    }}
                  >
                    <Box sx={{ mr: 2, color: 'text.secondary' }}>
                      {command.icon}
                    </Box>

                    <Box sx={{ flex: 1 }}>
                      <Typography variant='body1'>{command.name}</Typography>
                      <Typography variant='caption' color='text.secondary'>
                        {command.category}
                      </Typography>
                    </Box>

                    <Chip
                      label='Enter'
                      size='small'
                      variant='outlined'
                      sx={{ fontSize: '0.7rem' }}
                    />
                  </ListItemButton>
                </ListItem>
              ))
            ) : (
              <ListItem>
                <Typography
                  color='text.secondary'
                  sx={{ py: 2, textAlign: 'center', width: '100%' }}
                >
                  No se encontraron comandos
                </Typography>
              </ListItem>
            )}
          </List>

          {/* Footer */}
          <Box
            sx={{
              p: 1,
              backgroundColor: 'background.paper',
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '0.75rem',
              color: 'text.secondary',
            }}
          >
            <span>↑↓ para navegar</span>
            <span>Enter para seleccionar</span>
            <span>Esc para cerrar</span>
          </Box>
        </DialogContent>
      </Dialog>
    </>
  );
};

// Hook personalizado para usar en otros componentes
export const useCommandPalette = () => {
  const [open, setOpen] = useState(false);

  const openPalette = () => setOpen(true);
  const closePalette = () => setOpen(false);

  return { open, openPalette, closePalette };
};
