# API Integration

Base URL: `https://asistenciaescuela.onrender.com`

## Client (`src/api/client.ts`)

- Axios instance with automatic Bearer token from `useUserStore`
- Response interceptor logs every request status
- `withLog()` wrapper logs success/error for each endpoint

### Auth Endpoints

| Function | Method | Path | Auth? | Response Shape |
|----------|--------|------|-------|---------------|
| `loginStaff` | POST | `/api/v1/auth/staff/login` | No | `{ token, refreshToken, refreshExpiresAt, user: { id, dni, first_name, last_name, role } }` |
| `loginPreceptor` | POST | `/api/v1/auth/preceptor/login` | No | `{ token, refreshToken, refreshExpiresAt, preceptor: { id, dni } }` |
| `refreshToken` | POST | `/api/v1/auth/refresh` | No | `{ token, refreshToken, refreshExpiresAt }` |
| `logout` | POST | `/api/v1/auth/logout` | Yes* | `{ success, message }` |

### Data Endpoints

| Function | Method | Path | Response Shape |
|----------|--------|------|---------------|
| `getStaffList` | GET | `/api/v1/staff` | `{ staff: [...] }` |
| `getStudents` | GET | `/api/v1/students` | `{ students: [...], pagination: {...} }` |
| `getClassrooms` | GET | `/api/v1/classrooms` | `{ classrooms: [...], pagination: {...} }` |
| `getAttendances` | GET | `/api/v1/attendance` | `{ data: [...], pagination: {...} }` |
| `getStatsOptions` | GET | `/api/v1/stats/options` | - |

All data endpoints require `Authorization: Bearer <token>`.

### Error Handling

All API functions throw on error. Use `try/catch` in hooks with JSON fallback:
```ts
try {
  const res = await getStudents();
  return res.students;
} catch {
  const mod = await import('../data/Students.json');
  return mod.default || [];
}
```

### Response Types

Defined in `src/api/client.ts`:
- `LoginStaffResponse`, `LoginPreceptorResponse`, `RefreshTokenResponse`
- `StudentsListResponse`, `ClassroomsListResponse`, `AttendanceListResponse`

## Hooks (`src/hooks/`)

All hooks use `@tanstack/react-query` with `staleTime: 5 min` and JSON fallback:

| Hook | Key | Returns |
|------|-----|---------|
| `useLogin()` | mutation | `useMutation` with `onSuccess`/`onError` |
| `useStudents()` | `['students']` | `StudentRec[]` |
| `useClassrooms()` | `['classrooms']` | `ClassroomItem[]` |
| `useUsers()` | `['users']` | `UserRecord[]` |
| `useStaticsData()` | `['statics']` | - |
| `useStudentsForStatics()` | `['students','statics']` | `StudentRec[]` |

## JSON Fallback Pattern

Static JSON imports were removed. Each hook tries the API first, then falls back to dynamic `import()`:
```ts
queryFn: async () => {
  try {
    const res = await getStudents();
    return res.students;
  } catch {
    const mod = await import('../data/Students.json');
    return mod.default || [];
  }
}
```

JSON files remain at `src/data/*.json` for offline development.
