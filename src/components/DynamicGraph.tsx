import {
  Box,
  List,
  ListItem,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
} from '@mui/material';
import { BarChart } from '@mui/x-charts';
import { useGraphStore } from '../Store/specificStore/GraphStore.ts';
import { useStore } from '../Store/Store.ts';
import { DataTable } from '../components/DataTable';
import { Students } from '../data/Data.ts';
import { useMemo } from 'react';
// Toolbar fusionada dentro del componente
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import { DateRangePicker } from 'rsuite';
import { addDays, startOfYear } from 'date-fns';
import { useState } from 'react';

interface Unassistance {
  day: string;
  isJustified: boolean;
}

interface Student {
  id: number;
  firstName: string;
  lastName: string;
  age: number;
  email: string;
  classroom: string;
  unassistences: Unassistance[];
}

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
  // openDataTable sigue en Store global, pero assignedWeekdays ahora viene de GraphStore
  const openDataTable = useStore((s) => s.openDialog);
  const assignedWeekdays = useGraphStore((s) => s.assignedWeekdays);

  // --- Estado local para modo de gráfico y rango de fechas (fusionado de Toolbar) ---
  const [graphMode, setGraphMode] = useState<'each' | 'prom'>('each');
  const { assignedDateRange, setAssignedDateRange } = useGraphStore();
  const [range, setRange] = useState<[Date, Date] | null>(null);
  const now = new Date();
  const predefinedRanges = [
    { label: 'Hoy', value: [new Date(), new Date()], placement: 'bottom' },
    {
      label: 'Ayer',
      value: [addDays(new Date(), -1), addDays(new Date(), -1)],
      placement: 'bottom',
    },
    {
      label: 'Ultimos 7 dias',
      value: [addDays(new Date(), -7), new Date()],
      placement: 'bottom',
    },
    {
      label: 'Ultimos 30 dias',
      value: [addDays(new Date(), -30), new Date()],
      placement: 'bottom',
    },
    { label: 'Este año', value: [startOfYear(now), now], placement: 'bottom' },
  ];

  const updateRange = (newRange: [Date, Date] | null) => {
    if (newRange && Array.isArray(newRange) && newRange[0] && newRange[1]) {
      const [start, end] = newRange as [Date, Date];
      const weekdays: Date[] = [];
      const cursor = new Date(start);
      while (cursor.getTime() <= end.getTime()) {
        const day = cursor.getDay();
        if (day >= 1 && day <= 5) {
          weekdays.push(new Date(cursor));
        }
        cursor.setDate(cursor.getDate() + 1);
      }
      if (weekdays.length === 0) {
        setAssignedDateRange(null);
      } else {
        const assigned: [Date, Date] = [
          weekdays[0],
          weekdays[weekdays.length - 1],
        ];
        setAssignedDateRange(assigned);
      }
    } else {
      setAssignedDateRange(null);
    }
  };

  // Función para formatear fechas
  const formatDate = (date: Date): { display: string; comparison: string } => {
    const dayNames = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie'];
    const dayOfWeek = date.getDay();
    const dayName =
      dayOfWeek >= 1 && dayOfWeek <= 5 ? dayNames[dayOfWeek - 1] : '';

    const displayDate = `${dayName} ${date
      .getDate()
      .toString()
      .padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}`;

    const comparisonDate = `${date.getDate().toString().padStart(2, '0')}-${(
      date.getMonth() + 1
    )
      .toString()
      .padStart(2, '0')}-${date.getFullYear().toString().slice(2)}`;

    return { display: displayDate, comparison: comparisonDate };
  };

  // Obtener los días a mostrar según initialAssignedDate
  const getDaysToDisplay = useMemo(() => {
    const sourceDates =
      assignedWeekdays && assignedWeekdays.length
        ? assignedWeekdays
        : initialAssignedDate || [];

    if (!sourceDates || !sourceDates.length) {
      return { displayDates: [], comparisonDates: [] };
    }

    const displayDates: string[] = [];
    const comparisonDates: string[] = [];
    const sortedDates = [...sourceDates].sort(
      (a, b) => a.getTime() - b.getTime()
    );

    sortedDates.forEach((date) => {
      const formatted = formatDate(date);
      displayDates.push(formatted.display);
      comparisonDates.push(formatted.comparison);
    });

    return { displayDates, comparisonDates };
  }, [assignedWeekdays, initialAssignedDate]);

  // Función para contar inasistencias
  const getUnassistencesData = useMemo(() => {
    const { comparisonDates } = getDaysToDisplay;
    const daysCount = comparisonDates.length;

    const totalUnassistences: number[] = new Array(daysCount).fill(0);
    const justifiedUnassistences: number[] = new Array(daysCount).fill(0);
    const unjustifiedUnassistences: number[] = new Array(daysCount).fill(0);

    Students.forEach((student: Student) => {
      student.unassistences.forEach((unassistance: Unassistance) => {
        const dayIndex = comparisonDates.indexOf(unassistance.day);
        if (dayIndex !== -1) {
          totalUnassistences[dayIndex]++;
          if (unassistance.isJustified) {
            justifiedUnassistences[dayIndex]++;
          } else {
            unjustifiedUnassistences[dayIndex]++;
          }
        }
      });
    });

    return {
      total: totalUnassistences,
      justified: justifiedUnassistences,
      unjustified: unjustifiedUnassistences,
    };
  }, [getDaysToDisplay]);

  // Función para obtener los estudiantes con inasistencias
  const getStudentsWithUnassistences = useMemo(() => {
    const { comparisonDates } = getDaysToDisplay;
    const studentsWithUnassistences: Student[] = [];

    // Si no hay días seleccionados, no mostrar estudiantes
    if (comparisonDates.length === 0) {
      return studentsWithUnassistences;
    }

    Students.forEach((student: Student) => {
      // Verificar si el estudiante tiene inasistencias en los días seleccionados
      const hasUnassistencesInRange = student.unassistences.some(
        (unassistance) => comparisonDates.includes(unassistance.day)
      );

      if (hasUnassistencesInRange) {
        studentsWithUnassistences.push(student);
      }
    });

    return studentsWithUnassistences;
  }, [getDaysToDisplay]);

  const { total, justified, unjustified } = getUnassistencesData;
  const studentsWithUnassistences = getStudentsWithUnassistences;
  const { displayDates } = getDaysToDisplay;

  // Si no hay días para mostrar, renderizar un contenedor vacío
  if (displayDates.length === 0) {
    return (
      <Box
        className={grid}
        display='flex'
        alignItems='center'
        justifyContent='center'
        sx={{ border: '1px dashed #ccc', borderRadius: 2 }}
      >
        <Box color='text.secondary'>
          Seleccione un rango de fechas para visualizar los datos
        </Box>
      </Box>
    );
  }

  return (
    <Box className={grid}>
      {toolbarEnabled && (
        <List className='bg-acento/50 rounded-xl flex flex-row items-center p-1 mb-2'>
          <ListItem>
            <DateRangePicker
              format='dd / MM / yyyy'
              placeholder='Seleccionar rango'
              showHeader={false}
              ranges={predefinedRanges as any}
              caretAs={CalendarMonthIcon}
              value={range as any}
              onChange={(value) => {
                if (value && Array.isArray(value) && value[0] && value[1]) {
                  setRange([value[0], value[1]] as [Date, Date]);
                } else {
                  setRange(null);
                }
              }}
              onOk={(value) => updateRange(value)}
              onClean={() => {
                setRange(null);
                setAssignedDateRange(null);
              }}
            />
          </ListItem>
          <ListItem>
            <FormControl>
              <InputLabel id='graph-mode-label'>Modo</InputLabel>
              <Select
                size='small'
                value={graphMode}
                onChange={(e) =>
                  setGraphMode(e.target.value as 'each' | 'prom')
                }
                label='Modo'
                className='bg-white/50 rounded-xl'
                inputProps={{ 'aria-label': 'graph-mode' }}
              >
                <MenuItem value='each'>Cada uno</MenuItem>
                <MenuItem value='prom'>Promedio</MenuItem>
              </Select>
            </FormControl>
          </ListItem>
        </List>
      )}
      <BarChart
        barLabel='value'
        className='h-full'
        xAxis={[
          {
            data: displayDates,
            categoryGapRatio: 0.2,
            barGapRatio: 0,
          },
        ]}
        series={[
          { data: total, color: '#ff5b5b', label: 'Total' },
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
        ]}
        onClick={() => {
          openDataTable(
            <DataTable tableData={studentsWithUnassistences} />,
            dataTableName
          );
        }}
        margin={{ top: 5, bottom: 5, left: 0, right: 10 }}
        borderRadius={10}
      />
    </Box>
  );
};
