import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import type { ReactNode } from 'react';
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
  ListSubheader,
  CircularProgress,
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
import { useQuery } from '@tanstack/react-query';
import { getStudentsBySearch } from '../api/client';
import { useStore } from '../store/Store';
import type { StudentRec } from '../types/generalTypes';

// Tipos TypeScript
interface Command {
  id: string;
  name: string;
  category: string;
  icon: any;
  action: () => void;
  keywords?: string[];
}

interface StudentResult {
  id: number;
  first_name: string;
  last_name: string;
  username: string;
  classroom_id: number;
  active: boolean;
}

type PaletteOption = {
  kind: 'command' | 'student';
  id: string;
  title: string;
  subtitle?: string;
  icon: ReactNode;
  meta?: ReactNode;
  onSelect: () => void;
};

export const CommandK = () => {
  const navigate = useNavigateTo();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const optionRefs = useRef<(HTMLDivElement | null)[]>([]);
  const setPerfilUserSelected = useStore((s) => s.setPerfilUserSelected);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search.trim());
    }, 700);
    return () => clearTimeout(handler);
  }, [search]);

  const {
    data: studentsData,
    isFetching: studentsLoading,
    isError: studentsError,
  } = useQuery({
    queryKey: ['students-search', debouncedSearch],
    queryFn: () => getStudentsBySearch(debouncedSearch),
    enabled: debouncedSearch.length > 0,
    staleTime: 60_000,
  });

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

  const studentResults: StudentResult[] = studentsData?.students ?? [];

  const handleClosePalette = useCallback(() => {
    setOpen(false);
    setSearch('');
  }, []);

  const handleStudentSelect = useCallback(
    (student: StudentResult) => {
      const mappedStudent: StudentRec = {
        id: student.id,
        dni: student.id,
        first_name: student.first_name ?? '',
        last_name: student.last_name ?? '',
        username: student.username ?? '',
        classroom_id: student.classroom_id,
        classroom: student.classroom_id
          ? String(student.classroom_id)
          : 'Sin aula asignada',
        active: student.active,
        unassistences: [],
      };
      setPerfilUserSelected(mappedStudent);
      navigate('sprofile');
      handleClosePalette();
      console.info('Estudiante seleccionado:', student);
    },
    [navigate, handleClosePalette, setPerfilUserSelected]
  );

  const commandOptions: PaletteOption[] = useMemo(
    () =>
      filteredCommands.map((cmd) => ({
        kind: 'command',
        id: `cmd-${cmd.id}`,
        title: cmd.name,
        subtitle: cmd.category,
        icon: cmd.icon,
        meta: (
          <Chip
            label='Enter'
            size='small'
            variant='outlined'
            sx={{ fontSize: '0.7rem' }}
          />
        ),
        onSelect: () => {
          cmd.action();
          handleClosePalette();
        },
      })),
    [filteredCommands, handleClosePalette]
  );

  const studentOptions: PaletteOption[] = useMemo(
    () =>
      studentResults.map((student) => ({
        kind: 'student',
        id: `student-${student.id}`,
        title: `${student.first_name} ${student.last_name}`,
        subtitle: `Usuario: ${student.username} · Aula ${student.classroom_id}`,
        icon: <School />,
        meta: (
          <Chip
            size='small'
            label={student.active ? 'Activo' : 'Inactivo'}
            color={student.active ? 'success' : 'default'}
          />
        ),
        onSelect: () => handleStudentSelect(student),
      })),
    [studentResults, handleStudentSelect]
  );

  const paletteOptions: PaletteOption[] = useMemo(
    () => [...commandOptions, ...studentOptions],
    [commandOptions, studentOptions]
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

  useEffect(() => {
    if (!paletteOptions.length) {
      setSelectedIndex(0);
      return;
    }
    setSelectedIndex((prev) =>
      prev > paletteOptions.length - 1 ? paletteOptions.length - 1 : prev
    );
  }, [paletteOptions.length]);

  useEffect(() => {
    if (!open) return;
    const container = listRef.current;
    const selectedEl = optionRefs.current[selectedIndex];
    if (!container || !selectedEl) return;
    const optionTop = selectedEl.offsetTop;
    const optionBottom = optionTop + selectedEl.offsetHeight;
    const viewTop = container.scrollTop;
    const viewBottom = viewTop + container.clientHeight;
    if (optionTop < viewTop) {
      container.scrollTop = optionTop;
    } else if (optionBottom > viewBottom) {
      container.scrollTop = optionBottom - container.clientHeight;
    }
  }, [selectedIndex, open]);

  const executeOption = (index: number) => {
    const option = paletteOptions[index];
    if (option) option.onSelect();
  };

  // Navegación con teclado
  useEffect(() => {
    const handleKeyNavigation = (e: KeyboardEvent) => {
      if (!open) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex((prev) =>
            prev < paletteOptions.length - 1 ? prev + 1 : prev
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex((prev) => (prev > 0 ? prev - 1 : prev));
          break;
        case 'Enter':
          e.preventDefault();
          executeOption(selectedIndex);
          break;
        case 'Escape':
          setSearch('');
          setOpen(false);
          break;
      }
    };

    document.addEventListener('keydown', handleKeyNavigation);
    return () => document.removeEventListener('keydown', handleKeyNavigation);
  }, [open, selectedIndex, paletteOptions]);

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

  const handleClose = () => {
    handleClosePalette();
  };

  const handleOptionClick = (index: number) => {
    setSelectedIndex(index);
    executeOption(index);
  };

  const hasCommandMatches = commandOptions.length > 0;
  const hasStudentMatches = studentOptions.length > 0;
  const showEmptyState =
    !hasCommandMatches &&
    !hasStudentMatches &&
    !studentsLoading &&
    debouncedSearch.length > 0;
  const showStudentLoader = studentsLoading && debouncedSearch.length > 0;

  let optionCursor = -1;
  optionRefs.current = [];

  const renderOptionRow = (option: PaletteOption) => {
    optionCursor += 1;
    const optionIndex = optionCursor;
    return (
      <ListItem key={option.id} disablePadding>
        <ListItemButton
          ref={(el) => {
            optionRefs.current[optionIndex] = el;
          }}
          selected={optionIndex === selectedIndex}
          onClick={() => handleOptionClick(optionIndex)}
          sx={{
            py: 1.25,
            px: 2,
            '&.Mui-selected': {
              backgroundColor: 'action.selected',
            },
          }}
        >
          <Box sx={{ mr: 2, color: 'text.secondary' }}>{option.icon}</Box>
          <Box sx={{ flex: 1 }}>
            <Typography variant='body1'>{option.title}</Typography>
            {option.subtitle && (
              <Typography variant='caption' color='text.secondary'>
                {option.subtitle}
              </Typography>
            )}
          </Box>
          {option.meta}
        </ListItemButton>
      </ListItem>
    );
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
          },
        }}
      >
        <DialogContent sx={{ p: 0 }}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              maxHeight: '60vh',
              overflow: 'hidden',
            }}
          >
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

            {/* Lista combinada */}
            <List
              ref={listRef}
              sx={{ py: 0, flex: 1, minHeight: 0, overflowY: 'auto' }}
            >
              {hasCommandMatches && (
                <ListSubheader
                  disableSticky
                  sx={{
                    bgcolor: 'background.paper',
                    color: 'text.secondary',
                    fontWeight: 600,
                  }}
                >
                  Comandos
                </ListSubheader>
              )}
              {commandOptions.map(renderOptionRow)}

              {(hasStudentMatches || showStudentLoader) && (
                <ListSubheader
                  disableSticky
                  sx={{
                    bgcolor: 'background.paper',
                    color: 'text.secondary',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  Estudiantes
                  {studentsLoading && <CircularProgress size={14} />}
                </ListSubheader>
              )}
              {studentOptions.map(renderOptionRow)}

              {studentsError && (
                <ListItem>
                  <Typography color='error.main' sx={{ py: 1.5 }}>
                    Error al buscar estudiantes.
                  </Typography>
                </ListItem>
              )}

              {showStudentLoader && studentOptions.length === 0 && (
                <ListItem>
                  <Box
                    sx={{
                      py: 2,
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 1,
                    }}
                  >
                    <CircularProgress size={20} />
                    <Typography variant='body2' color='text.secondary'>
                      Buscando estudiantes...
                    </Typography>
                  </Box>
                </ListItem>
              )}

              {showEmptyState && (
                <ListItem>
                  <Typography
                    color='text.secondary'
                    sx={{ py: 2, textAlign: 'center', width: '100%' }}
                  >
                    No se encontraron coincidencias.
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
