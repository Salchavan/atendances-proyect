import axios from 'axios';
import { useUserStore } from '../store/UserStore';
import { useStore } from '../store/Store';

const URL = 'https://asistenciaescuela.onrender.com';
const token = useUserStore.getState().userAuthData?.authToken;
const logOut = useUserStore.getState().logOut;

// Centralized Axios instance
export const api = axios.create({
  baseURL: URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  },
});

api.interceptors.request.use((config) => {
  const authToken = useUserStore.getState().userAuthData?.authToken;
  if (authToken) {
    config.headers.Authorization = `Bearer ${authToken}`;
  } else {
    delete config.headers.Authorization;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      logOut();
      useStore.getState().setPerfilUserSelected?.(undefined);
      window.location.href = ' /atendances-proyect/login';
    }
    return Promise.reject(error);
  }
);

// * LOGIN REQUESTS

export const loginStaff = async (data: { dni: string; password: string }) => {
  try {
    const res = await api.post('/api/v1/auth/staff/login', data);
    console.log('loginStaff response data:', res.data);
    return res.data;
  } catch (error) {
    console.error('Error in loginStaff:', error);
  }
};

export const loginPreceptor = async (data: {
  dni: string;
  password: string;
}) => {
  try {
    const res = await api.post('/api/v1/auth/preceptor/login', data);
    console.log('loginPreceptor response data:', res.data);
    return res.data;
  } catch (error) {
    console.error('Error in loginPreceptor:', error);
  }
};

export const getUserInfo = async () => {
  try {
    const res = await api.get('/api/v1/staff');
    const staff = res.data?.staff ?? [];
    console.log('getUserInfo staff:', staff);
    return staff;
  } catch (error) {
    console.error('Error in getUserInfo:', error);
    throw error;
  }
};

// * STAFF REQUESTS

type StaffQueryParams = {
  page?: number;
  pageSize?: number;
  role?: string;
  q?: string;
};

export const getStaff = async (params?: StaffQueryParams) => {
  try {
    const res = await api.get('/api/v1/staff', { params });
    console.log('getStaff response data:', res.data);
    return res.data;
  } catch (error) {
    console.error('Error in getStaff:', error);
    throw error;
  }
};

type PostStaffPayload = {
  dni: string;
  password: string;
  first_name: string;
  last_name: string;
  role: string | number;
};

export const postStaff = async (data: PostStaffPayload) => {
  try {
    console.log('postStaff data:', data);
    const res = await api.post('/api/v1/auth/staff', data);
    console.log('postStaff response data:', res.data);
    return res.data;
  } catch (error) {
    console.error('Error in postStaff:', error);
    throw error;
  }
};

type PutStaffPayload = {
  first_name?: string;
  last_name?: string;
  role?: string | number;
};

export const putStaff = async (id: string | number, data: PutStaffPayload) => {
  try {
    const res = await api.put(`/api/v1/staff/${id}`, data);
    console.log('putStaff response data:', res.data);
    return res.data;
  } catch (error) {
    console.error('Error in putStaff:', error);
    throw error;
  }
};

export const delStaff = async (id: string | number) => {
  try {
    const res = await api.delete(`/api/v1/staff/${id}`);
    console.log('delStaff response data:', res.data);
    return res.data;
  } catch (error) {
    console.error('Error in delStaff:', error);
    throw error;
  }
};

// * ATTENDANCE REQUESTS

export const getAttendancesByDate = async (from: string, to: string) => {
  try {
    const res = await api.get(
      `/api/v1/attendance?from=${from}&to=${to}&page=1&pageSize=100`
    );
    console.log('getAttendancesByDate response data:', res.data);
    return res.data;
  } catch (error) {
    console.error('Error in getMonthAttendances:', error);
    throw error;
  }
};

// * STUDENT REQUESTS

export const getAllStudents = async () => {
  try {
    const res = await api.get('/api/v1/students');
    console.log('getAllStudents response data:', res.data);
    return res.data;
  } catch (error) {
    console.error('Error in getAllStudents:', error);
    throw error;
  }
};

export const getStudentsBySearch = async (search: string) => {
  try {
    const res = await api.get(`/api/v1/students?q=${search}&active=true`);
    console.log('getStudentsBySearch response data:', res.data);
    return res.data;
  } catch (error) {
    console.error('Error in getStudents:', error);
    throw error;
  }
};

