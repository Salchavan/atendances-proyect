import React from 'react';
import { BarChart } from '@mui/x-charts';
import { Box } from '@mui/material';
import { ErrorBoundary } from 'react-error-boundary';

type PartitionedData = {
  labels: string[];
  totals: number[];
  justs: number[];
  unjs: number[];
} | null;

interface ChartProps {
  height: number;
  mode: 'each' | 'prom';
  displayDates: string[];
  totals: number[];
  justified: number[];
  unjustified: number[];
  partitioned: PartitionedData;
  // When false, clicking the chart does nothing (used to disable opening DataTable)
  clickEnabled?: boolean;
  onClickEach: () => void;
  onClickPartitioned: () => void;
}

// Use default X-Charts palette (original colors)

export const DynamicGraphChart: React.FC<ChartProps> = ({
  height,
  mode,
  displayDates,
  totals,
  justified,
  unjustified,
  partitioned,
  clickEnabled = true,
  onClickEach,
  onClickPartitioned,
}) => {
  const isEach = mode === 'each';
  const xData = isEach ? displayDates : partitioned?.labels || [];
  const series: import('@mui/x-charts').BarSeries[] = isEach
    ? [
        { data: totals, color: '#ff5b5b', label: 'Total', barLabel: 'value' },
        {
          data: justified,
          color: '#ffaf45',
          label: 'Justificadas',
          stack: 'total',
          barLabel: 'value',
        },
        {
          data: unjustified,
          color: '#ff6b6b',
          label: 'Injustificadas',
          stack: 'total',
          barLabel: 'value',
        },
      ]
    : [
        {
          data: partitioned?.totals || [],
          color: '#ff5b5b',
          label: 'Prom. Total',
          barLabel: 'value',
        },
        {
          data: partitioned?.justs || [],
          color: '#ffaf45',
          label: 'Prom. Justificadas',
          stack: 'total',
          barLabel: 'value',
        },
        {
          data: partitioned?.unjs || [],
          color: '#ff6b6b',
          label: 'Prom. Injustificadas',
          stack: 'total',
          barLabel: 'value',
        },
      ];

  const handleContainerClick = () => {
    if (!clickEnabled) return;
    if (isEach) onClickEach();
    else onClickPartitioned();
  };

  return (
    <ErrorBoundary fallback={<div>Error loading chart.</div>}>
      <Box
        sx={{
          width: '100%',
          height: '100%',
          minHeight: 0,
          cursor: clickEnabled ? 'pointer' : 'default',
        }}
        onClick={handleContainerClick}
      >
        <BarChart
          xAxis={[{ scaleType: 'band', data: xData }]}
          series={series}
          height={height}
          margin={{ top: 12, right: 12, bottom: 48, left: 12 }}
        />
      </Box>
    </ErrorBoundary>
  );
};
