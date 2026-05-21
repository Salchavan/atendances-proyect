import { useQuery } from '@tanstack/react-query';
import { getStaffList } from '../api/client';

export type UserRecord = {
  id?: number | string;
  dni?: string | number;
  firstName?: string;
  lastName?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  role?: string;
  rol?: string | number;
};

export function useUsers() {
  return useQuery<UserRecord[]>({
    queryKey: ['users'],
    queryFn: async () => {
      try {
        const res = await getStaffList();
        const list = (res as any)?.staff ?? (res as any)?.users ?? [];
        return list as UserRecord[];
      } catch {
        const mod = await import('../data/users.json');
        const fallback: UserRecord[] = mod.default || mod || [];
        console.log('[API] useUsers → fallback to JSON');
        return fallback;
      }
    },
    staleTime: 1000 * 60 * 5,
  });
}
