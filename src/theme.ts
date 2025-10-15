import { createTheme, type ThemeOptions } from '@mui/material/styles';
import { useStore } from './store/Store';

export type AppMode = 'light' | 'dark';

// Simple set of tokens you can edit to personalize your palette
type PaletteTokens = {
  primary: string;
  secondary: string;
  background: string; // background.default
  surface: string; // background.paper
  textPrimary: string;
  success: string;
  error: string;
  warning: string;
};

const lightTokens: PaletteTokens = {
  primary: '#1F4E8C',
  secondary: '#42A5F5',
  background: '#EAEAEA',
  surface: '#F2F2F2',
  textPrimary: '#333333',
  success: '#3BA55C',
  error: '#D93025',
  warning: '#FFB300',
};

const darkTokens: PaletteTokens = {
  primary: '#42A5F5',
  secondary: '#1F4E8C',
  background: '#121212',
  surface: '#333333',
  textPrimary: '#FFFFFF',
  success: '#81C784',
  error: '#EF5350',
  warning: '#FFB300',
};

// If you want to override any token at runtime, pass here
export type ThemeOverrides = Partial<Record<AppMode, Partial<PaletteTokens>>>;

export const getTheme = (mode: AppMode, overrides?: ThemeOverrides) => {
  const tokens = mode === 'light' ? { ...lightTokens } : { ...darkTokens };
  const custom = overrides?.[mode];
  if (custom) Object.assign(tokens, custom);

  // read current font from store when building the theme
  let font =
    'Poppins, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif';
  try {
    // This will work at runtime when called inside React tree
    font = useStore.getState().fontFamily || font;
  } catch {}

  const options: ThemeOptions = {
    palette: {
      mode,
      primary: { main: tokens.primary },
      secondary: { main: tokens.secondary },
      background: { default: tokens.background, paper: tokens.surface },
      text: { primary: tokens.textPrimary },
      success: { main: tokens.success },
      error: { main: tokens.error },
      warning: { main: tokens.warning },
    },
    // Default app typography from selected font
    typography: { fontFamily: font },
    shape: { borderRadius: 10 },
    components: {
      MuiButton: {
        defaultProps: { disableElevation: true },
      },
      MuiCard: {
        styleOverrides: {
          root: { borderRadius: 12 },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: { fontWeight: 500 },
        },
      },
      // Do NOT change fonts for charts, data grid, and calendar:
      // 1) MUI X Charts (BarChart): override container and text to use system font
      MuiSvgIcon: {},

      // 3) Calendar: scope specific classes to system font
      MuiTypography: {
        styleOverrides: {
          root: {
            '&.calendar-header, &.calendar-day-number, &.calendar-absences-number':
              {
                fontFamily:
                  'system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif',
              },
          },
        },
      },
    },
  };

  return createTheme(options);
};

// Helper: quick way to supply ad-hoc overrides
export const withThemeOverrides = (
  mode: AppMode,
  partial: Partial<PaletteTokens>
) => getTheme(mode, { [mode]: partial });
