import { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  IconButton,
  Menu,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import BuildIcon from '@mui/icons-material/Build';
import LocationSearchingIcon from '@mui/icons-material/LocationSearching';
import { changePageTitle } from '../../Logic';
import {
  getStats,
  getStatsOptions,
  getStatsRankings,
  type StatsRankingParams,
  type StatsTarget,
} from '../../api/client';

type ActionType =
  | 'compare'
  | 'ranking'
  | 'timeseries'
  | 'intervals'
  | 'improvements';

const targetLabels: Record<StatsTarget['type'], string> = {
  STUDENT: 'Estudiante',
  CLASSROOM: 'Curso',
  YEAR: 'Año',
  SHIFT: 'Turno',
};

const targetInputLabels: Record<StatsTarget['type'], string> = {
  STUDENT: 'ID del estudiante',
  CLASSROOM: 'ID del curso',
  YEAR: 'Número de año (1..7)',
  SHIFT: 'Turno (MORNING/AFTERNOON/EVENING)',
};

const actionMetadata: Record<
  Exclude<ActionType, 'ranking'>,
  {
    title: string;
    endpoint: string;
    description: string;
  }
> = {
  compare: {
    title: 'Comparar targets',
    endpoint: 'POST /api/v1/stats/compare',
    description:
      'Contrasta aulas, estudiantes, turnos o años en una sola consulta. Selecciona al menos dos targets para ver diferencias en asistencia y ausencias.',
  },
  timeseries: {
    title: 'Evolución en el tiempo',
    endpoint: 'GET /api/v1/stats/timeseries',
    description:
      'Grafica la métrica elegida por día, semana o mes para detectar tendencias y caídas puntuales.',
  },
  intervals: {
    title: 'Análisis por intervalos',
    endpoint: 'GET /api/v1/stats/intervals',
    description:
      'Visualiza la asistencia por día de la semana u otro intervalo discreto para encontrar patrones de ausentismo.',
  },
  improvements: {
    title: 'Mejoras recientes',
    endpoint: 'GET /api/v1/stats/improvements',
    description:
      'Destaca las entidades con mayor mejora en la métrica seleccionada durante una ventana temporal.',
  },
};

const defaultMetrics = ['attendancePct', 'absent', 'present', 'late'];

const buildTargetFromInput = (
  type: StatsTarget['type'],
  rawValue: string
): StatsTarget | null => {
  const trimmed = rawValue.trim();
  if (!trimmed) return null;
  if (type === 'SHIFT') {
    return { type, value: trimmed.toUpperCase() };
  }
  if (type === 'YEAR') {
    const year = Number(trimmed);
    if (!Number.isInteger(year) || year <= 0) return null;
    return { type, year };
  }
  const id = Number(trimmed);
  if (!Number.isInteger(id) || id <= 0) return null;
  return { type, id };
};

const describeTarget = (target: StatsTarget) => {
  switch (target.type) {
    case 'SHIFT':
      return `Turno ${target.value}`;
    case 'YEAR':
      return `Año ${target.year}`;
    case 'CLASSROOM':
      return `Curso #${target.id}`;
    default:
      return `Estudiante #${target.id}`;
  }
};

const formatPercent = (value?: number | null) => {
  if (value == null) return '--';
  const normalized = value > 1 ? value : value * 100;
  return `${normalized.toFixed(1)}%`;
};

const formatNumber = (value?: number | null) => {
  if (value == null) return '--';
  return new Intl.NumberFormat('es-AR').format(value);
};

export const Statics = () => {
  changePageTitle('Estadisticas');

  const [targetType, setTargetType] =
    useState<StatsTarget['type']>('CLASSROOM');
  const [targetValue, setTargetValue] = useState('');
  const [targetMenuAnchor, setTargetMenuAnchor] = useState<null | HTMLElement>(
    null
  );
  const [appliedTarget, setAppliedTarget] = useState<StatsTarget | null>(null);
  const [targetError, setTargetError] = useState<string | null>(null);
  const [activeAction, setActiveAction] = useState<ActionType>('ranking');
  const [rankingParams, setRankingParams] = useState<StatsRankingParams>({
    scope: 'CLASSROOM',
    metric: 'attendancePct',
    limit: 10,
  });

  const optionsQuery = useQuery({
    queryKey: ['stats-options'],
    queryFn: getStatsOptions,
  });

  const statsQuery = useQuery({
    queryKey: ['stats-query', appliedTarget],
    queryFn: () => (appliedTarget ? getStats(appliedTarget) : null),
    enabled: Boolean(appliedTarget),
  });

  const rankingQuery = useQuery({
    queryKey: ['stats-ranking', rankingParams],
    queryFn: () => getStatsRankings(rankingParams),
  });

  const metrics = statsQuery.data?.metrics ?? null;
  const rankingList = rankingQuery.data?.list ?? [];
  const availableMetrics: string[] =
    (optionsQuery.data?.metrics as string[]) ?? defaultMetrics;

  const handleApplyTarget = () => {
    const parsed = buildTargetFromInput(targetType, targetValue);
    if (!parsed) {
      setTargetError('Ingresa un valor válido para el target seleccionado.');
      return;
    }
    setTargetError(null);
    setAppliedTarget(parsed);
  };

  const renderActionPanel = () => {
    if (activeAction === 'ranking') {
      return (
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          <Typography variant='h6' gutterBottom>
            Ranking por{' '}
            {rankingParams.scope === 'STUDENT' ? 'estudiantes' : 'cursos'}
          </Typography>
          <Stack
            spacing={1}
            direction={{ xs: 'column', sm: 'row' }}
            sx={{ mb: 2 }}
          >
            <TextField
              select
              fullWidth
              label='Scope'
              value={rankingParams.scope}
              onChange={(event) =>
                setRankingParams((prev: StatsRankingParams) => ({
                  ...prev,
                  scope: event.target.value as 'CLASSROOM' | 'STUDENT',
                }))
              }
            >
              <MenuItem value='CLASSROOM'>Aulas</MenuItem>
              <MenuItem value='STUDENT'>Estudiantes</MenuItem>
            </TextField>
            <TextField
              select
              fullWidth
              label='Métrica'
              value={rankingParams.metric}
              onChange={(event) =>
                setRankingParams((prev: StatsRankingParams) => ({
                  ...prev,
                  metric: event.target.value,
                }))
              }
            >
              {availableMetrics.map((metric) => (
                <MenuItem key={metric} value={metric}>
                  {metric}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              type='number'
              fullWidth
              label='Limite'
              inputProps={{ min: 1, max: 25 }}
              value={rankingParams.limit ?? 10}
              onChange={(event) =>
                setRankingParams((prev: StatsRankingParams) => ({
                  ...prev,
                  limit: Number(event.target.value) || 10,
                }))
              }
            />
          </Stack>
          <Box sx={{ flex: 1, minHeight: 0, overflowY: 'auto' }}>
            {rankingQuery.isLoading ? (
              <Stack
                alignItems='center'
                justifyContent='center'
                sx={{ height: '100%' }}
              >
                <CircularProgress size={32} />
                <Typography variant='body2' sx={{ mt: 1 }}>
                  Buscando ranking...
                </Typography>
              </Stack>
            ) : rankingList.length ? (
              <Stack spacing={1}>
                {rankingList.map((entry: any, index: number) => (
                  <Paper
                    key={`${entry.classroomId ?? entry.studentId ?? index}`}
                    variant='outlined'
                    sx={{ p: 1.25 }}
                  >
                    <Typography variant='subtitle2'>
                      {index + 1}.{' '}
                      {entry.key ??
                        `ID ${entry.classroomId ?? entry.studentId}`}
                    </Typography>
                    <Typography variant='body2' color='text.secondary'>
                      Asistencia: {formatPercent(entry.attendancePct)} ·
                      Ausencias: {formatNumber(entry.absent)}
                    </Typography>
                    <Typography variant='caption' color='text.secondary'>
                      Presentes: {formatNumber(entry.present)} · Tardanzas:{' '}
                      {formatNumber(entry.events?.late)}
                    </Typography>
                  </Paper>
                ))}
              </Stack>
            ) : (
              <Typography variant='body2' color='text.secondary'>
                No encontramos datos para los filtros actuales.
              </Typography>
            )}
          </Box>
        </Box>
      );
    }

    const metadata =
      actionMetadata[activeAction as Exclude<ActionType, 'ranking'>];
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <Typography variant='h6' gutterBottom>
          {metadata.title}
        </Typography>
        <Typography variant='body2' color='text.secondary'>
          {metadata.description}
        </Typography>
        <Paper
          variant='outlined'
          sx={{
            mt: 2,
            p: 2,
            fontFamily: 'monospace',
            fontSize: 13,
            whiteSpace: 'pre-wrap',
          }}
        >
          {metadata.endpoint}
        </Paper>
        <Typography variant='body2' color='text.secondary' sx={{ mt: 2 }}>
          Próximamente integraremos formularios para lanzar estas consultas sin
          salir de la página.
        </Typography>
      </Box>
    );
  };

  return (
    <Box
      className='col-span-8 row-span-9 grid grid-cols-20 grid-rows-9 gap-2'
      sx={{ minWidth: 0 }}
    >
      <Box className='col-span-1 col-start-20 row-span-9 row-start-1'>
        <Paper
          elevation={1}
          sx={{
            height: '100%',
            p: 2,
            display: 'flex',
            flexDirection: 'column',
            gap: 1.5,
            alignItems: 'center',
          }}
        >
          <IconButton aria-label='Localizar' size='medium'>
            <LocationSearchingIcon fontSize='medium' />
          </IconButton>
          <IconButton aria-label='Descargar' size='medium'>
            <FileDownloadIcon fontSize='medium' />
          </IconButton>
          <IconButton aria-label='Herramientas' size='medium'>
            <BuildIcon fontSize='medium' />
          </IconButton>
        </Paper>
      </Box>

      <Box
        className='col-span-19 col-start-1 row-span-9 row-start-1 grid grid-cols-3 gap-2'
        sx={{ minWidth: 0 }}
      >
        <Box className='col-span-2 col-start-1 row-span-1 row-start-1 grid grid-rows-3 gap-2'>
          <Paper sx={{ p: 2 }}>
            <Stack spacing={1.5}>
              <Typography variant='subtitle1'>Target de análisis</Typography>
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={1}>
                <Button
                  variant='outlined'
                  onClick={(event) => setTargetMenuAnchor(event.currentTarget)}
                >
                  Scope: {targetLabels[targetType]}
                </Button>
                <Menu
                  anchorEl={targetMenuAnchor}
                  open={Boolean(targetMenuAnchor)}
                  onClose={() => setTargetMenuAnchor(null)}
                >
                  {(
                    Object.keys(targetLabels) as Array<StatsTarget['type']>
                  ).map((type) => (
                    <MenuItem
                      key={type}
                      onClick={() => {
                        setTargetType(type);
                        setTargetMenuAnchor(null);
                      }}
                    >
                      {targetLabels[type]}
                    </MenuItem>
                  ))}
                </Menu>
                <TextField
                  fullWidth
                  label={targetInputLabels[targetType]}
                  value={targetValue}
                  onChange={(event) => setTargetValue(event.target.value)}
                />
                <Button variant='contained' onClick={handleApplyTarget}>
                  Consultar
                </Button>
              </Stack>
              {targetError ? (
                <Typography variant='body2' color='error'>
                  {targetError}
                </Typography>
              ) : null}
              {appliedTarget ? (
                <Chip
                  size='small'
                  color='primary'
                  label={`Target: ${describeTarget(appliedTarget)}`}
                />
              ) : (
                <Typography variant='body2' color='text.secondary'>
                  Selecciona un target para ver métricas reales.
                </Typography>
              )}
            </Stack>
          </Paper>

          <Box className='row-span-1 grid grid-cols-3 gap-2'>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant='overline' color='text.secondary'>
                  Asistencia
                </Typography>
                <Typography variant='h4' fontWeight={600}>
                  {formatPercent(metrics?.attendancePct ?? null)}
                </Typography>
                <Typography variant='body2' color='text.secondary'>
                  Porcentaje en el periodo seleccionado
                </Typography>
              </CardContent>
            </Card>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant='overline' color='text.secondary'>
                  Ausencias totales
                </Typography>
                <Typography variant='h4' color='error.main' fontWeight={600}>
                  {formatNumber(metrics?.absent)}
                </Typography>
                <Typography variant='body2' color='text.secondary'>
                  Incluye justificadas y no justificadas
                </Typography>
              </CardContent>
            </Card>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant='overline' color='text.secondary'>
                  Presentes
                </Typography>
                <Typography variant='h4' fontWeight={600}>
                  {formatNumber(metrics?.present)}
                </Typography>
                <Typography variant='body2' color='text.secondary'>
                  Total de asistencias registradas
                </Typography>
              </CardContent>
            </Card>
          </Box>

          <Paper
            elevation={0}
            sx={{
              p: 3,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: 180,
              border: '1px dashed var(--mui-palette-divider)',
            }}
          >
            <Typography variant='body2' color='text.secondary' align='center'>
              El gráfico se habilitará cuando la serie temporal esté lista.
              Mientras tanto, configura tu target y usa las acciones para
              explorar la información.
            </Typography>
          </Paper>
        </Box>

        <Box className='col-span-1 col-start-3 row-span-1 row-start-1 gap-2'>
          <Stack spacing={2} sx={{ height: '100%' }}>
            <Paper sx={{ p: 2 }}>
              <Typography variant='subtitle1' gutterBottom>
                Acciones disponibles
              </Typography>
              <Stack spacing={1}>
                {(
                  [
                    'compare',
                    'ranking',
                    'timeseries',
                    'intervals',
                    'improvements',
                  ] as ActionType[]
                ).map((action) => (
                  <Button
                    key={action}
                    variant={activeAction === action ? 'contained' : 'outlined'}
                    onClick={() => setActiveAction(action)}
                    fullWidth
                  >
                    {action === 'ranking'
                      ? 'Ver ranking'
                      : actionMetadata[action as Exclude<ActionType, 'ranking'>]
                          .title}
                  </Button>
                ))}
              </Stack>
            </Paper>
            <Paper sx={{ p: 2, flex: 1, minHeight: 0 }}>
              {renderActionPanel()}
            </Paper>
          </Stack>
        </Box>
      </Box>
    </Box>
  );
};
