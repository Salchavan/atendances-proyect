import axios from 'axios';

const URL = 'https://asistenciaescuela.onrender.com';

// Centralized Axios instance
export const api = axios.create({
  // baseURL can be set per environment if needed
  baseURL: URL,
  timeout: 7000,
});

export const loginStaff = async (data: { dni: string; password: string }) => {
  const response = await api.post('/api/v1/auth/staff/login', data);
  console.log('loginStaff response data:', response.data);
  return response.data;
};

export const loginPreceptor = async (data: {
  dni: string;
  password: string;
}) => {
  const response = await api.post('/api/v1/auth/preceptor/login', data);
  console.log('loginPreceptor response data:', response.data);
  return response.data;
};
