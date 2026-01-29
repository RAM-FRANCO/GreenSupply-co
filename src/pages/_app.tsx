import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import theme from "@/theme/theme";
import DashboardLayout from "@/components/layout/DashboardLayout";
import QueryProvider from "@/components/providers/QueryProvider";
import ChartRegistry from "@/components/dashboard/ChartRegistry";
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <QueryProvider>
      <ChartRegistry />
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <DashboardLayout>
            <Component {...pageProps} />
          </DashboardLayout>
        </ThemeProvider>
      </LocalizationProvider>
    </QueryProvider>
  );
}
