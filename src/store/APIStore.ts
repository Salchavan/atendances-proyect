import { useEffect } from 'react';
import { create } from 'zustand';
import { useQuery } from '@tanstack/react-query';

import { getClassrooms, getDivisions, getYears } from '../api/client';

export type DivisionRecord = {
  id: number;
  division_letter: string;
};

export type YearRecord = {
  id: number;
  year_number: number;
};

export type ClassroomRecord = {
  id: number | string;
  year_id?: number;
  year?: number;
  division_id?: number;
  division_letter?: string;
  division?: string;
  shift?: string;
  turn?: string;
  students_count?: number;
  created_at?: string;
  updated_at?: string;
};

type APIStoreState = {
  divisions: DivisionRecord[];
  years: YearRecord[];
  classrooms: ClassroomRecord[];
  setDivisions: (divisions: DivisionRecord[]) => void;
  setYears: (years: YearRecord[]) => void;
  setClassrooms: (classrooms: ClassroomRecord[]) => void;
};

export const useAPIStore = create<APIStoreState>()((set) => ({
  divisions: [],
  years: [],
  classrooms: [],
  setDivisions: (divisions) => set({ divisions }),
  setYears: (years) => set({ years }),
  setClassrooms: (classrooms) => set({ classrooms }),
}));

const extractPayload = <T>(payload: unknown, key: string): T[] => {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload as T[];
  const objectPayload = payload as Record<string, unknown>;
  if (Array.isArray(objectPayload[key])) {
    return objectPayload[key] as T[];
  }
  if (Array.isArray(objectPayload.data)) {
    return objectPayload.data as T[];
  }
  return [];
};

export const useAcademicCatalog = () => {
  const divisions = useAPIStore((state) => state.divisions);
  const years = useAPIStore((state) => state.years);
  const classrooms = useAPIStore((state) => state.classrooms);
  const setDivisions = useAPIStore((state) => state.setDivisions);
  const setYears = useAPIStore((state) => state.setYears);
  const setClassrooms = useAPIStore((state) => state.setClassrooms);

  const divisionsQuery = useQuery({
    queryKey: ['divisions'],
    queryFn: getDivisions,
    staleTime: 1000 * 60 * 5,
  });

  const yearsQuery = useQuery({
    queryKey: ['years'],
    queryFn: getYears,
    staleTime: 1000 * 60 * 5,
  });

  const classroomsQuery = useQuery({
    queryKey: ['classrooms'],
    queryFn: getClassrooms,
    staleTime: 1000 * 60 * 5,
  });

  useEffect(() => {
    if (divisionsQuery.isSuccess) {
      setDivisions(
        extractPayload<DivisionRecord>(divisionsQuery.data, 'divisions')
      );
    }
  }, [divisionsQuery.data, divisionsQuery.isSuccess, setDivisions]);

  useEffect(() => {
    if (yearsQuery.isSuccess) {
      setYears(extractPayload<YearRecord>(yearsQuery.data, 'years'));
    }
  }, [yearsQuery.data, yearsQuery.isSuccess, setYears]);

  useEffect(() => {
    if (classroomsQuery.isSuccess) {
      setClassrooms(
        extractPayload<ClassroomRecord>(classroomsQuery.data, 'classrooms')
      );
    }
  }, [classroomsQuery.data, classroomsQuery.isSuccess, setClassrooms]);

  return {
    divisions,
    years,
    classrooms,
    isLoading:
      divisionsQuery.isLoading ||
      yearsQuery.isLoading ||
      classroomsQuery.isLoading,
    isError:
      divisionsQuery.isError || yearsQuery.isError || classroomsQuery.isError,
    refetchAll: () => {
      void divisionsQuery.refetch();
      void yearsQuery.refetch();
      void classroomsQuery.refetch();
    },
  };
};
