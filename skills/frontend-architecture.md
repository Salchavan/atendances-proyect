# Component Architecture

## Stack
- **React 19** + **TypeScript**
- **MUI v7** (`@mui/material`, `@mui/icons-material`, `@mui/x-charts`, `@mui/x-data-grid`, `@mui/x-date-pickers`)
- **Tailwind CSS v4** (via `@tailwindcss/vite`)
- **react-router v7**

## Component Patterns

### Functional Components with TS
```tsx
type Props = {
  label: string;
  onClick: () => void;
};

export const MyComponent: React.FC<Props> = ({ label, onClick }) => {
  return <div>{label}</div>;
};
```

### MUI Styling
Use `sx` prop for one-off styles, MUI theme for global tokens:
```tsx
<Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
  <Typography variant="body2" color="text.secondary">
    {text}
  </Typography>
</Box>
```

### Tailwind Usage (v4)
```tsx
<div className="flex gap-2 p-4">
  <span className="text-gray-600">{value}</span>
</div>
```

## Routing (`src/App.tsx`)

Routes are split by auth status:
- **Public**: `LoginLocal.tsx`, `PageError.tsx`
- **Private** (requires auth): `Home`, `Index`, `Log`, `Profile`, `Classrooms/`, `ControlPanel/`, `Statics/`, `config/`

## State Management

### Zustand Stores
- `src/store/UserStore.ts` — Auth data, user data, verification status
- `src/store/CachedStore.ts` — Alert messages, cached API data
- `src/store/Store.ts` — Legacy store (migrating away)

### Store Usage
```ts
const user = useUserStore((s) => s.userData);
const setAlert = useCachedStore((s) => s.setAlert);
```

## Key Conventions
- No static JSON imports — use dynamic `import()` as fallback
- Console.log for API logging with `[API]` prefix
- Components in `src/components/`, pages in `src/Pages/{public,private}/`
