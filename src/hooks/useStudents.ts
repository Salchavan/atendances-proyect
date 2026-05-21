import { useQuery } from '@tanstack/react-query';
import { getStudents } from '../api/client';
import type { StudentRec } from '../types/generalTypes';

export function useStudents() {
  return useQuery<StudentRec[]>({
    queryKey: ['students'],
    queryFn: async () => {
      try {
        const res = await getStudents();
        return (res?.students ?? []) as unknown as StudentRec[];
      } catch {
        const mod = await import('../data/Students.json');
        const fallback: StudentRec[] = mod.default || mod || [];
        console.log('[API] useStudents → fallback to JSON');
        return fallback;
      }
    },
    staleTime: 1000 * 60 * 5,
  });
}
