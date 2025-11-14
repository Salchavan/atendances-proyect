import React, { useMemo } from 'react';
import { Box, Typography } from '@mui/material';
import { BarChart, PieChart, LineChart } from '@mui/x-charts';
import type {
  ChartType,
  MultiChartData,
  SeriesKey,
  GenericChartData,
} from './MultiChart.logic';

type Props = {
  type: ChartType;
  height: number;
  data: MultiChartData;
  activeSeries: Record<SeriesKey, boolean>;
  showBarValueLabels?: boolean;
  showXAxisLabels?: boolean;
  containerWidth?: number;
  actionBreakdown?: Record<string, number>;
  genericData?: GenericChartData;
};

export const MultiChartChart: React.FC<Props> = ({
  type,
  height,
  data,
  activeSeries,
  showBarValueLabels = true,
  showXAxisLabels = true,
  containerWidth = 0,
  actionBreakdown,
  genericData,
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
    const availableWidth = Math.max(0, effectiveWidth - leftPad - rightPad);
    const availableHeight = Math.max(0, height - verticalPadding * 2);
    // The pie diameter must fit both width and height; choose the limiting dimension
    const diameter = Math.max(20, Math.min(availableWidth, availableHeight));
    // outerRadius is half the usable diameter, minus a small margin
    const outerRadius = Math.max(20, Math.floor(diameter / 2) - 2);
    const innerRadius = Math.floor(
      outerRadius * (effectiveWidth < 380 ? 0.45 : 0.55)
    );
    return {
      outerRadius: outerRadius / 1.4, // apicamos la division para solucionar temporalmente el problema de que se corte el grafico
      innerRadius: innerRadius / 1.5, // apicamos la division para solucionar temporalmente el problema de que se corte el grafico
      leftPad,
      rightPad,
      verticalPadding,
    };
  }, [containerWidth, height]);

  // calcula antes boxWidth/boxHeight (px) con la lógica que ya uses (containerWidth/height)
  const boxWidth = Math.max(
    160,
    Math.floor((containerWidth || 800) - pieSizing.leftPad - pieSizing.rightPad)
  );
  const boxHeight = Math.max(
    160,
    Math.floor(height - pieSizing.verticalPadding * 2)
  );

  // Prepare pie items (slices) according to genericData, actionBreakdown or activeSeries fallback
  const pieItems = useMemo(() => {
    // try genericData slices first
    const slicesFromGeneric =
      genericData &&
      genericData.series?.find((s) => s.slices && s.slices.length)?.slices;
    if (slicesFromGeneric) return slicesFromGeneric.map((s) => ({ ...s }));

    if (actionBreakdown && Object.keys(actionBreakdown).length) {
      return Object.entries(actionBreakdown).map(([label, value], i) => ({
        id: i,
        label,
        value: Number(value),
        color: [
          '#4caf50',
          '#2196f3',
          '#ff9800',
          '#9c27b0',
          '#f44336',
          '#00bcd4',
        ][i % 6],
      }));
    }

    // fallback to justified/unjustified totals
    const arr: any[] = [];
    if (activeSeries.justified) {
      arr.push({
        id: 'j',
        label: 'Justificadas',
        value: pieTotals.justifiedTotal,
        color: '#ffaf45',
      });
    }
    if (activeSeries.unjustified) {
      arr.push({
        id: 'u',
        label: 'Injustificadas',
        value: pieTotals.unjustifiedTotal,
        color: '#ff6b6b',
      });
    }
    return arr;
  }, [genericData, actionBreakdown, activeSeries, pieTotals]);

  const pieTotalValue = useMemo(
    () => pieItems.reduce((acc, it) => acc + (Number(it.value) || 0), 0),
    [pieItems]
  );

  return (
    <Box
      sx={{ width: '100%', height: '100%', minHeight: 0, overflow: 'visible' }}
    >
      {type === 'bar' ? (
        <BarChart
          xAxis={[
            {
              scaleType: 'band',
              data: genericData?.labels ?? data.labels,
              disableTicks: !showXAxisLabels,
              valueFormatter: (v: any) => (showXAxisLabels ? String(v) : ''),
            },
          ]}
          series={
            genericData && genericData.series.length
              ? genericData.series.map((s) => ({
                  data: s.data ?? [],
                  label: s.label ?? String(s.id ?? ''),
                  color: s.color,
                }))
              : barSeries
          }
          height={height}
          barLabel={showBarValueLabels ? 'value' : undefined}
          margin={{ top: 12, right: 12, bottom: 48, left: 12 }}
        />
      ) : type === 'pie' ? (
        pieTotalValue <= 0 ? (
          <Box
            sx={{
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Typography color='text.secondary'>No data to display</Typography>
          </Box>
        ) : (
          <PieChart
            sx={{
              width: `${boxWidth}px`,
              '& svg': {
                width: '100% !important',
                height: '100% !important',
                display: 'block',
              },
            }}
            height={boxHeight}
            margin={{
              top: pieSizing.verticalPadding,
              right: pieSizing.rightPad,
              bottom: pieSizing.verticalPadding,
              left: pieSizing.leftPad,
            }}
            series={[
              {
                data: pieItems.map((sl) => ({
                  id: sl.id,
                  label: sl.label,
                  value: sl.value,
                  color: sl.color,
                })),
                innerRadius: pieSizing.innerRadius,
                outerRadius: pieSizing.outerRadius,
                paddingAngle: 2,
                valueFormatter: (item: any) =>
                  containerWidth < 320 ? '' : String(item.value),
              },
            ]}
          />
        )
      ) : (
        <LineChart
          xAxis={[
            { scaleType: 'point', data: genericData?.labels ?? data.labels },
          ]}
          series={
            genericData && genericData.series.length
              ? genericData.series.map((s) => ({
                  data: s.data ?? [],
                  label: s.label ?? String(s.id ?? ''),
                  color: s.color,
                }))
              : [
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
                ]
          }
          height={height}
          margin={{ top: 12, right: 12, bottom: 48, left: 12 }}
        />
      )}
    </Box>
  );
};

export default MultiChartChart;
