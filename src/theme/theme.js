import { createTheme } from '@mui/material/styles';
import { Inter } from 'next/font/google';

export const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
});

const theme = createTheme({
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
});

export default theme;
