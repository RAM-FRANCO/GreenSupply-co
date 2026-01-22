import { Box, CircularProgress, Typography } from "@mui/material";

interface LoadingStateProps {
  readonly message?: string;
}

/**
 * Reusable loading state component with optional message
 */
export default function LoadingState({
  message = "Loading...",
}: LoadingStateProps) {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        minHeight: 400,
        gap: 2,
      }}
    >
      <CircularProgress size={40} />
      <Typography variant="body2" color="text.secondary">
        {message}
      </Typography>
    </Box>
  );
}
