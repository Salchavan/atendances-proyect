import axios from 'axios';
import { useUserStore } from '../store/UserStore';

const URL = 'https://asistenciaescuela.onrender.com';
const token = useUserStore.getState().userAuthData?.authToken;

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

export const getAttendancesByDate = async (from: string, to: string) => {
  try {
    const res = await api.get(
      `/api/v1/attendance?from=${from}&to=${to}&page=1&pageSize=100`
    );
    return res.data;
  } catch (error) {
    console.error('Error in getMonthAttendances:', error);
    throw error;
  }
};
