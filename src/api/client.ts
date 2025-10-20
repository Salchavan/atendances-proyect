import axios from 'axios';
import { useUserStore } from '../store/UserStore';
import { useMutation, useQuery } from '@tanstack/react-query';
import type {
  UseMutationOptions,
  UseQueryOptions,
  QueryKey,
} from '@tanstack/react-query';

const URL = 'https://asistenciaescuela.onrender.com/api/v1';

// Centralized Axios instance
export const api = axios.create({
  // baseURL can be set per environment if needed
  // baseURL: 'https://asistenciaescuela.onrender.com/api/v1',
  timeout: 15000,
});

// Attach token if available
api.interceptors.request.use((config) => {
  const { authToken } = useUserStore.getState();
  if (authToken) {
    config.headers = config.headers || {};
    (config.headers as any)['Authorization'] = `Bearer ${authToken}`;
  }
  // Do not attach custom role headers. Role is inferred from JWT on backend.
  // Dev log: request method, url, params and payload
  try {
    // WARNING: This may include sensitive fields (e.g., password). Remove in production.
    console.log('[API Request]', {
      method: (config.method || 'GET').toUpperCase(),
      url: config.url,
      params: config.params,
      data: config.data,
    });
  } catch {}
  return config;
});

// Handle token expiration or 401s
api.interceptors.response.use(
  (response) => {
    // Dev log: response status and data
    try {
      console.log('[API Response]', {
        url: response.config?.url,
        status: response.status,
        data: response.data,
      });
    } catch {}
    return response;
  },
  (error) => {
    const status = error?.response?.status;
    // Dev log: error details
    try {
      console.error('[API Error]', {
        url: error?.config?.url,
        status,
        data: error?.response?.data,
        message: error?.message,
      });
    } catch {}
    if (status === 401) {
      const { logOut } = useUserStore.getState();
      logOut();
    }
    return Promise.reject(error);
  }
);

export default api;

// --------------------------
// TanStack Query helpers
// --------------------------

export type RoleOption = 'ADMIN' | 'STAFF' | 'PRECEPTOR';

// Generic GET hook
export function useApiGet<T = any>(
  key: QueryKey,
  url: string,
  params?: Record<string, any>,
  options?: UseQueryOptions<T, any, T>
) {
  return useQuery<T, any, T>({
    queryKey: key,
    queryFn: async () => {
      const res = await api.get(url, { params });
      return res.data as T;
    },
    ...options,
  });
}

// Generic mutation hook for non-GET
export function useApiMutation<T = any, TVariables = any>(
  method: 'post' | 'put' | 'patch' | 'delete',
  url: string,
  options?: UseMutationOptions<T, any, TVariables>
) {
  return useMutation<T, any, TVariables>({
    mutationFn: async (variables: any) => {
      // For delete, variables may be params; others send body
      if (method === 'delete') {
        const res = await api.delete(url, { data: variables });
        return res.data as T;
      }
      const res = await (api as any)[method](url, variables);
      return res.data as T;
    },
    ...options,
  });
}

// Fetch staff profile by ID (plain function)
export async function getStaffById(id: string | number) {
  const res = await api.get(`${URL}/staff/${id}`);
  return res.data;
}

// React Query hook for staff profile (optional usage)
export function useStaffById<T = any>(
  id: string | number,
  options?: UseQueryOptions<T, any, T>
) {
  return useQuery<T, any, T>({
    queryKey: ['staff', id],
    queryFn: async () => {
      const res = await api.get(`${URL}/staff/${id}`);
      return res.data as T;
    },
    enabled: !!id,
    ...options,
  });
}

// Auth login hooks
type LoginVars = { dni: string; password: string };
type LoginResp = any; // shape defined by backend: { success, token, user }

export function useAuthLogin(role: 'STAFF' | 'PRECEPTOR') {
  return useMutation<LoginResp, any, LoginVars>({
    mutationKey: ['login', role],
    mutationFn: async ({ dni, password }) => {
      const url =
        role === 'PRECEPTOR'
          ? `${URL}/auth/preceptor/login`
          : `${URL}/auth/staff/login`;
      const res = await api.post(url, { dni, password });
      return res.data as LoginResp;
    },
  });
}
