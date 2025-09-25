export type AbsencesMap = Record<string, number>;
export type AbsencesDetail = {
  total: number;
  justified: number;
  unjustified: number;
};
export type AbsencesDetailMap = Record<string, AbsencesDetail>;

export type CalendarProps = {
  absences?: AbsencesMap;
  initialDate?: Date;
  onDayClick?: (date: Date) => void;
  className?: string;
  headerTextClass?: string;
  dayNumberClass?: string;
  absencesNumberClass?: string;
  cellBgClass?: string;
};
