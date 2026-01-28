import { Paper, Typography, Box } from "@mui/material";
import { ReactNode } from "react";

interface ChartCardProps {
  readonly title: string;
  readonly children: ReactNode;
  readonly height?: number | string;
}

/**
 * Reusable wrapper for chart components.
 * Provides consistent spacing, title styling, and container layout.
 */
export default function ChartCard({
  title,
  children,
  height = "100%",
}: ChartCardProps) {
  return (
    <Paper
      sx={{
        p: 3,
        height,
        display: "flex",
        flexDirection: "column",
        borderRadius: 3,
        border: 1,
        borderColor: "divider",
      }}
      elevation={0}
    >
      <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
        {title}
      </Typography>
      <Box sx={{ flexGrow: 1, minHeight: 0, width: "100%", height: "100%" }}>
        {children}
      </Box>
    </Paper>
  );
}
