import { createTheme, ThemeOptions } from '@mui/material/styles';
import { Inter } from 'next/font/google';

export const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
});

/**
 * Status palette item interface for consistent color definitions
 */
interface StatusPaletteItem {
  readonly bg: string;
  readonly text: string;
  readonly chart: string;
}

/**
 * Transfer status palette item (no chart color needed)
 */
interface TransferPaletteItem {
  readonly bg: string;
  readonly text: string;
}

/**
 * Stats palette item interface
 */
interface StatsPaletteItem {
  readonly bg: string;
  readonly icon: string;
}

/**
 * Custom palette interface for type safety
 */
interface CustomPalette {
  readonly text: { readonly muted: string };
  readonly status: {
    readonly lowStock: StatusPaletteItem;
    readonly inStock: StatusPaletteItem;
    readonly warning: StatusPaletteItem;
  };
  readonly stats: {
    readonly blue: StatsPaletteItem;
    readonly purple: StatsPaletteItem;
    readonly green: StatsPaletteItem;
    readonly red: StatsPaletteItem;
    readonly yellow: StatsPaletteItem;
    readonly greenDark: string;
    readonly yellowDark: string;
    readonly redDark: string;
    readonly blueDark: string;
  };
  readonly transfer: {
    readonly inTransit: TransferPaletteItem;
    readonly completed: TransferPaletteItem;
    readonly pending: TransferPaletteItem;
    readonly cancelled: TransferPaletteItem;
  };
}

/**
 * Custom palette colors for status indicators and stat cards
 */
const customPalette: CustomPalette = {
  text: {
    muted: '#9CA3AF', // Gray-400 for captions/secondary labels
  },
  status: {
    lowStock: { bg: '#FFEBEE', text: '#C62828', chart: '#EF5350' }, // Critical - Soft Red
    inStock: { bg: '#E8F5E9', text: '#1B5E20', chart: '#66BB6A' }, // Healthy - Soft Green
    warning: { bg: '#FFF3E0', text: '#E65100', chart: '#FFA726' }, // Low Stock - Soft Orange
  },
  stats: {
    blue: { bg: '#DBEAFE', icon: '#1976D2' },
    purple: { bg: '#F3E8FF', icon: '#9333EA' },
    green: { bg: '#DCFCE7', icon: '#2E7D32' },
    red: { bg: '#FEE2E2', icon: '#DC2626' },
    yellow: { bg: '#FEF9C3', icon: '#854D0E' },
    // Dark mode variants
    greenDark: 'rgba(46, 125, 50, 0.2)',
    yellowDark: 'rgba(237, 108, 2, 0.2)',
    redDark: 'rgba(211, 47, 47, 0.2)',
    blueDark: 'rgba(2, 136, 209, 0.2)',
  },
  transfer: {
    inTransit: { bg: '#DBEAFE', text: '#1D4ED8' },
    completed: { bg: '#DCFCE7', text: '#166534' },
    pending: { bg: '#FEF3C7', text: '#92400E' },
    cancelled: { bg: '#FEE2E2', text: '#991B1B' },
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
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          scrollbarColor: "#6b6b6b #2b2b2b",
          "&::-webkit-scrollbar, & *::-webkit-scrollbar": {
            backgroundColor: "#2b2b2b",
          },
          "&::-webkit-scrollbar-thumb, & *::-webkit-scrollbar-thumb": {
            borderRadius: 8,
            backgroundColor: "#6b6b6b",
            minHeight: 24,
            border: "3px solid #2b2b2b",
          },
          "&::-webkit-scrollbar-thumb:focus, & *::-webkit-scrollbar-thumb:focus": {
            backgroundColor: "#959595",
          },
          "&::-webkit-scrollbar-thumb:active, & *::-webkit-scrollbar-thumb:active": {
            backgroundColor: "#959595",
          },
          "&::-webkit-scrollbar-thumb:hover, & *::-webkit-scrollbar-thumb:hover": {
            backgroundColor: "#959595",
          },
          "&::-webkit-scrollbar-corner, & *::-webkit-scrollbar-corner": {
            backgroundColor: "#2b2b2b",
          },
        },
      },
    },
    MuiModal: {
      defaultProps: {
        disableScrollLock: true,
      },
    },
    MuiMenu: {
      defaultProps: {
        disableScrollLock: true,
      },
    },
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
export type { CustomPalette };
export default theme;