export const getStudentsByClassroom = async (id: string) => {
  try {
    const res = await api.get(`/api/v1/students?classroomId=${id}&active=true`);
    console.log('getStudentsBySearch response data:', res.data);
    return res.data;
  } catch (error) {
    console.error('Error in getStudentsByClassroom:', error);
    throw error;
  }
};

export const getStudentById = async (id: number) => {
  try {
    const res = await api.get(`/api/v1/students/${id}`);
    console.log('getStudentById response data:', res.data);
    return res.data;
  } catch (error) {
    console.error('Error in getStudentById:', error);
    throw error;
  }
};

type PostStudentData = {
  first_name: string;
  last_name: string;
  username: string;
  classroomId: number;
  active?: boolean;
};

export const postStudent = async (data: PostStudentData) => {
  try {
    const payload = { active: true, ...data };
    console.log('postStudent data:', payload);
    const res = await api.post('/api/v1/students', payload);
    console.log('postStudent response data:', res.data);
    return res.data;
  } catch (error) {
    console.error('Error in postStudent:', error);
    throw error;
  }
};

type PutStudentData = {
  first_name?: string;
  last_name?: string;
  username?: string;
  classroom_id?: number;
  active?: boolean;
};

export const putStudent = async (id: number, data: Partial<PutStudentData>) => {
  try {
    const res = await api.put(`/api/v1/students/${id}`, data);
    console.log('putStudent response data:', res.data);
    return res.data;
  } catch (error) {
    console.error('Error in putStudent:', error);
    throw error;
  }
};

export const delStudents = async (id: number) => {
  console.log('delStudents id:', id);
  try {
    const res = await api.delete(`/api/v1/students/${id}`);
    console.log('delStudents response data:', res.data);
    return res.data;
  } catch (error) {
    console.error('Error in delStudents:', error);
    throw error;
  }
};

// * SUBSCRIPTION REQUESTS

export const getAllEnrollments = async () => {
  try {
    const res = await api.get('/api/v1/enrollments');
    console.log('getEnrollments response data:', res.data);
    return res.data;
  } catch (error) {
    console.error('Error in getEnrollments:', error);
    throw error;
  }
};
export const getEnrollmentsByStudentId = async (studentId: number) => {
  try {
    const res = await api.get(`/api/v1/enrollments?studentId=${studentId}`);
    console.log('getEnrollmentsByStudentId response data:', res.data);
    return res.data;
  } catch (error) {
    console.error('Error in getEnrollmentsByStudentId:', error);
    throw error;
  }
};

export const getEnrollmentsByClassroom = async (classroomId: number) => {
  try {
    const res = await api.get(`/api/v1/enrollments?classroomId=${classroomId}`);
    console.log('getEnrollmentsByClassroom response data:', res.data);
    return res.data;
  } catch (error) {
    console.error('Error in getEnrollmentsByClassroom:', error);
    throw error;
  }
};

export const postEnrollment = async (data: {
  studentId: number;
  classroomId: number;
  startDate: string;
  endDate?: string | null;
}) => {
  try {
    const res = await api.post('/api/v1/enrollments', data);
    console.log('postEnrollment response data:', res.data);
    return res.data;
  } catch (error) {
    console.error('Error in postEnrollment:', error);
    throw error;
  }
};

export const endEnrollment = async (id: number) => {
  try {
    const endDate = '2025-12-31';
    console.log('endEnrollment payload:', { endDate });
    const res = await api.post(`/api/v1/enrollments/${id}/end`, { endDate });
    console.log('endEnrollment response data:', res.data);
    return res.data;
  } catch (error) {
    console.error('Error in endEnrollment:', error);
    throw error;
  }
};

// * STATS REQUESTS

export type StatsTarget =
  | { type: 'STUDENT'; id: number }
  | { type: 'CLASSROOM'; id: number }
  | { type: 'YEAR'; year: number }
  | { type: 'SHIFT'; value: string };

export const getStatsOptions = async () => {
  try {
    const res = await api.get('/api/v1/stats/options');
    console.log('getStatsOptions response data:', res.data);
    return res.data;
  } catch (error) {
    console.error('Error in getStatsOptions:', error);
    throw error;
  }
};

