import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import theme from "@/theme/theme";
import DashboardLayout from "@/components/layout/DashboardLayout";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <DashboardLayout>
        <Component {...pageProps} />
      </DashboardLayout>
    </ThemeProvider>
  );
}
