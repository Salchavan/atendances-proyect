import { useQuery } from '@tanstack/react-query';
import { getStatsOptions, getStudents } from '../api/client';
import type { StudentRec } from '../types/generalTypes';

export function useStaticsData() {
  return useQuery<any>({
    queryKey: ['statics'],
    queryFn: async () => {
      try {
        return await getStatsOptions();
      } catch {
        const mod = await import('../data/Statics.json');
        const fallback = mod.default || mod || null;
        console.log('[API] useStaticsData → fallback to JSON');
        return fallback;
      }
    },
    staleTime: 1000 * 60 * 5,
  });
}

export function useStudentsForStatics() {
  return useQuery<StudentRec[]>({
    queryKey: ['students', 'statics'],
    queryFn: async () => {
      try {
        const res = await getStudents();
        return (res?.students ?? []) as unknown as StudentRec[];
      } catch {
        const mod = await import('../data/Students.json');
        const fallback: StudentRec[] = mod.default || mod || [];
        console.log('[API] useStudentsForStatics → fallback to JSON');
        return fallback;
      }
    },
    staleTime: 1000 * 60 * 5,
  });
}
