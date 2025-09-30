import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App.tsx';
import './tailwindStyles.css';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { useStore } from './Store/Store';
import { getTheme } from './theme';

// Small wrapper to provide MUI theme based on global store
const ThemedRoot = () => {
  // Using hook inside component is fine; main.tsx is part of app tree
  const mode = useStore((s) => s.themeMode);
  const theme = getTheme(mode);
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <App />
    </ThemeProvider>
  );
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemedRoot />
  </StrictMode>
);
