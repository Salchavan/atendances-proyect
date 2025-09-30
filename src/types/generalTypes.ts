export type AbsencesMap = Record<string, number>;
export type AbsencesDetail = {
  total: number;
  justified: number;
  unjustified: number;
};
export type AbsencesDetailMap = Record<string, AbsencesDetail>;

export interface Unassistance {
  day: string; // 'dd-mm-yy'
  isJustified: boolean;
}

export interface StudentRec {
  id: number;
  firstName: string;
  lastName: string;
  age: number;
  email: string;
  classroom: string;
  unassistences: Unassistance[];
}
