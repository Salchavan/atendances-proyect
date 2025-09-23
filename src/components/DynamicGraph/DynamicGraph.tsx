import { Box } from '@mui/material';
import { useEffect, useRef, useState } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { useDynamicGraphLogic } from './DynamicGraph.logic.ts';
import { DynamicGraphToolbar } from './DynamicGraphToolbar.tsx';
import { DynamicGraphChart } from './DynamicGraphChart.tsx';

interface Props {
  dataTableName: string;
  initialAssignedDate?: Date[] | null;
  grid: string;
  toolbarEnabled?: boolean; // nueva prop para ocultar / desactivar toolbar
}

export const DynamicGraph = ({
  dataTableName,
  initialAssignedDate = null,
  grid,
  toolbarEnabled = true,
}: Props) => {
  // Layout: medir alto disponible para el gráfico (contenedor - toolbar)
  const containerRef = useRef<HTMLDivElement | null>(null);
  const toolbarRef = useRef<HTMLUListElement | null>(null);
  const [chartHeight, setChartHeight] = useState<number>(260);
  useEffect(() => {
    const recompute = () => {
      const cont = containerRef.current;
      if (!cont) return;
      const total = cont.clientHeight;
      const tb = toolbarEnabled ? toolbarRef.current?.clientHeight ?? 0 : 0;
      const padding = 8; // margen inferior pequeño
      const available = Math.max(140, total - tb - padding);
      setChartHeight(available);
    };
    recompute();
    const ro = new ResizeObserver(recompute);
    if (containerRef.current) ro.observe(containerRef.current);
    if (toolbarRef.current) ro.observe(toolbarRef.current);
    window.addEventListener('resize', recompute);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', recompute);
    };
  }, [toolbarEnabled]);

  const logic = useDynamicGraphLogic({
    dataTableName,
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
        }}
      >
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
    </ErrorBoundary>
  );
};
