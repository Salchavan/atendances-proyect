// Absences types moved to src/types/generalTypes.ts

export type CalendarProps = {
  absences?: import('../../types/generalTypes').AbsencesMap;
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
