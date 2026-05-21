import axios, { AxiosError } from 'axios';
import { useUserStore } from '../store/UserStore';

const URL = 'https://asistenciaescuela.onrender.com';

export const api = axios.create({
  baseURL: URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
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
  (response) => {
    console.log(
      `[API] ${response.config?.method?.toUpperCase()} ${response.config?.url} → ${response.status}`
    );
    return response;
  },
  (error: AxiosError) => {
    const status = error.response?.status ?? 'NO_RESPONSE';
    const url = error.config?.url ?? 'unknown';
    console.log(
      `[API] ${error.config?.method?.toUpperCase()} ${url} → ERROR ${status}`,
      error.message
    );
    return Promise.reject(error);
  }
);

function withLog<T>(fn: () => Promise<T>, label: string): Promise<T> {
  return fn()
    .then((data) => {
      console.log(`[API] ${label} → OK`);
      return data;
    })
    .catch((err: AxiosError) => {
      const status = err.response?.status ?? err.code ?? 'UNKNOWN';
      console.log(`[API] ${label} → ERROR ${status}`);
      throw err;
    });
}

/* ─── Auth ─────────────────────────────────────────── */

export const loginStaff = async (data: { dni: string; password: string }) =>
  withLog(
    () =>
      api
        .post('/api/v1/auth/staff/login', data)
        .then((r) => r.data as LoginStaffResponse),
    'loginStaff'
  );

export const loginPreceptor = async (data: { dni: string; password: string }) =>
  withLog(
    () =>
      api
        .post('/api/v1/auth/preceptor/login', data)
        .then((r) => r.data as LoginPreceptorResponse),
    'loginPreceptor'
  );

export const refreshToken = async (refreshToken: string) =>
  withLog(
    () =>
      api
        .post('/api/v1/auth/refresh', { refreshToken })
        .then((r) => r.data as RefreshTokenResponse),
    'refreshToken'
  );

export const logout = async (refreshToken?: string) =>
  withLog(
    () =>
      api
        .post('/api/v1/auth/logout', refreshToken ? { refreshToken } : {})
        .then((r) => r.data),
    'logout'
  );

/* ─── Staff ────────────────────────────────────────── */

export const getStaffList = async () =>
  withLog(
    () =>
      api
        .get('/api/v1/staff')
        .then((r) => r.data),
    'getStaffList'
  );

/* ─── Students ─────────────────────────────────────── */

export const getStudents = async (params?: {
  page?: number;
  pageSize?: number;
  q?: string;
  classroomId?: number;
  active?: boolean;
}) =>
  withLog(
    () =>
      api
        .get('/api/v1/students', { params })
        .then((r) => r.data as StudentsListResponse),
    'getStudents'
  );

/* ─── Classrooms ───────────────────────────────────── */

export const getClassrooms = async (params?: {
  page?: number;
  pageSize?: number;
  year?: number;
  shift?: string;
  active?: boolean;
}) =>
  withLog(
    () =>
      api
        .get('/api/v1/classrooms', { params })
        .then((r) => r.data as ClassroomsListResponse),
    'getClassrooms'
  );

/* ─── Attendance ───────────────────────────────────── */

export const getAttendances = async (params?: {
  page?: number;
  pageSize?: number;
  studentId?: number;
  classroomId?: number;
  status?: string;
  from?: string;
  to?: string;
  date?: string;
}) =>
  withLog(
    () =>
      api
        .get('/api/v1/attendance', { params })
        .then((r) => r.data as AttendanceListResponse),
    'getAttendances'
  );

/* ─── Stats ────────────────────────────────────────── */

export const getStatsOptions = async () =>
  withLog(
    () =>
      api
        .get('/api/v1/stats/options')
        .then((r) => r.data),
    'getStatsOptions'
  );

/* ─── Response Types ───────────────────────────────── */

export interface LoginStaffResponse {
  success: boolean;
  message: string;
  token: string;
  refreshToken: string;
  refreshExpiresAt: string;
  user: {
    id: number;
    dni: string;
    first_name: string;
    last_name: string;
    role: string;
  };
}

export interface LoginPreceptorResponse {
  success: boolean;
  message: string;
  token: string;
  refreshToken: string;
  refreshExpiresAt: string;
  preceptor: {
    id: number;
    dni: string;
  };
}

export interface RefreshTokenResponse {
  success: boolean;
  message: string;
  token: string;
  refreshToken: string;
  refreshExpiresAt: string;
}

export interface StudentsListResponse {
  success: boolean;
  message: string;
  students: Array<{
    id: number;
    first_name: string;
    last_name: string;
    username: string;
    classroom_id: number;
    active: boolean;
    createdAt: string;
    updatedAt: string;
  }>;
  pagination: {
    total: number;
    page: number;
    pageSize: number;
  };
}

export interface ClassroomsListResponse {
  success: boolean;
  message: string;
  classrooms: Array<{
    id: number;
    year: number;
    division: string;
    shift: string;
    active: boolean;
    studentCount?: number;
  }>;
  pagination: {
    total: number;
    page: number;
    pageSize: number;
  };
}

export interface AttendanceListResponse {
  success: boolean;
  message: string;
  data: Array<{
    id: number;
    student_id: number;
    classroom_id: number;
    date: string;
    status: string;
    checkInTime?: string;
    checkOutTime?: string;
    fraction: number;
    absenceFraction: number;
    notes?: string;
  }>;
  pagination: {
    total: number;
    page: number;
    pageSize: number;
  };
}
