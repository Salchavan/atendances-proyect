import {
  Box,
  Paper,
  Typography,
  Chip,
  Stack,
  useTheme,
  TextField,
  LinearProgress,
} from '@mui/material';
import {
  DataGrid,
  type GridColDef,
  type GridPaginationModel,
} from '@mui/x-data-grid';
import { useMemo, useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import ChipAcount from '../components/ChipAccount';
import { SafeBoundary } from '../components/SafeBoundary';
import { getLogs } from '../api/client';

type AuditLog = {
  id: number;
  timestamp: string;
  actorType: string | null;
  actorId: number | null;
  action: string;
  entity: string | null;
  entityId: number | null;
  entityExtra: string | null;
  ip: string | null;
  userAgent: string | null;
  before: unknown;
  after: unknown;
  metadata: unknown;
};

type LogsResponse = {
  success?: boolean;
  logs?: AuditLog[];
  total?: number;
  count?: number;
  pagination?: { total?: number } | null;
  meta?: { total?: number } | null;
  totalCount?: number;
};

const PAGE_SIZE = 100;

const formatTimestamp = (value?: string | null) => {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString('es-AR', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
};

const formatTimeLabel = (value?: string | null) => {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleTimeString('es-AR', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
};

export const Log = () => {
  const theme = useTheme();
  const [search, setSearch] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: PAGE_SIZE,
  });

  const normalizedSearch = search.trim();

  const { data, isLoading, isError, isFetching } = useQuery<LogsResponse>({
    queryKey: [
      'audit-logs',
      paginationModel.page,
      paginationModel.pageSize,
      normalizedSearch,
      fromDate,
      toDate,
    ],
    queryFn: () =>
      getLogs({
        page: paginationModel.page + 1,
        pageSize: paginationModel.pageSize,
        search: normalizedSearch || undefined,
        from: fromDate || undefined,
        to: toDate || undefined,
      }),
    staleTime: 60 * 1000,
  });

  const logs: AuditLog[] = data?.logs ?? [];

  const knownRowCount =
    data?.total ??
    data?.count ??
    data?.pagination?.total ??
    data?.meta?.total ??
    data?.totalCount ??
    null;
  const rowCount =
    knownRowCount ??
    paginationModel.page * paginationModel.pageSize + logs.length;

  const filteredLogs = useMemo(() => {
    const normalizedSearchLower = normalizedSearch.toLowerCase();
    const fromTime = fromDate
      ? new Date(`${fromDate}T00:00:00`).getTime()
      : null;
    const toTime = toDate ? new Date(`${toDate}T23:59:59.999`).getTime() : null;

    return logs.filter((log) => {
      const timestamp = new Date(log.timestamp).getTime();
      if (!Number.isNaN(timestamp)) {
        if (fromTime !== null && timestamp < fromTime) return false;
        if (toTime !== null && timestamp > toTime) return false;
      }

      if (!normalizedSearchLower) return true;
      const haystack = [
        log.action,
        log.entity,
        log.entityExtra,
        log.actorType,
        log.ip,
        log.userAgent,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return haystack.includes(normalizedSearchLower);
    });
  }, [logs, normalizedSearch, fromDate, toDate]);

  useEffect(() => {
    setPaginationModel((prev) =>
      prev.page === 0 ? prev : { ...prev, page: 0 }
    );
  }, [search, fromDate, toDate]);

  useEffect(() => {
    if (knownRowCount === null) return;
    const maxPageIndex = Math.max(
      0,
      Math.ceil(knownRowCount / paginationModel.pageSize) - 1
    );
    if (paginationModel.page > maxPageIndex) {
      setPaginationModel((prev) => ({ ...prev, page: maxPageIndex }));
    }
  }, [knownRowCount, paginationModel.page, paginationModel.pageSize]);

  useEffect(() => {
    if (!filteredLogs.length) {
      setSelectedLog(null);
      return;
    }
    if (
      !selectedLog ||
      !filteredLogs.some((log) => log.id === selectedLog.id)
    ) {
      setSelectedLog(filteredLogs[0]);
    }
  }, [filteredLogs, selectedLog]);

  const columns = useMemo<GridColDef[]>(
    () => [
      { field: 'id', headerName: 'ID', width: 80 },
      {
        field: 'action',
        headerName: 'Acción',
        flex: 1,
        minWidth: 120,
      },
      {
        field: 'timeLabel',
        headerName: 'Hora',
        width: 140,
      },
    ],
    []
  );

  const rows = useMemo(
    () =>
      filteredLogs.map((log) => ({
        id: log.id,
        action: log.action,
        timeLabel: formatTimeLabel(log.timestamp),
        raw: log,
      })),
    [filteredLogs]
  );

  const showPageLoading = isFetching && Boolean(data);

  const renderJsonBlock = (value: unknown) => {
    if (value === null || value === undefined) return '—';
    if (typeof value === 'string') return value || '—';
    try {
      return JSON.stringify(value, null, 2);
    } catch {
      return String(value);
    }
  };

  const NoRowsOverlay = () => (
    <Box sx={{ p: 2 }}>
      <Typography color={isError ? 'error' : 'text.secondary'}>
        {isError
          ? 'No se pudieron cargar los registros.'
          : 'No hay registros disponibles.'}
      </Typography>
    </Box>
  );

  const codeBlockStyles = {
    bgcolor: theme.palette.mode === 'dark' ? 'grey.900' : 'grey.100',
    color:
      theme.palette.mode === 'dark'
        ? theme.palette.grey[100]
        : theme.palette.text.primary,
    p: 1,
    borderRadius: 1,
    overflowX: 'auto' as const,
  };

  return (
    <SafeBoundary>
      <Box
        sx={{
          gridColumn: 'span 8',
          gridRow: 'span 9',
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
          gap: 1,
          minWidth: 0,
          minHeight: 0,
          height: '100%',
        }}
      >
        <Paper
          sx={{
            minWidth: 0,
            minHeight: 0,
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <Stack
            direction='row'
            justifyContent='space-between'
            alignItems='center'
            sx={{ px: 2, py: 1 }}
          >
            <Typography variant='h5'>Registros</Typography>
            <Chip
              label={`${rows.length} registros`}
              size='small'
              color='primary'
              variant='outlined'
            />
          </Stack>
          <Stack
            direction={{ xs: 'column', md: 'row' }}
            spacing={1}
            sx={{ px: 2, pb: 1 }}
          >
            <TextField
              label='Buscar'
              placeholder='Acción, entidad, actor...'
              size='small'
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              fullWidth
            />
            <TextField
              label='Desde'
              type='date'
              size='small'
              value={fromDate}
              onChange={(event) => setFromDate(event.target.value)}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
            <TextField
              label='Hasta'
              type='date'
              size='small'
              value={toDate}
              onChange={(event) => setToDate(event.target.value)}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
          </Stack>
          {showPageLoading && <LinearProgress sx={{ mx: 2, mb: 1 }} />}
          <Box sx={{ flex: 1, minHeight: 0 }}>
            <DataGrid
              rows={rows}
              columns={columns}
              loading={isLoading}
              disableColumnMenu
              onRowClick={(params) =>
                setSelectedLog(params.row.raw as AuditLog)
              }
              sx={{
                border: 0,
                height: '100%',
                '& .MuiDataGrid-cell': {
                  cursor: 'pointer',
                },
              }}
              pagination
              paginationModel={paginationModel}
              onPaginationModelChange={(model) =>
                setPaginationModel((prev) =>
                  prev.page === model.page
                    ? prev
                    : { page: model.page, pageSize: PAGE_SIZE }
                )
              }
              paginationMode='server'
              rowCount={rowCount}
              pageSizeOptions={[PAGE_SIZE]}
              slots={{ noRowsOverlay: NoRowsOverlay }}
            />
          </Box>
        </Paper>

        <Paper
          sx={{
            p: 2,
            height: '100%',
            minHeight: 0,
            overflow: 'auto',
            minWidth: 0,
          }}
        >
          <Stack
            direction='row'
            justifyContent='space-between'
            alignItems='center'
          >
            <Typography variant='h4' gutterBottom sx={{ mb: 0 }}>
              Detalle de la operación
            </Typography>
            <Chip
              label={selectedLog?.action ?? 'Sin selección'}
              color='info'
              variant='outlined'
              size='small'
            />
          </Stack>
          <Typography variant='body2' color='text.secondary'>
            {selectedLog
              ? `Registro #${selectedLog.id}`
              : 'Selecciona un registro para ver sus detalles.'}
          </Typography>

          {selectedLog && (
            <Box
              sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 1.5 }}
            >
              <div>
                <Typography variant='subtitle2'>Fecha y hora</Typography>
                <Typography variant='body1'>
                  {formatTimestamp(selectedLog.timestamp)}
                </Typography>
              </div>

              {(selectedLog.entity ||
                selectedLog.entityId ||
                selectedLog.entityExtra) && (
                <div>
                  <Typography variant='subtitle2'>Entidad afectada</Typography>
                  <Typography variant='body1'>
                    {selectedLog.entity ?? '—'} (ID:{' '}
                    {selectedLog.entityId ?? '—'})
                  </Typography>
                  {selectedLog.entityExtra && (
                    <Typography variant='body2' color='text.secondary'>
                      Extra: {selectedLog.entityExtra}
                    </Typography>
                  )}
                </div>
              )}

              {(selectedLog.actorType || selectedLog.actorId) && (
                <div>
                  <Typography variant='subtitle2'>Actor</Typography>
                  <Typography variant='body1'>
                    {selectedLog.actorType ?? '—'} (ID:{' '}
                    {selectedLog.actorId ?? '—'})
                  </Typography>
                </div>
              )}

              {(selectedLog.ip || selectedLog.userAgent) && (
                <div>
                  <Typography variant='subtitle2'>Contexto</Typography>
                  {selectedLog.ip && (
                    <Typography variant='body2' color='text.secondary'>
                      IP: {selectedLog.ip}
                    </Typography>
                  )}
                  {selectedLog.userAgent && (
                    <Typography variant='body2' color='text.secondary'>
                      User agent: {selectedLog.userAgent}
                    </Typography>
                  )}
                </div>
              )}

              {selectedLog.before !== null &&
                selectedLog.before !== undefined && (
                  <div>
                    <Typography variant='subtitle2'>Cambios (antes)</Typography>
                    <Typography component='pre' sx={codeBlockStyles}>
                      {renderJsonBlock(selectedLog.before)}
                    </Typography>
                  </div>
                )}

              {selectedLog.after !== null &&
                selectedLog.after !== undefined && (
                  <div>
                    <Typography variant='subtitle2'>
                      Cambios (después)
                    </Typography>
                    <Typography component='pre' sx={codeBlockStyles}>
                      {renderJsonBlock(selectedLog.after)}
                    </Typography>
                  </div>
                )}

              {selectedLog.metadata !== null &&
                selectedLog.metadata !== undefined && (
                  <div>
                    <Typography variant='subtitle2'>Metadata</Typography>
                    <Typography component='pre' sx={codeBlockStyles}>
                      {renderJsonBlock(selectedLog.metadata)}
                    </Typography>
                  </div>
                )}

              {(selectedLog.actorType || selectedLog.actorId) && (
                <Stack direction='row' spacing={1} alignItems='center'>
                  <Typography variant='subtitle2'>Emitida por:</Typography>
                  <ChipAcount />
                </Stack>
              )}
            </Box>
          )}
        </Paper>
      </Box>
    </SafeBoundary>
  );
};
