import { Box, Typography } from "@mui/material";
import { ReactNode } from "react";

interface PageHeaderProps {
  readonly title: string;
  readonly description?: string;
  readonly children?: ReactNode;
}

/**
 * Standardized header component for all pages.
 * Displays title, description, and optional right-aligned actions (children).
 */
export default function PageHeader({
  title,
  description,
  children,
}: PageHeaderProps) {
  return (
    <Box
      sx={{
        mb: 4,
        display: "flex",
        flexDirection: { xs: "column", sm: "row" },
        justifyContent: "space-between",
        alignItems: { xs: "flex-start", sm: "center" },
        gap: 2,
      }}
    >
      <Box>
        <Typography
          variant="h4"
          component="h1"
          sx={{ fontWeight: 700, mb: 1, color: "text.primary" }}
        >
          {title}
        </Typography>
        {description && (
          <Typography variant="body1" color="text.secondary">
            {description}
          </Typography>
        )}
      </Box>
      {children && (
        <Box sx={{ display: "flex", gap: 2, alignSelf: { xs: "stretch", sm: "center" } }}>
          {children}
        </Box>
      )}
    </Box>
  );
}