export const getStats = async (target: StatsTarget) => {
  try {
    const res = await api.post('/api/v1/stats/query', {
      target,
    });
    console.log('getStats response data:', res.data);
    return res.data;
  } catch (error) {
    console.error('Error in getStats:', error);
    throw error;
  }
};

export const compareStats = async (targets: StatsTarget[]) => {
  try {
    const res = await api.post('/api/v1/stats/compare', { targets });
    console.log('compareStats response data:', res.data);
    return res.data;
  } catch (error) {
    console.error('Error in compareStats:', error);
    throw error;
  }
};

export type StatsRankingParams = {
  scope?: 'CLASSROOM' | 'STUDENT';
  metric?: string;
  limit?: number;
};

export const getStatsRankings = async (params?: StatsRankingParams) => {
  try {
    const res = await api.get('/api/v1/stats/rankings', { params });
    console.log('getStatsRankings response data:', res.data);
    return res.data;
  } catch (error) {
    console.error('Error in getStatsRankings:', error);
    throw error;
  }
};

export type StatsTimeseriesParams = {
  type: StatsTarget['type'];
  id?: number;
  year?: number;
  value?: string;
  granularity?: 'day' | 'week' | 'month' | 'year';
  metric?: string;
  from?: string;
  to?: string;
};

export const getStatsTimeseries = async (params: StatsTimeseriesParams) => {
  try {
    const res = await api.get('/api/v1/stats/timeseries', { params });
    console.log('getStatsTimeseries response data:', res.data);
    return res.data;
  } catch (error) {
    console.error('Error in getStatsTimeseries:', error);
    throw error;
  }
};

export type StatsIntervalsParams = {
  type: StatsTarget['type'];
  id?: number;
  year?: number;
  value?: string;
  dimension?: 'weekday' | 'hour';
  metric?: string;
  from?: string;
  to?: string;
};

export const getStatsIntervals = async (params: StatsIntervalsParams) => {
  try {
    const res = await api.get('/api/v1/stats/intervals', { params });
    console.log('getStatsIntervals response data:', res.data);
    return res.data;
  } catch (error) {
    console.error('Error in getStatsIntervals:', error);
    throw error;
  }
};

export type StatsDispersionParams = {
  scope?: 'STUDENT' | 'CLASSROOM';
  type: StatsTarget['type'];
  id?: number;
  year?: number;
  value?: string;
  metric?: string;
};

export const getStatsDispersion = async (params: StatsDispersionParams) => {
  try {
    const res = await api.get('/api/v1/stats/dispersion', { params });
    console.log('getStatsDispersion response data:', res.data);
    return res.data;
  } catch (error) {
    console.error('Error in getStatsDispersion:', error);
    throw error;
  }
};

export type StatsImprovementsParams = {
  scope?: 'STUDENT' | 'CLASSROOM';
  type: StatsTarget['type'];
  id?: number;
  year?: number;
  value?: string;
  metric?: string;
  windowDays?: number;
  limit?: number;
};

export const getStatsImprovements = async (params: StatsImprovementsParams) => {
  try {
    const res = await api.get('/api/v1/stats/improvements', { params });
    console.log('getStatsImprovements response data:', res.data);
    return res.data;
  } catch (error) {
    console.error('Error in getStatsImprovements:', error);
    throw error;
  }
};

// * CLASSROOM REQUESTS

export const getClassrooms = async () => {
  try {
    const res = await api.get('/api/v1/classrooms?active=true');
    console.log('getClassrooms response data:', res.data);
    return res.data;
  } catch (error) {
    console.error('Error in getClassrooms:', error);
    throw error;
  }
};

export const postClassroom = async (data: {
  idYear: number;
  idDivision: number;
  shift: 'MORNING' | 'AFTERNOON' | 'EVENING';
}) => {
  try {
    console.log('postClassroom request payload:', data);
    const res = await api.post('/api/v1/classrooms', data);
    console.log('postClassroom response data:', res.data);
    return res.data;
  } catch (error) {
    console.error('Error in postClassroom:', error);
    throw error;
  }
};

export const delClassrooms = async (id: Array<number | string>) => {
  try {
    const res = await api.delete('/api/v1/classrooms', {
      data: { id },
    });
    console.log('delClassrooms response data:', res.data);
    return res.data;
  } catch (error) {
    console.error('Error in delClassrooms:', error);
    throw error;
  }
};

