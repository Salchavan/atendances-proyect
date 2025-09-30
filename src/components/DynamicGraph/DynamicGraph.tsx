import { Box, Typography } from '@mui/material';
import { useEffect, useRef, useState } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { useDynamicGraphLogic } from './DynamicGraph.logic.ts';
import { DynamicGraphToolbar } from './DynamicGraphToolbar.tsx';
import { DynamicGraphChart } from './DynamicGraphChart.tsx';

interface Props {
  graphName: string;
  initialAssignedDate?: Date[] | null;
  grid: string;
  toolbarEnabled?: boolean; // nueva prop para ocultar / desactivar toolbar
}

export const DynamicGraph = ({
  graphName,
  initialAssignedDate = null,
  grid,
  toolbarEnabled = true,
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
        }}
      >
        <Typography variant='h6' gutterBottom>
          Gráfico de {graphName}
        </Typography>
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
        <Box
          ref={chartAreaRef}
          sx={{ flex: 1, minHeight: 0, width: '100%', display: 'flex' }}
        >
          <DynamicGraphChart
            mode={logic.graphMode}
            height={chartHeight}
            displayDates={logic.displayDates}
            totals={logic.total}
            justified={logic.justified}
            unjustified={logic.unjustified}
            partitioned={logic.partitioned}
            onClickEach={logic.onChartClickEach}
            onClickPartitioned={logic.onChartClickPartitioned}
          />
        </Box>
      </Box>
    </ErrorBoundary>
  );
};
