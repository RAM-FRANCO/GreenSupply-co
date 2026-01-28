import { Box, Skeleton, Typography } from "@mui/material";

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
        width: "100%",
        maxWidth: 600,
        mx: "auto",
        p: 2
      }}
    >
      {/* Generic Skeleton Card Layout */}
      <Skeleton variant="rectangular" width="100%" height={200} sx={{ borderRadius: 2 }} />
      <Box sx={{ width: "100%", mt: 2 }}>
          <Skeleton variant="text" width="60%" height={32} />
          <Skeleton variant="text" width="90%" />
          <Skeleton variant="text" width="80%" />
      </Box>
      <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
        {message}
      </Typography>
    </Box>
  );
}
