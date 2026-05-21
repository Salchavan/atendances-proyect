import { useQuery } from '@tanstack/react-query';
import { getClassrooms } from '../api/client';

export type ClassroomItem = {
  id: number;
  char: string;
  year: number;
  numberStudents: number;
  turn: string;
  specility?: string;
  studentIds?: number[];
};

export function useClassrooms() {
  return useQuery<ClassroomItem[]>({
    queryKey: ['classrooms'],
    queryFn: async () => {
      try {
        const res = await getClassrooms();
        return (res?.classrooms ?? []) as unknown as ClassroomItem[];
      } catch {
        const mod = await import('../data/Classrooms.json');
        const fallback: ClassroomItem[] = mod.default || mod || [];
        console.log('[API] useClassrooms → fallback to JSON');
        return fallback;
      }
    },
    staleTime: 1000 * 60 * 5,
  });
}
