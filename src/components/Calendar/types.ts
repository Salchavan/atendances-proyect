// Absences types moved to src/types/generalTypes.ts

import type { StudentRec } from '../../types/generalTypes';

export type CalendarProps = {
  absences?: import('../../types/generalTypes').AbsencesMap;
  initialDate?: Date;
  onDayClick?: (date: Date) => void;
  className?: string;
  headerTextClass?: string;
  dayNumberClass?: string;
  absencesNumberClass?: string;
  cellBgClass?: string;
  toolbarEnabled?: boolean;
  students?: StudentRec[];
};
