# Project Overview

## Tech Stack
- **Runtime**: Bun
- **Framework**: React 19 + Vite
- **Language**: TypeScript
- **UI**: MUI v7 + Tailwind CSS v4
- **Data Fetching**: @tanstack/react-query v5 + Axios
- **State**: Zustand v5
- **Routing**: react-router v7

## Project Structure
```
src/
├── api/          # Axios client, endpoint functions, response types
├── components/   # Reusable UI components
├── data/         # JSON files for offline/fallback
├── hooks/        # TanStack Query hooks (useStudents, useUsers, etc.)
├── Pages/
│   ├── private/  # Authenticated pages (Home, Log, Profile, etc.)
│   └── public/   # Public pages (LoginLocal, PageError)
├── store/        # Zustand stores (UserStore, CachedStore, Store)
├── types/        # TypeScript type definitions
├── utils/        # Utility functions
└── App.tsx       # Root component with routes
```

## Available Scripts
| Command | Description |
|---------|-------------|
| `bun run dev` | Start Vite dev server |
| `bun run build` | TypeScript check + Vite build |
| `bun run lint` | ESLint check |
| `bun run preview` | Preview production build |
| `bun run deploy` | Deploy to GitHub Pages |

## API
Backend at `https://asistenciaescuela.onrender.com`. Docs in `bacd-docs/`.

## Key Architecture Decisions
- API-first with JSON fallback: try API, catch → dynamic import JSON
- Lazy auth token: read from Zustand store in Axios interceptor
- Login response shape differs between staff (`user` field) and preceptor (`preceptor` field)
- All hooks use 5-minute stale time

## Environment
No `.env` file — API base URL is hardcoded in `src/api/client.ts`.
