import { createTheme, ThemeOptions } from '@mui/material/styles';
import { Inter } from 'next/font/google';

export const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
});

/**
 * Custom palette colors for status indicators and stat cards
 */
const customPalette = {
  text: {
    muted: '#9CA3AF', // Gray-400 for captions/secondary labels
  },
  status: {
    lowStock: { bg: '#FEE2E2', text: '#991B1B' },
    inStock: { bg: '#DCFCE7', text: '#166534' },
  },
  stats: {
    blue: { bg: '#DBEAFE', icon: '#1976D2' },
    purple: { bg: '#F3E8FF', icon: '#9333EA' },
    green: { bg: '#DCFCE7', icon: '#2E7D32' },
    red: { bg: '#FEE2E2', icon: '#DC2626' },
  },
};

const themeOptions: ThemeOptions = {
  typography: {
    fontFamily: inter.style.fontFamily,
  },
  palette: {
    primary: {
      main: '#2E7D32', // Leaf Green
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#37474F', // Deep Slate Blue
    },
    background: {
      default: '#F3F4F6',
      paper: '#FFFFFF',
    },
    error: {
      main: '#EF5350',
    },
    text: {
      primary: '#37474F',
      secondary: '#6B7280',
    },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: '0.5rem',
          boxShadow:
            '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '0.375rem',
          textTransform: 'none',
          fontWeight: 500,
        },
      },
    },
  },
};

const theme = createTheme(themeOptions);

export { customPalette };
export default theme;
