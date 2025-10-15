import React from 'react';
import {
  Box,
  IconButton,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
  Stack,
  Tooltip,
  Paper,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Checkbox,
} from '@mui/material';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import BarChartIcon from '@mui/icons-material/BarChart';
import PieChartIcon from '@mui/icons-material/PieChart';
import TuneIcon from '@mui/icons-material/Tune';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import type { ChartType, SeriesKey } from './MultiChart.logic';

type Props = {
  title?: string;
  compact?: boolean;
  selectedRange: [Date | null, Date | null];
  onRangeChange: (r: [Date | null, Date | null]) => void;
  chartType: ChartType;
  onSetChartType: (t: ChartType) => void;
  activeSeries: Record<SeriesKey, boolean>;
  onToggleSeries: (k: SeriesKey) => void;
  onOpenFullscreen: () => void;
  fullscreenLabel?: string;
  disabledControls?: Partial<{
    date: boolean;
    chartType: boolean;
    series: boolean;
    fullscreen: boolean;
  }>;
};

export const MultiChartToolbar: React.FC<Props> = ({
  title,
  compact,
  selectedRange,
  onRangeChange,
  chartType,
  onSetChartType,
  activeSeries,
  onToggleSeries,
  onOpenFullscreen,
  fullscreenLabel = 'Pantalla completa',
  disabledControls,
}) => {
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const [width, setWidth] = React.useState<number>(0);
  React.useEffect(() => {
    if (!containerRef.current) return;
    const el = containerRef.current;
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setWidth(Math.floor(entry.contentRect.width));
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [containerRef.current]);

  const collapse = !compact && width > 0 && width < 720; // simple heuristic

  // Series submenu (only when not collapsed)
  const [seriesAnchor, setSeriesAnchor] = React.useState<null | HTMLElement>(
    null
  );
  const openSeriesMenu = (e: React.MouseEvent<HTMLElement>) =>
    setSeriesAnchor(e.currentTarget);
  const closeSeriesMenu = () => setSeriesAnchor(null);

  // Collapsed master menu
  const [collapsedAnchor, setCollapsedAnchor] =
    React.useState<null | HTMLElement>(null);
  const openCollapsedMenu = (e: React.MouseEvent<HTMLElement>) =>
    setCollapsedAnchor(e.currentTarget);
  const closeCollapsedMenu = () => setCollapsedAnchor(null);
  return (
    <Paper
      elevation={1}
      sx={{ p: compact ? 1 : 1.5, bgcolor: 'background.paper' }}
    >
      <Box
        ref={containerRef}
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          flexWrap: 'wrap',
        }}
      >
        {collapse ? (
          <>
            {!!title && (
              <Typography variant={compact ? 'subtitle1' : 'h6'} sx={{ mr: 1 }}>
                {title}
              </Typography>
            )}
            <Box sx={{ flex: 1 }} />
            <Tooltip title='Opciones'>
              <span>
                <IconButton size='small' onClick={openCollapsedMenu}>
                  <MoreHorizIcon fontSize='small' />
                </IconButton>
              </span>
            </Tooltip>
            <Menu
              anchorEl={collapsedAnchor}
              open={Boolean(collapsedAnchor)}
              onClose={closeCollapsedMenu}
              MenuListProps={{ dense: true }}
            >
              {/* Date range */}
              <Box sx={{ px: 1.5, py: 1 }}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <Stack direction='row' spacing={1} alignItems='center'>
                    <DatePicker
                      label='Inicio'
                      value={selectedRange[0]}
                      onChange={(newValue) =>
                        onRangeChange([newValue, selectedRange[1]])
                      }
                      disabled={disabledControls?.date}
                      slotProps={{ textField: { size: 'small' } }}
                    />
                    <DatePicker
                      label='Fin'
                      value={selectedRange[1]}
                      onChange={(newValue) =>
                        onRangeChange([selectedRange[0], newValue])
                      }
                      disabled={disabledControls?.date}
                      slotProps={{ textField: { size: 'small' } }}
                    />
                  </Stack>
                </LocalizationProvider>
              </Box>

              {/* Chart type */}
              <MenuItem disableRipple disableGutters sx={{ px: 1.5 }}>
                <ToggleButtonGroup exclusive size='small' value={chartType}>
                  <ToggleButton
                    value='bar'
                    onClick={() => onSetChartType('bar')}
                    disabled={disabledControls?.chartType}
                  >
                    <Tooltip title='Barras'>
                      <BarChartIcon fontSize='small' />
                    </Tooltip>
                  </ToggleButton>
                  <ToggleButton
                    value='pie'
                    onClick={() => onSetChartType('pie')}
                    disabled={disabledControls?.chartType}
                  >
                    <Tooltip title='Torta'>
                      <PieChartIcon fontSize='small' />
                    </Tooltip>
                  </ToggleButton>
                  <ToggleButton
                    value='line'
                    onClick={() => onSetChartType('line')}
                    disabled={disabledControls?.chartType}
                  >
                    <Tooltip title='Líneas'>
                      <span
                        style={{
                          width: 16,
                          height: 16,
                          display: 'inline-block',
                          borderBottom: '2px solid currentColor',
                        }}
                      />
                    </Tooltip>
                  </ToggleButton>
                </ToggleButtonGroup>
              </MenuItem>

              {/* Series */}
              <MenuItem
                onClick={() => onToggleSeries('total')}
                disabled={disabledControls?.series}
              >
                <ListItemIcon>
                  <Checkbox
                    size='small'
                    edge='start'
                    checked={activeSeries.total}
                    tabIndex={-1}
                    disableRipple
                  />
                </ListItemIcon>
                <ListItemText primary='Total' />
              </MenuItem>
              <MenuItem
                onClick={() => onToggleSeries('justified')}
                disabled={disabledControls?.series}
              >
                <ListItemIcon>
                  <Checkbox
                    size='small'
                    edge='start'
                    checked={activeSeries.justified}
                    tabIndex={-1}
                    disableRipple
                  />
                </ListItemIcon>
                <ListItemText primary='Justificadas' />
              </MenuItem>
              <MenuItem
                onClick={() => onToggleSeries('unjustified')}
                disabled={disabledControls?.series}
              >
                <ListItemIcon>
                  <Checkbox
                    size='small'
                    edge='start'
                    checked={activeSeries.unjustified}
                    tabIndex={-1}
                    disableRipple
                  />
                </ListItemIcon>
                <ListItemText primary='Injustificadas' />
              </MenuItem>

              {/* Fullscreen */}
              <MenuItem
                onClick={() => {
                  closeCollapsedMenu();
                  if (!disabledControls?.fullscreen) onOpenFullscreen();
                }}
              >
                <ListItemIcon>
                  <FullscreenIcon fontSize='small' />
                </ListItemIcon>
                <ListItemText primary={fullscreenLabel} />
              </MenuItem>
            </Menu>
          </>
        ) : (
          <>
            {!!title && (
              <Typography variant={compact ? 'subtitle1' : 'h6'} sx={{ mr: 1 }}>
                {title}
              </Typography>
            )}

            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <Stack direction='row' spacing={1} alignItems='center'>
                <DatePicker
                  label='Inicio'
                  value={selectedRange[0]}
                  onChange={(newValue) =>
                    onRangeChange([newValue, selectedRange[1]])
                  }
                  disabled={disabledControls?.date}
                  slotProps={{ textField: { size: 'small' } }}
                />
                <DatePicker
                  label='Fin'
                  value={selectedRange[1]}
                  onChange={(newValue) =>
                    onRangeChange([selectedRange[0], newValue])
                  }
                  disabled={disabledControls?.date}
                  slotProps={{ textField: { size: 'small' } }}
                />
              </Stack>
            </LocalizationProvider>

            <Stack direction='row' spacing={1} alignItems='center'>
              <ToggleButtonGroup exclusive size='small' value={chartType}>
                <ToggleButton
                  value='bar'
                  onClick={() => onSetChartType('bar')}
                  disabled={disabledControls?.chartType}
                >
                  <Tooltip title='Barras'>
                    <BarChartIcon fontSize='small' />
                  </Tooltip>
                </ToggleButton>
                <ToggleButton
                  value='pie'
                  onClick={() => onSetChartType('pie')}
                  disabled={disabledControls?.chartType}
                >
                  <Tooltip title='Torta'>
                    <PieChartIcon fontSize='small' />
                  </Tooltip>
                </ToggleButton>
                <ToggleButton
                  value='line'
                  onClick={() => onSetChartType('line')}
                  disabled={disabledControls?.chartType}
                >
                  <Tooltip title='Líneas'>
                    <span
                      style={{
                        width: 16,
                        height: 16,
                        display: 'inline-block',
                        borderBottom: '2px solid currentColor',
                      }}
                    />
                  </Tooltip>
                </ToggleButton>
              </ToggleButtonGroup>
            </Stack>

            <Box>
              <Tooltip title='Series'>
                <span>
                  <IconButton
                    size='small'
                    onClick={openSeriesMenu}
                    disabled={disabledControls?.series}
                  >
                    <TuneIcon fontSize='small' />
                  </IconButton>
                </span>
              </Tooltip>
              <Menu
                anchorEl={seriesAnchor}
                open={Boolean(seriesAnchor)}
                onClose={closeSeriesMenu}
              >
                <MenuItem
                  onClick={() => onToggleSeries('total')}
                  disabled={disabledControls?.series}
                >
                  <ListItemIcon>
                    <Checkbox
                      size='small'
                      edge='start'
                      checked={activeSeries.total}
                      tabIndex={-1}
                      disableRipple
                    />
                  </ListItemIcon>
                  <ListItemText primary='Total' />
                </MenuItem>
                <MenuItem
                  onClick={() => onToggleSeries('justified')}
                  disabled={disabledControls?.series}
                >
                  <ListItemIcon>
                    <Checkbox
                      size='small'
                      edge='start'
                      checked={activeSeries.justified}
                      tabIndex={-1}
                      disableRipple
                    />
                  </ListItemIcon>
                  <ListItemText primary='Justificadas' />
                </MenuItem>
                <MenuItem
                  onClick={() => onToggleSeries('unjustified')}
                  disabled={disabledControls?.series}
                >
                  <ListItemIcon>
                    <Checkbox
                      size='small'
                      edge='start'
                      checked={activeSeries.unjustified}
                      tabIndex={-1}
                      disableRipple
                    />
                  </ListItemIcon>
                  <ListItemText primary='Injustificadas' />
                </MenuItem>
              </Menu>
            </Box>

            <Box sx={{ flex: 1 }} />
            <Tooltip title={fullscreenLabel}>
              <IconButton
                size='small'
                onClick={onOpenFullscreen}
                disabled={disabledControls?.fullscreen}
              >
                <FullscreenIcon fontSize='small' />
              </IconButton>
            </Tooltip>
          </>
        )}
      </Box>
    </Paper>
  );
};

export default MultiChartToolbar;
