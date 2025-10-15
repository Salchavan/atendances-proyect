import React, { useMemo } from 'react';
import { Box } from '@mui/material';
import { BarChart, PieChart, LineChart } from '@mui/x-charts';
import type { ChartType, MultiChartData, SeriesKey } from './MultiChart.logic';

type Props = {
  type: ChartType;
  height: number;
  data: MultiChartData;
  activeSeries: Record<SeriesKey, boolean>;
  showBarValueLabels?: boolean;
  showXAxisLabels?: boolean;
  containerWidth?: number;
};

export const MultiChartChart: React.FC<Props> = ({
  type,
  height,
  data,
  activeSeries,
  showBarValueLabels = true,
  showXAxisLabels = true,
  containerWidth = 0,
}) => {
  const barSeries = useMemo(() => {
    const s: any[] = [];
    if (activeSeries.total)
      s.push({ data: data.total, label: 'Total', color: '#ff5b5b' });
    if (activeSeries.justified)
      s.push({
        data: data.justified,
        label: 'Justificadas',
        color: '#ffaf45',
        stack: 'inasistencias',
      });
    if (activeSeries.unjustified)
      s.push({
        data: data.unjustified,
        label: 'Injustificadas',
        color: '#ff6b6b',
        stack: 'inasistencias',
      });
    return s;
  }, [data, activeSeries]);

  // For pie: aggregate totals across the selected date range
  const pieTotals = useMemo(() => {
    const justifiedTotal = (data.justified || []).reduce(
      (acc, v) => acc + (Number(v) || 0),
      0
    );
    const unjustifiedTotal = (data.unjustified || []).reduce(
      (acc, v) => acc + (Number(v) || 0),
      0
    );
    return { justifiedTotal, unjustifiedTotal };
  }, [data.justified, data.unjustified]);

  // Compute pie sizing with minimal left/right padding so the circle uses more width
  const pieSizing = useMemo(() => {
    const effectiveWidth =
      containerWidth && containerWidth > 0 ? containerWidth : 800;
    const verticalPadding = effectiveWidth < 380 ? 8 : 12;
    const leftPad = 4;
    const rightPad = 4;
    const maxByWidth = Math.max(
      20,
      Math.floor((effectiveWidth - leftPad - rightPad) / 2)
    );
    const maxByHeight = Math.max(
      20,
      Math.floor((height - verticalPadding * 2) / 2)
    );
    // Use almost all available space, keep a tiny gap
    const outerRadius = Math.max(20, Math.min(maxByWidth, maxByHeight) - 2);
    const innerRadius = Math.floor(
      outerRadius * (effectiveWidth < 380 ? 0.45 : 0.55)
    );
    return { outerRadius, innerRadius, leftPad, rightPad, verticalPadding };
  }, [containerWidth, height]);

  return (
    <Box sx={{ width: '100%', height: '100%', minHeight: 0 }}>
      {type === 'bar' ? (
        <BarChart
          xAxis={[
            {
              scaleType: 'band',
              data: data.labels,
              disableTicks: !showXAxisLabels,
              valueFormatter: (v: any) => (showXAxisLabels ? String(v) : ''),
            },
          ]}
          series={barSeries}
          height={height}
          barLabel={showBarValueLabels ? 'value' : undefined}
          margin={{ top: 12, right: 12, bottom: 48, left: 12 }}
        />
      ) : type === 'pie' ? (
        <PieChart
          sx={{ maxWidth: '85%' }}
          height={height}
          margin={{
            top: pieSizing.verticalPadding,
            right: pieSizing.rightPad,
            bottom: pieSizing.verticalPadding,
            left: pieSizing.leftPad,
          }}
          series={[
            {
              // Show two slices: Justificadas vs Injustificadas within the selected range
              data: [
                ...(activeSeries.justified
                  ? [
                      {
                        id: 0,
                        label: 'Justificadas',
                        value: pieTotals.justifiedTotal,
                        color: '#ffaf45',
                      },
                    ]
                  : []),
                ...(activeSeries.unjustified
                  ? [
                      {
                        id: 1,
                        label: 'Injustificadas',
                        value: pieTotals.unjustifiedTotal,
                        color: '#ff6b6b',
                      },
                    ]
                  : []),
              ],
              // Adapt radii for small containers
              innerRadius: pieSizing.innerRadius,
              outerRadius: pieSizing.outerRadius,
              paddingAngle: 2,
              // Hide pie labels if too narrow
              valueFormatter: (item: any) =>
                containerWidth < 320 ? '' : String(item.value),
            },
          ]}
        />
      ) : (
        <LineChart
          xAxis={[{ scaleType: 'point', data: data.labels }]}
          series={[
            ...(activeSeries.total
              ? [{ data: data.total, label: 'Total', color: '#ff5b5b' }]
              : []),
            ...(activeSeries.justified
              ? [
                  {
                    data: data.justified,
                    label: 'Justificadas',
                    color: '#ffaf45',
                  },
                ]
              : []),
            ...(activeSeries.unjustified
              ? [
                  {
                    data: data.unjustified,
                    label: 'Injustificadas',
                    color: '#ff6b6b',
                  },
                ]
              : []),
          ]}
          height={height}
          margin={{ top: 12, right: 12, bottom: 48, left: 12 }}
        />
      )}
    </Box>
  );
};

export default MultiChartChart;
