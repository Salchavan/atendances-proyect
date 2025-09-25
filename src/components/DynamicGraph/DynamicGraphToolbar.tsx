import React from 'react';
import {
  List,
  ListItem,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
} from '@mui/material';
import { DateRangePicker } from 'rsuite';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import { ErrorBoundary } from 'react-error-boundary';

interface ToolbarProps {
  listRef: React.RefObject<HTMLUListElement | null>;
  range: [Date, Date] | null;
  predefinedRanges: any[];
  onRangeChange: (value: any) => void;
  onRangeOk: (value: any) => void;
  onRangeClean: () => void;
  graphMode: 'each' | 'prom';
  setGraphMode: (m: 'each' | 'prom') => void;
  partitionMode: 'Day' | 'Week' | 'Month' | 'Year';
  setPartitionMode: (m: 'Day' | 'Week' | 'Month' | 'Year') => void;
  partitionEnabled: Record<'Day' | 'Week' | 'Month' | 'Year', boolean>;
}

export const DynamicGraphToolbar: React.FC<ToolbarProps> = ({
  listRef,
  range,
  predefinedRanges,
  onRangeChange,
  onRangeOk,
  onRangeClean,
  graphMode,
  setGraphMode,
  partitionMode,
  setPartitionMode,
  partitionEnabled,
}) => {
  return (
    <ErrorBoundary fallback={<div>Error loading chart.</div>}>
      <List
        dense
        ref={listRef as any}
        className='bg-acento/40 rounded-lg flex flex-row items-center p-1 mb-1'
      >
        <ListItem disableGutters sx={{ py: 0, px: 1 }}>
          <DateRangePicker
            format='dd / MM / yyyy'
            placeholder='Seleccionar rango'
            showHeader={false}
            ranges={predefinedRanges as any}
            caretAs={CalendarMonthIcon}
            size='sm'
            value={range as any}
            onChange={onRangeChange}
            onOk={onRangeOk}
            onClean={onRangeClean}
          />
        </ListItem>
        <ListItem disableGutters sx={{ py: 0, px: 1 }}>
          <FormControl size='small'>
            <InputLabel id='graph-mode-label'>Modo</InputLabel>
            <Select
              size='small'
              value={graphMode}
              onChange={(e) => setGraphMode(e.target.value as 'each' | 'prom')}
              label='Modo'
              className='bg-white/50 rounded-xl'
              inputProps={{ 'aria-label': 'graph-mode' }}
            >
              <MenuItem value='each'>Cada uno</MenuItem>
              <MenuItem value='prom'>Promedio</MenuItem>
            </Select>
          </FormControl>
        </ListItem>
        {graphMode === 'prom' && (
          <ListItem disableGutters sx={{ py: 0, px: 1 }}>
            <FormControl size='small'>
              <InputLabel id='partition-mode-label'>Partición</InputLabel>
              <Select
                size='small'
                value={partitionMode}
                onChange={(e) =>
                  setPartitionMode(
                    e.target.value as 'Day' | 'Week' | 'Month' | 'Year'
                  )
                }
                label='Partición'
                className='bg-white/50 rounded-xl'
                inputProps={{ 'aria-label': 'partition-mode' }}
              >
                {(['Day', 'Week', 'Month', 'Year'] as const).map((opt) => (
                  <MenuItem
                    key={opt}
                    value={opt}
                    disabled={!partitionEnabled[opt]}
                  >
                    {opt === 'Day' && 'Por Día'}
                    {opt === 'Week' && 'Por Semana'}
                    {opt === 'Month' && 'Por Mes'}
                    {opt === 'Year' && 'Por Año'}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </ListItem>
        )}
      </List>
    </ErrorBoundary>
  );
};