// * DIVISION REQUESTS

export const getDivisions = async () => {
  try {
    const res = await api.get('/api/v1/divisions');
    console.log('getDivisions response data:', res.data);
    return res.data;
  } catch (error) {
    console.error('Error in getDivisions:', error);
    throw error;
  }
};

export const postDivision = async (data: { label: string }) => {
  try {
    const res = await api.post('/api/v1/divisions', data);
    console.log('postDivision response data:', res.data);
    return res.data;
  } catch (error) {
    console.error('Error in postDivision:', error);
    throw error;
  }
};

export const delDivisions = async (id: number[]) => {
  try {
    const res = await api.delete('/api/v1/divisions', {
      data: { id },
    });
    console.log('delDivisions response data:', res.data);
    return res.data;
  } catch (error) {
    console.error('Error in delDivisions:', error);
    throw error;
  }
};

// * YEAR REQUESTS

export const getYears = async () => {
  try {
    const res = await api.get('/api/v1/years');
    console.log('getYears response data:', res.data);
    return res.data;
  } catch (error) {
    console.error('Error in getYears:', error);
    throw error;
  }
};

export const postYear = async (data: { label: number }) => {
  try {
    const res = await api.post('/api/v1/years', data);
    console.log('postYear response data:', res.data);
    return res.data;
  } catch (error) {
    console.error('Error in postYear:', error);
    throw error;
  }
};

export const delYears = async (id: number[]) => {
  try {
    const res = await api.delete('/api/v1/years', {
      data: { id },
    });
    console.log('delYears response data:', res.data);
    return res.data;
  } catch (error) {
    console.error('Error in delYears:', error);
    throw error;
  }
};

// * SPECIAL DAYS REQUESTS

export const getNotSchoolDays = async () => {
  try {
    const res = await api.get('/api/v1/not-school-days');
    console.log('getNotSchoolDays response data:', res.data);
    return res.data;
  } catch (error) {
    console.error('Error in getNotSchoolDays:', error);
    throw error;
  }
};

export const postNotSchoolDay = async (data: {
  date: string;
  reason: string;
}) => {
  try {
    const res = await api.post('/api/v1/not-school-days', data);
    console.log('postNotSchoolDay response data:', res.data);
    return res.data;
  } catch (error) {
    console.error('Error in postNotSchoolDay:', error);
    throw error;
  }
};

export const delNotSchoolDay = async (id: number | string) => {
  try {
    const res = await api.delete(`/api/v1/not-school-days/${id}`);
    console.log('delNotSchoolDay response data:', res.data);
    return res.data;
  } catch (error) {
    console.error('Error in delNotSchoolDay:', error);
    throw error;
  }
};

export const assignNotSchoolDay = async (data: {
  classroomId: number | string;
  date: string;
  reason: string;
}) => {
  try {
    const res = await api.post('/api/v1/not-school-days/assign', data);
    console.log('assignNotSchoolDay response data:', res.data);
    return res.data;
  } catch (error) {
    console.error('Error in assignNotSchoolDay:', error);
    throw error;
  }
};

export const getNotSchoolDayAssignments = async () => {
  try {
    const res = await api.get('/api/v1/not-school-days/assignments');
    console.log('getNotSchoolDayAssignments response data:', res.data);
    return res.data;
  } catch (error) {
    console.error('Error in getNotSchoolDayAssignments:', error);
    throw error;
  }
};

export const delNotSchoolDayAssignment = async (id: number | string) => {
  try {
    const res = await api.delete(`/api/v1/not-school-days/assignments/${id}`);
    console.log('delNotSchoolDayAssignment response data:', res.data);
    return res.data;
  } catch (error) {
    console.error('Error in delNotSchoolDayAssignment:', error);
    throw error;
  }
};

// * LOG REQUESTS

type LogsQueryParams = {
  page?: number;
  pageSize?: number;
  search?: string;
  from?: string;
  to?: string;
};

export const getLogs = async (params?: LogsQueryParams) => {
  try {
    const res = await api.get('/api/v1/audit-logs', {
      params,
    });
    console.log('getLogs response data:', res.data);
    return res.data;
  } catch (error) {
    console.error('Error in getLogs:', error);
    throw error;
  }
};
