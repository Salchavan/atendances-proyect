import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App.tsx';
import './tailwindStyles.css';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useStore } from './store/Store';
import { getTheme } from './theme';

// Small wrapper to provide MUI theme based on global store
const ThemedRoot = () => {
  // Using hook inside component is fine; main.tsx is part of app tree
  const mode = useStore((s) => s.themeMode);
  const theme = getTheme(mode);
  const queryClient = new QueryClient();
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <App />
      </ThemeProvider>
    </QueryClientProvider>
  );
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemedRoot />
  </StrictMode>
);
