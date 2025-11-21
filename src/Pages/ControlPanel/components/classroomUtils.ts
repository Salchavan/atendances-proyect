import type {
  ClassroomRecord,
  DivisionRecord,
  YearRecord,
} from '../../../store/APIStore';

export const buildDivisionMap = (
  divisions: DivisionRecord[]
): Map<number | string, DivisionRecord> => {
  const map = new Map<number | string, DivisionRecord>();
  divisions.forEach((division) => {
    if (division?.id !== undefined) {
      map.set(division.id, division);
      map.set(String(division.id), division);
    }
    if (division?.division_letter) {
      map.set(division.division_letter, division);
      map.set(String(division.division_letter), division);
    }
  });
  return map;
};

export const buildYearMap = (
  years: YearRecord[]
): Map<number | string, YearRecord> => {
  const map = new Map<number | string, YearRecord>();
  years.forEach((year) => {
    if (year?.id !== undefined) {
      map.set(year.id, year);
      map.set(String(year.id), year);
    }
    if (year?.year_number !== undefined) {
      map.set(year.year_number, year);
      map.set(String(year.year_number), year);
    }
  });
  return map;
};

export const buildClassroomLabel = (
  classroom: ClassroomRecord,
  divisionsMap: Map<number | string, DivisionRecord>,
  yearsMap: Map<number | string, YearRecord>
) => {
  const yearKey = classroom.year_id ?? classroom.year;
  const yearLabel =
    (yearKey !== undefined && yearsMap.get(yearKey)?.year_number) ??
    classroom.year ??
    classroom.year_id;
  const divisionKey = classroom.division_id ?? classroom.division_letter;
  const divisionLabel =
    (divisionKey !== undefined &&
      divisionsMap.get(divisionKey)?.division_letter) ??
    classroom.division_letter ??
    classroom.division;
  const formatted = [yearLabel, divisionLabel].filter(Boolean).join(' ');
  return formatted || `ID ${classroom.id}`;
};
