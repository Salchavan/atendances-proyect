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

export const delStudents = async (id: number[]) => {
  try {
    const res = await api.delete('/api/v1/students', {
      data: { id },
    });
    console.log('delStudents response data:', res.data);
    return res.data;
  } catch (error) {
    console.error('Error in delStudents:', error);
    throw error;
  }
};

// * STATS REQUESTS

type StatsTarget = {
  type: 'STUDENT' | 'CLASSROOM' | 'YEAR' | 'SHIFT';
  id: number;
};

export const getStats = async (data: StatsTarget) => {
  try {
    const res = await api.post('/api/v1/stats/query', {
      target: { type: data.type, id: data.id },
    });
    console.log('getMetrics response data:', res.data);
    return res.data;
  } catch (error) {
    console.error('Error in getMetrics:', error);
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

export const delClassrooms = async (id: number[]) => {
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
