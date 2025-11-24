# Attendance Management System · Project Documentation

> Comprehensive reference for maintainers and contributors. Use this document as the single source of truth for project goals, architecture decisions, code structure, and operational workflows.

## Table of Contents

1. [Overview](#overview)
2. [Quick Start](#quick-start)
3. [Repository Layout](#repository-layout)
4. [Technology Stack](#technology-stack)
5. [Architecture & Data Flow](#architecture--data-flow)
6. [API Layer](#api-layer)
7. [State Management](#state-management)
8. [Feature Modules & Pages](#feature-modules--pages)
9. [Shared Components](#shared-components)
10. [Styling System](#styling-system)
11. [Utilities & Hooks](#utilities--hooks)
12. [Build, Scripts & Deployment](#build-scripts--deployment)
13. [Troubleshooting & Developer Tips](#troubleshooting--developer-tips)
14. [Future Enhancements](#future-enhancements)

---

## Overview

The Attendance Management System is a React + TypeScript SPA that centralizes attendance tracking, analytics, and administrative workflows for schools. It communicates with the `https://asistenciaescuela.onrender.com` backend via a typed Axios client, renders analytics with Material UI + MUI X Charts, and manages state through Zustand + TanStack Query.

Core goals:

- Replace static JSON mock data with live API integrations for every visualization.
- Offer dashboards (Dynamic Graph, Statics, Multi-Chart) that summarize attendance, absence trends, and rankings.
- Provide administrative CRUD panels for classrooms, students, years, divisions, and staff accounts.
- Maintain a responsive, theme-aware UI with tailored typography and accessibility options.

## Quick Start

```bash
git clone https://github.com/Salchavan/atendances-proyect.git
cd atendances-proyect
npm install
npm run dev   # start Vite dev server on http://localhost:5173
```

Environment defaults:

- Node.js 18+
- Browser support: evergreen desktop browsers (Chromium/Firefox/Edge) + recent mobile Chromium.

## Repository Layout

```
atendances-proyect/
├── public/                # Static assets (404.html, favicon, etc.)
├── src/
│   ├── api/               # Axios client + typed endpoints
│   ├── components/        # Reusable UI widgets (graphs, tables, modals, etc.)
│   ├── data/              # Temporary generators / mock data
│   ├── hooks/             # Custom hooks (debounce, calendar, etc.)
│   ├── Pages/             # Route-level views (Home, Config, ControlPanel, Statics...)
│   ├── store/             # Zustand stores (user auth, app preferences, caches)
│   ├── types/             # Shared TypeScript definitions
│   └── utils/             # Low-level helpers (fonts, calendars, logic)
├── tailwindStyles.css     # Tailwind layer declarations
├── theme.ts               # Custom Material UI theme tokens
├── vite.config.ts         # Build + dev server configuration
├── eslint.config.js       # Linting rules (flat config)
├── tsconfig*.json         # TS build + path aliases
├── package.json           # Scripts + dependencies
└── Docs.md / README.md    # Documentation
```

## Technology Stack

- **Framework:** React 18 (functional components, hooks)
- **Language:** TypeScript (strict-ish mode)
- **Routing:** react-router (nested routes per page)
- **State & Data:**
  - Zustand (`store/Store.ts`, `store/UserStore.ts`, `store/CachedStore.ts`)
  - TanStack Query for async caching and request lifecycle management
- **UI Layer:** Material UI (theme + components), TailwindCSS utilities, custom CSS modules
- **Visualization:** MUI X-Charts, custom SVG graphs (DynamicGraph, MultiChart)
- **Tables:** MUI DataGrid + Rsuite Table (legacy)
- **Build Tool:** Vite (esbuild dev server, Rollup build)
- **HTTP:** Axios with interceptors for auth, token refresh, and error handling

## Architecture & Data Flow

1. **Authentication:**

   - User credentials submitted via `loginStaff` / `loginPreceptor` endpoints within `src/api/client.ts`.
   - Access + refresh tokens persisted through `UserStore` with Zustand `persist` middleware.
   - Axios interceptors inject `Authorization: Bearer <token>` headers and log out on 401/403 responses.

2. **Data Fetching:**

   - TanStack Query hooks (e.g., `useQuery({ queryKey, queryFn })`) handle caching, retries, and background refetching.
   - Components such as `DynamicGraph`, `Statics`, `ControlPanel` rely on query hooks, not `useEffect`.

3. **State Synchronization:**

   - `Store.ts` manages global UI state: dialogs, theme, typography, selected profile, statics date range, special days.
   - `CachedStore.ts` centralizes toast/alert state for forms and dialogs.

4. **Rendering:**

   - Page components compose smaller UI widgets (charts, tables, modals). Each page has a `.logic.ts` sidecar when complex data transforms are needed.
   - Example: `src/components/DynamicGraph/DynamicGraph.logic.ts` transforms API student data into graph-friendly time series.

5. **Styling:**
   - Combined approach: MUI theme + component props for structure, Tailwind classes for utility spacing/typography.
   - Custom theme tokens defined in `theme.ts`; global fonts registered via `src/utils/fonts.ts` and `tailwindStyles.css`.

## API Layer

Defined in `src/api/client.ts`. Key characteristics:

- Reusable Axios instance with baseURL `https://asistenciaescuela.onrender.com` and 10s timeout.
- Automatic token injection + logout redirect (`window.location.href = '/atendances-proyect/login'`) when session expires.
- Endpoints grouped by domain:
  - **Auth:** `loginStaff`, `loginPreceptor`, `getUserInfo`
  - **Staff CRUD:** `getStaff`, `postStaff`, `putStaff`, `delStaff`
  - **Attendance:** `getAttendancesByDate`
  - **Students:** `getAllStudents`, `getStudentsBySearch`, `getStudentsByClassroom`, `getStudentById`, `postStudent`, `putStudent`, `delStudents`
  - **Enrollments:** `getAllEnrollments`, `getEnrollmentsByStudentId`, `postEnrollment`, `endEnrollment`
  - **Stats:** `getStatsOptions`, `getStats`, `compareStats`, `getStatsRankings`, `getStatsTimeseries`, `getStatsIntervals`, `getStatsDispersion`, `getStatsImprovements`
  - **Catalog:** `getClassrooms`, `postClassroom`, `delClassrooms`, `getDivisions`, `postDivision`, `delDivisions`, `getYears`, `postYear`, `delYears`
  - **Special Days:** `getNotSchoolDays`, `postNotSchoolDay`, `assignNotSchoolDay`, `delNotSchoolDay`, `getNotSchoolDayAssignments`, `delNotSchoolDayAssignment`
  - **Logs:** `getLogs`

### API Usage Guidelines

- Always access endpoints via the exported helpers to keep logging and headers consistent.
- Wrap mutations with TanStack Query’s `useMutation` to leverage optimistic updates and cache invalidation.
- Inspect server payloads: not every endpoint returns consistent keys (e.g., `students`, `data`, `list`). Helper utilities (`unwrapStudents`, etc.) normalize responses.

## State Management

### `store/UserStore.ts`

- Persists auth state (user profile, verification flag, auth tokens).
- Exposes `logOut`, `setUserData`, `setUserVerified`, `setUserAuthData` functions.
- All authentication-sensitive requests rely on this store for tokens.

### `store/Store.ts`

- Global UI preferences and cross-page data: modal dialogs, theme mode, font family, profile selection, statics date range, special dates.
- Persists only theme + font settings for lightweight localStorage footprint.

### `store/CachedStore.ts`

- Transient alert/toast state used across forms (AddYearForm, AddDivisionForm, AddCourseForm, etc.).
- Enables consistent success/error messaging without prop drilling.

### Interaction Pattern

1. Components read state via `useStore` or `useUserStore` selectors.
2. Actions (`setPerfilUserSelected`, `setSpecialDates`, `toggleThemeMode`) mutate state immutably using Zustand’s `set` function.
3. Stores are tree-shake friendly and typed for predictable usage in hooks and components.

## Feature Modules & Pages

### Home & Layout

- `Pages/Home.tsx` orchestrates global layout, sidebars (`AsideMenu`, `AsideEvents`), navbar, and page routing.
- `Pages/PageError.tsx` renders fallback UI for unknown routes or runtime boundary errors.

### Config Pages (`src/Pages/config/...`)

- **Config.tsx:** Entry with navigation list (General, Accessibility, Profile, About). Uses `ProfileSettingsModal` for user adjustments.
- **ConfigGeneral.tsx / ConfigAccessibility.tsx / ConfigProfile.tsx / ConfigAbout.tsx:** Manage theme, fonts, role info, and product notes.

### Control Panel (`src/Pages/ControlPanel`)

- Sub-pages for administrators: Students, Courses, Years, Divisions, Enrollments, Special Days.
- Each page leverages TanStack Query (lists) + Mutation (CRUD) with `useCachedStore` for alerts.
- `components/` contains forms and modals: `AddStudentForm`, `AddCourseForm`, `EditStudentForm`, etc.

### Statics (`src/Pages/Statics`)

- **Statics.tsx:** UI for advanced analytics (target pickers, rankings, future compare/timeseries panels).
- **Statics.logic.ts:** Hook that now sources live students + attendance via API, computes absence metrics per selected date range, and returns data for widgets.

### Profile (`src/Pages/profile`)

- Handles multi-entity profile views (Student, Staff, Classroom) with modular components such as `ClassroomProfileView`, `EmptyProfileState`, etc.

### Auth & Logs

- `Pages/Login.tsx`: credential flow hooking into `loginStaff` / `loginPreceptor` endpoints.
- `Pages/Log.tsx`: uses `getLogs` to display audit trail entries.

### Supporting Pages

- `Pages/IndexClassroomsPage.tsx`, `Pages/ControlPanelHome.tsx`, etc., provide quick navigation cards and aggregated data glimpses.

## Shared Components

- **Navbar / AsideMenu / AsideEvents:** Application chrome.
- **DataTable suite:** `DataTable.tsx`, `MuiDataTable.tsx`, `DataTableToolbar.tsx` share filtering, export, and virtualization logic.
- **Graph components:** DynamicGraph, MultiChart, and subcomponents (Chart, Toolbar, logic). These rely on live `getAllStudents` data and render curated insights.
- **Modals:** `CustomModal`, `ProfileSettingsModal`, `Notes` (for sticky note interactions), `FontPicker`, `ComandPaletteSearch` for keyboard navigation.
- **Calendar:** `Calendar.tsx` + `CalendarUI.tsx` + `DayCell.tsx` + `useCalendarLogic.ts` for attendance heatmap view.

## Styling System

- **Tailwind:** Enabled via `tailwindStyles.css` (using `@tailwind base/components/utilities`). Utility classes sprinkled across pages.
- **Material UI Theme:** Defined in `src/theme.ts`; sets primary palette, typography, component overrides. Applied at app root via ThemeProvider.
- **Fonts:** Managed through `src/utils/fonts.ts` and loaded globally to maintain consistent typography between Tailwind and MUI components.
- **Responsive Grid:** Most pages leverage CSS grid utility classes (`grid grid-cols-20`) combined with MUI’s Box/Stack.

## Utilities & Hooks

- `hooks/useDebouncedValue.ts`: Shared debounce logic for search inputs.
- `components/Calendar/utils.ts`: Date helpers (getMonday, fmtYmd, etc.) reused in stats and calendar modules.
- `Pages/ControlPanel/components/classroomUtils.ts`: Normalizes classroom/year/division combos.
- `data/gen/*.ts`: Random data generators (legacy, used during initial prototyping).
- `utils/fonts.ts`, `utils/imports.ts` (legacy placeholder), `components/SafeBoundary.tsx` (error boundary wrapper).

## Build, Scripts & Deployment

Common npm scripts from `package.json` (exact list may evolve):

- `npm run dev` – Start Vite dev server with hot module reload.
- `npm run build` – Type-check + bundle for production (Rollup output in `dist/`).
- `npm run preview` – Serve production build locally.
- `npm run lint` – ESLint via flat config.
- `npm run br-deploy` – Custom script used in CI/local to build and push GitHub Pages artifacts (runs build + deploy command sequence).

### Deployment Flow

1. Ensure `.env` (if any) is configured for production (API base URL is already remote).
2. Run `npm run build` and verify `dist/` contents locally.
3. For GitHub Pages, `npm run br-deploy` publishes to the `gh-pages` branch, making the app available at `https://salchavan.github.io/atendances-proyect/`.
4. Monitor console for Axios 4xx/5xx to confirm backend availability.

## Troubleshooting & Developer Tips

- **Auth Redirect Loops:** Confirm that `user-store` localStorage entry contains valid `authToken`. Clear storage and log in again if expired.
- **API 401/403:** Backend automatically logs out; check if refresh token logic needs extension.
- **Type Errors around API payloads:** Some endpoints return different root keys (`students`, `data`, `list`). Use helper unwrappers or standardize server responses.
- **UI Theme Issues:** Reset persisted preferences by deleting `app-preferences` in localStorage.
- **Date Range Widgets:** Statics page uses `selectedRange` from `Store.ts`. Reset by calling `setSelectedRange` or clearing persisted state.
- **Performance:** Prefer memoized selectors (`useStore((s) => s.prop)`) to prevent re-render storms.

## Future Enhancements

- Central guard/refresh token mechanism (currently just logs out on unauthorized).
- Dedicated testing strategy (unit tests for hooks + React Testing Library for critical components).
- Server-driven schema types (e.g., OpenAPI -> TypeScript) to avoid manual `any` types.
- Replace remaining mock data & `.json` files with live endpoints (in progress; Statics already migrated).
- Accessible keyboard navigation improvements for data tables and modals.

---

Last updated: 24 Nov 2025 · Maintainer: Salvador (@Salchavan)
