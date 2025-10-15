import React from 'react';
import { Box } from '@mui/material';
import { useMultiChartLogic } from './MultiChart.logic.ts';
import { MultiChartToolbar } from './MultiChartToolbar.tsx';
import { MultiChartChart } from './MultiChartChart.tsx';
import { useStore } from '../../store/Store';

type Props = {
  title?: string;
  grid?: string; // tailwind classes for external grid integration
  toolbarEnabled?: boolean;
  toolbarPosition?: 'top' | 'bottom';
  initialChartType?: 'bar' | 'pie' | 'line';
  disabledControls?: Parameters<
    typeof MultiChartToolbar
  >[0]['disabledControls'];
};

export const MultiChart: React.FC<Props> = ({
  title = 'MultiChart',
  grid,
  toolbarEnabled = true,
  toolbarPosition = 'top',
  initialChartType = 'bar',
  disabledControls,
}) => {
  const logic = useMultiChartLogic({ initialChartType });
  const openDialog = useStore((s) => s.openDialog);

  const renderToolbar = (hideTitleInModal?: boolean) => (
    <MultiChartToolbar
      title={hideTitleInModal ? undefined : title}
      selectedRange={logic.selectedRange}
      onRangeChange={logic.setSelectedRange}
      chartType={logic.chartType}
      onSetChartType={logic.setChartTypeDirect}
      activeSeries={logic.activeSeries}
      onToggleSeries={logic.toggleSeries}
      onOpenFullscreen={() => {
        openDialog(
          React.createElement(() => {
            const modalLogic = useMultiChartLogic({
              initialChartType: logic.chartType,
            });
            return (
              <Box sx={{ p: 1, height: '100%', minHeight: 0, minWidth: 0 }}>
                <MultiChartToolbar
                  compact
                  selectedRange={modalLogic.selectedRange}
                  onRangeChange={modalLogic.setSelectedRange}
                  chartType={modalLogic.chartType}
                  onSetChartType={modalLogic.setChartTypeDirect}
                  activeSeries={modalLogic.activeSeries}
                  onToggleSeries={modalLogic.toggleSeries}
                  onOpenFullscreen={() => {}}
                  fullscreenLabel=''
                  disabledControls={disabledControls}
                />
                <Box sx={{ height: 'calc(100% - 56px)', minHeight: 200 }}>
                  <MultiChartChart
                    type={modalLogic.chartType}
                    height={Math.max(220, window.innerHeight * 0.6)}
                    data={modalLogic.data}
                    activeSeries={modalLogic.activeSeries}
                    showBarValueLabels={logic.showBarValueLabels}
                    showXAxisLabels={logic.showXAxisLabels}
                  />
                </Box>
              </Box>
            );
          }, {}),
          title,
          'big'
        );
      }}
      fullscreenLabel='Pantalla grande'
      disabledControls={disabledControls}
    />
  );

  return (
    <Box
      className={grid}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        minHeight: 0,
      }}
    >
      {toolbarEnabled && toolbarPosition === 'top' && renderToolbar(false)}

      <Box ref={logic.containerRef} sx={{ flex: 1, minHeight: 0, minWidth: 0 }}>
        <MultiChartChart
          type={logic.chartType}
          height={logic.chartHeight}
          data={logic.data}
          activeSeries={logic.activeSeries}
          showBarValueLabels={logic.showBarValueLabels}
          showXAxisLabels={logic.showXAxisLabels}
          containerWidth={logic.chartWidth}
        />
      </Box>

      {toolbarEnabled && toolbarPosition === 'bottom' && renderToolbar(false)}

      {/* Fullscreen now handled via CustomModal through openDialog('big') */}
    </Box>
  );
};
