import React from 'react';
import { Box } from '@mui/material';
import { useMultiChartLogic } from './MultiChart.logic.ts';
import type { GenericChartData } from './MultiChart.logic.ts';
import { MultiChartToolbar } from './MultiChartToolbar.tsx';
import { MultiChartChart } from './MultiChartChart.tsx';
import { useStore } from '../../store/Store';
import { SafeBoundary } from '../SafeBoundary';
import { DataTable } from '../DataTable/DataTable';

type Props = {
  title?: string;
  grid?: string; // tailwind classes for external grid integration
  toolbarEnabled?: boolean;
  toolbarPosition?: 'top' | 'bottom';
  initialChartType?: 'bar' | 'pie' | 'line';
  disabledControls?: Parameters<
    typeof MultiChartToolbar
  >[0]['disabledControls'];
  students?: any[];
  selectedUser?: any;
  // pass the dataset to display (students/rows) via `data` prop
  data?: any[];
  // Allow passing a fully custom dataset (labels + series). Series can include colors and slices for pie.
  customData?: GenericChartData;
  // disable the default click behavior that opens a DataTable modal
  disableTableOnClick?: boolean;
  // provide custom rows to show in the DataTable when the chart is clicked
  customTableData?: any[];
};

export const MultiChart: React.FC<Props> = ({
  title = 'MultiChart',
  grid,
  toolbarEnabled = true,
  toolbarPosition = 'top',
  initialChartType = 'bar',
  disabledControls,
  selectedUser,
  data,
  customData,
  disableTableOnClick = false,
  customTableData,
}) => {
  const logic = useMultiChartLogic({
    initialChartType,
    students: data,
    selectedUser,
    genericData: customData,
  });
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
              students: (logic as any).students,
              selectedUser,
              genericData: (logic as any).genericData,
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
                    genericData={(modalLogic as any).genericData}
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
      <SafeBoundary>
        {toolbarEnabled && toolbarPosition === 'top' && renderToolbar(false)}
      </SafeBoundary>

      <SafeBoundary>
        <Box
          ref={logic.containerRef}
          sx={{ flex: 1, minHeight: 0, minWidth: 0, cursor: 'pointer' }}
          onClick={() => {
            if (disableTableOnClick) return;
            // compute students who have any absence in the currently displayed period
            // If caller provided a customTableData use it, otherwise compute absent students
            const absentStudents = Array.isArray(customTableData)
              ? customTableData
              : (() => {
                  const keys: string[] = (logic as any).dayKeys || [];
                  const studentsArr: any[] = (logic as any).students || [];
                  const map = new Map<number, any>();
                  studentsArr.forEach((s) => {
                    (s.unassistences || []).forEach((u: any) => {
                      if (keys.includes(u.day)) map.set(s.id, s);
                    });
                  });
                  return Array.from(map.values());
                })();
            openDialog(
              React.createElement(() => (
                <Box sx={{ height: '60vh', minHeight: 300 }}>
                  <DataTable tableData={absentStudents} filtersEnabled={true} />
                </Box>
              )),
              `${title} - Inasistencias`,
              'big'
            );
          }}
        >
          <MultiChartChart
            type={logic.chartType}
            height={logic.chartHeight}
            data={logic.data}
            actionBreakdown={(logic as any).actionBreakdown}
            genericData={(logic as any).genericData}
            activeSeries={logic.activeSeries}
            showBarValueLabels={logic.showBarValueLabels}
            showXAxisLabels={logic.showXAxisLabels}
            containerWidth={logic.chartWidth}
          />
        </Box>
      </SafeBoundary>

      <SafeBoundary>
        {toolbarEnabled && toolbarPosition === 'bottom' && renderToolbar(false)}
      </SafeBoundary>

      {/* Fullscreen now handled via CustomModal through openDialog('big') */}
    </Box>
  );
};
