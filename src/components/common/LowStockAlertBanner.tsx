import { Alert, AlertTitle, Box, type SxProps, type Theme } from "@mui/material";
import { Warning as WarningIcon } from "@mui/icons-material";
import type { ReactNode } from "react";

interface LowStockAlertBannerProps {
  readonly count: number;
  readonly action?: ReactNode;
  readonly sx?: SxProps<Theme>;
}

export default function LowStockAlertBanner({
  count,
  action,
  sx,
}: LowStockAlertBannerProps) {
  if (count <= 0) return null;

  return (
    <Alert
      severity="error"
      icon={<WarningIcon fontSize="inherit" />}
      sx={{
        mb: { xs: 2, md: 4 },
        alignItems: { xs: "flex-start", sm: "center" },
        py: { xs: 1.5, sm: 2 },
        "& .MuiAlert-icon": {
          fontSize: { xs: "1.25rem", sm: "1.5rem" },
          pt: { xs: 0.25, sm: 0 },
        },
        "& .MuiAlert-message": { width: "100%" },
        ...sx,
      }}
    >
      <Box
        sx={{
          width: "100%",
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          alignItems: { xs: "flex-start", sm: "center" },
          justifyContent: "space-between",
          gap: { xs: 2, sm: 3 },
        }}
      >
        <Box sx={{ flex: 1 }}>
          <AlertTitle
            sx={{
              fontSize: { xs: "0.875rem", sm: "1rem" },
              mb: 0.5,
              fontWeight: 600,
            }}
          >
            Attention Needed: Low Stock Alert
          </AlertTitle>
          <Box
            component="span"
            sx={{
              fontSize: { xs: "0.8125rem", sm: "0.875rem" },
              display: "block",
            }}
          >
            There are <strong>{count} items</strong> currently below their reorder
            threshold. Immediate action is recommended.
          </Box>
        </Box>
        {action && (
          <Box sx={{ flexShrink: 0, width: { xs: "100%", sm: "auto" } }}>
            {action}
          </Box>
        )}
      </Box>
    </Alert>
  );
}
