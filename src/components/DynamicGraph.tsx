import { Box } from '@mui/material';
import { BarChart } from '@mui/x-charts';
import { useStore } from '../store/Store';
import { DataTable } from '../components/DataTable';
import { Students } from '../data/Data.ts';
import { useMemo } from 'react';

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
}

export const DynamicGraph = ({ dataTableName }: Props) => {
  const openDataTable = useStore((store) => store.openDialog);

  // Función para obtener los últimos 5 días laborales
  const getLast5BusinessDays = useMemo(() => {
    const days: string[] = [];
    const dateFormats: string[] = [];
    const today = new Date();
    let count = 0;

    while (days.length < 5) {
      const currentDate = new Date(today);
      currentDate.setDate(today.getDate() - count);

      const dayOfWeek = currentDate.getDay();
      if (dayOfWeek >= 1 && dayOfWeek <= 5) {
        const dayNames = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie'];
        const date = `${currentDate.getDate().toString().padStart(2, '0')}/${(
          currentDate.getMonth() + 1
        )
          .toString()
          .padStart(2, '0')}`;

        days.unshift(`${dayNames[dayOfWeek - 1]} ${date}`);

        const formattedDate = `${currentDate
          .getDate()
          .toString()
          .padStart(2, '0')}-${(currentDate.getMonth() + 1)
          .toString()
          .padStart(2, '0')}-${currentDate.getFullYear().toString().slice(2)}`;
        dateFormats.unshift(formattedDate);
      }
      count++;
    }

    return { displayDates: days, comparisonDates: dateFormats };
  }, []);

  // Función para contar inasistencias (totales, justificadas e injustificadas)
  const getUnassistencesData = useMemo(() => {
    const { comparisonDates } = getLast5BusinessDays;
    const totalUnassistences: number[] = new Array(5).fill(0);
    const justifiedUnassistences: number[] = new Array(5).fill(0);
    const unjustifiedUnassistences: number[] = new Array(5).fill(0);

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
  }, [getLast5BusinessDays]);

  // Función para obtener los estudiantes con inasistencias
  const getStudentsWithUnassistences = useMemo(() => {
    const studentsWithUnassistences: Student[] = [];

    Students.forEach((student: Student) => {
      if (student.unassistences && student.unassistences.length > 0) {
        studentsWithUnassistences.push(student);
      }
    });

    return studentsWithUnassistences;
  }, []);

  const { total, justified, unjustified } = getUnassistencesData;
  const studentsWithUnassistences = getStudentsWithUnassistences;

  return (
    <Box className='col-span-6 row-span-8 col-start-3 row-start-3'>
      <BarChart
        barLabel='value'
        className='h-full'
        xAxis={[
          {
            data: getLast5BusinessDays.displayDates,
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
