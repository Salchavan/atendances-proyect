import { Box, Typography } from '@mui/material';
import { useEffect, useRef, useState } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { useDynamicGraphLogic } from './DynamicGraph.logic.ts';
import { DynamicGraphToolbar } from './DynamicGraphToolbar.tsx';
import { DynamicGraphChart } from './DynamicGraphChart.tsx';
import { SafeBoundary } from '../SafeBoundary';

interface Props {
  graphName: string;
  initialAssignedDate?: Date[] | null;
  grid: string;
  toolbarEnabled?: boolean; // nueva prop para ocultar / desactivar toolbar
  // Si es true, deshabilita abrir DataTable al hacer click en el gráfico
  disableClickToOpenTable?: boolean;
}

export const DynamicGraph = ({
  graphName,
  initialAssignedDate = null,
  grid,
  toolbarEnabled = true,
  disableClickToOpenTable = false,
}: Props) => {
  // Layout con flex: la zona del gráfico ocupa todo el espacio restante.
  const containerRef = useRef<HTMLDivElement | null>(null);
  const toolbarRef = useRef<HTMLUListElement | null>(null);
  const chartAreaRef = useRef<HTMLDivElement | null>(null);
  const [chartHeight, setChartHeight] = useState<number>(300);
  useEffect(() => {
    const compute = () => {
      const area = chartAreaRef.current;
      if (!area) return;
      const h = area.clientHeight;
      setChartHeight(Math.max(140, h));
    };
    // Primer cálculo tras el layout
    const raf = requestAnimationFrame(compute);
    // Observar cambios de tamaño del área del gráfico
    const ro = new ResizeObserver(() => compute());
    if (chartAreaRef.current) ro.observe(chartAreaRef.current);
    // Fallback por si cambia el viewport
    const onResize = () => compute();
    window.addEventListener('resize', onResize);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener('resize', onResize);
    };
  }, [toolbarEnabled]);

  const logic = useDynamicGraphLogic({
    graphName,
    initialAssignedDate,
  });

  // Si no hay días para mostrar, fuerza la selección de los últimos 5 días laborables y evita pantalla en blanco
  useEffect(() => {
    if (!logic.displayDates.length) {
      // solicita al hook que seleccione automáticamente los últimos 5 días laborales
      (logic as any).selectLastFiveBusinessDays?.();
    }
  }, [logic.displayDates.length]);

  return (
    <ErrorBoundary fallback={<div>Error loading graph.</div>}>
      <Box
        className={grid}
        ref={containerRef as any}
        sx={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          minHeight: 0,
          width: '100%',
          minWidth: 0,
          // Keep graphs in system font, independent from global typography
          fontFamily:
            'system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif',
        }}
      >
        <Typography variant='h6' gutterBottom>
          Gráfico de {graphName}
        </Typography>
        <SafeBoundary>
          {toolbarEnabled && (
            <DynamicGraphToolbar
              listRef={toolbarRef}
              range={logic.range}
              predefinedRanges={logic.predefinedRanges}
              onRangeChange={logic.onRangeChange}
              onRangeOk={logic.onRangeOk}
              onRangeClean={logic.onRangeClean}
              graphMode={logic.graphMode}
              setGraphMode={logic.setGraphMode}
              partitionMode={logic.partitionMode}
              setPartitionMode={logic.setPartitionMode}
              partitionEnabled={logic.partitionEnabled}
            />
          )}
        </SafeBoundary>
        <SafeBoundary>
          <Box
            ref={chartAreaRef}
            sx={{
              flex: 1,
              minHeight: 0,
              width: '100%',
              minWidth: 0,
              display: 'flex',
            }}
          >
            <DynamicGraphChart
              mode={logic.graphMode}
              height={chartHeight}
              displayDates={logic.displayDates}
              totals={logic.total}
              justified={logic.justified}
              unjustified={logic.unjustified}
              partitioned={logic.partitioned}
              clickEnabled={!disableClickToOpenTable}
              onClickEach={logic.onChartClickEach}
              onClickPartitioned={logic.onChartClickPartitioned}
            />
          </Box>
        </SafeBoundary>
      </Box>
    </ErrorBoundary>
  );
};
