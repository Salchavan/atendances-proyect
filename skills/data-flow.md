# Data Flow Patterns

## Auth Flow
1. User submits credentials in `LoginLocal.tsx`
2. `useLogin()` mutation calls `loginStaff()` or `loginPreceptor()` based on role
3. On success: store token, refreshToken, user data in `useUserStore`
4. Set `userVerified = true`, navigate to `/home`
5. On error: show alert via `useCachedStore.setAlert()`

## API Request Flow
1. Axios interceptor reads `authToken` from `useUserStore`
2. Adds `Authorization: Bearer <token>` header
3. Response interceptor logs `[API] METHOD /path → STATUS`
4. Error interceptor logs `[API] METHOD /path → ERROR STATUS`
5. `withLog()` wrapper logs `[API] label → OK` or `[API] label → ERROR status`

## Data Fetching Flow
1. Component calls hook (e.g. `useStudents()`)
2. Hook's `queryFn` tries `getStudents()` from client
3. If API succeeds: return `res.students`
4. If API fails (catch): dynamic `import('../data/Students.json')` as fallback
5. Hook returns cached data for 5 minutes (`staleTime: 1000 * 60 * 5`)

## Store Architecture
```
useUserStore
  ├── userData: { id, dni, first_name, last_name, email, role }
  ├── userAuthData: { authToken, refreshToken, refreshExpiresAt }
  └── userVerified: boolean

useCachedStore
  ├── alert: { type: 'success'|'error'|'warning', text: string } | null
  └── dataCache: Record<string, any>

Store (legacy)
  └── perfilUserSelected: ... (migrating away)
```

## Key Rules
- Never import JSON statically — always use dynamic `import()` with fallback
- Every API function must log success with status or error with code
- Auth token is read lazily from store (not stored in module-level variable)
- All data endpoints require `Authorization` header
