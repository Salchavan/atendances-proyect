import React from 'react';
import { BarChart } from '@mui/x-charts';

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
  onClickEach,
  onClickPartitioned,
}) => {
  const isEach = mode === 'each';
  const xData = isEach ? displayDates : partitioned?.labels || [];
  const series = isEach
    ? [
        { data: totals, color: '#ff5b5b', label: 'Total' },
        {
          data: justified,
          color: '#ffaf45',
          label: 'Justificadas',
          stack: 'total',
        },
        {
          data: unjustified,
          color: '#ff6b6b',
          label: 'Injustificadas',
          stack: 'total',
        },
      ]
    : [
        {
          data: partitioned?.totals || [],
          color: '#ff5b5b',
          label: 'Prom. Total',
        },
        {
          data: partitioned?.justs || [],
          color: '#ffaf45',
          label: 'Prom. Justificadas',
          stack: 'total',
        },
        {
          data: partitioned?.unjs || [],
          color: '#ff6b6b',
          label: 'Prom. Injustificadas',
          stack: 'total',
        },
      ];

  const handleContainerClick = () => {
    if (isEach) onClickEach();
    else onClickPartitioned();
  };

  return (
    <div className='w-full h-full' onClick={handleContainerClick}>
      <BarChart
        xAxis={[{ scaleType: 'band', data: xData }]}
        series={series}
        height={height}
        barLabel='value'
      />
    </div>
  );
};
