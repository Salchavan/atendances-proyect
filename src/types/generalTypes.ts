/**
 * Tipos compartidos y columnas por defecto para el DataTable
 * - Alineado con `src/data/Students.json` (usa snake_case para nombres)
 * - Mantener `typeColumns` sincronizado con los keys del JSON
 */
export type AbsencesMap = Record<string, number>;
export type AbsencesDetail = {
  total: number;
  justified: number;
  unjustified: number;
};
export type AbsencesDetailMap = Record<string, AbsencesDetail>;

export type AttendanceRecord = {
  id: number;
  student_id: number;
  classroom_id: number;
  date: string;
  status: string;
  fraction?: number | null;
  notes?: string | null;
  checkInTime?: string | null;
  checkOutTime?: string | null;
};

export type AttendanceMap = Record<string, number>;
export type AttendanceDetail = {
  total: number;
  present: number;
  fractionSum: number;
};
export type AttendanceDetailMap = Record<string, AttendanceDetail>;

export type CalendarProps = {
  absences?: AbsencesMap;
  initialDate?: Date;
  onDayClick?: (date: Date) => void;
  className?: string;
  headerTextClass?: string;
  dayNumberClass?: string;
  absencesNumberClass?: string;
  cellBgClass?: string;
  /** Muestra/oculta la barra superior (título y navegación). Default: true */
  toolbarEnabled?: boolean;
};

export interface Unassistance {
  day: string; // 'dd-mm-yy'
  isJustified: boolean;
}

export interface StudentRec {
  id: number;
  dni?: number;
  first_name: string;
  last_name: string;
  age?: number;
  email?: string;
  classroom?: string;
  username?: string;
  classroom_id?: number;
  active?: boolean;
  unassistences: Unassistance[];
}

export const typeColumns = [
  {
    field: 'id',
    headerName: 'ID',
    width: 75,
    minWidth: 75,
    sortable: true,
  },
  {
    field: 'dni',
    headerName: 'DNI',
    width: 100,
    minWidth: 100,
    sortable: true,
  },
  {
    field: 'first_name',
    headerName: 'Nombre',
    width: 100,
    minWidth: 100,
    sortable: true,
  },
  {
    field: 'last_name',
    headerName: 'Apellido',
    width: 100,
    minWidth: 100,
    sortable: true,
  },
  {
    field: 'age',
    headerName: 'Edad',
    width: 75,
    minWidth: 75,
    sortable: true,
  },
  {
    field: 'email',
    headerName: 'Email',
    width: 200,
    minWidth: 200,
    sortable: true,
  },
  {
    field: 'classroom',
    headerName: 'Curso',
    width: 75,
    minWidth: 75,
    sortable: true,
  },
];
