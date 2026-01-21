import { Typography, Button, Paper } from "@mui/material";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import RefreshIcon from "@mui/icons-material/Refresh";

interface ErrorStateProps {
  readonly message?: string;
  readonly onRetry?: () => void;
}

/**
 * Reusable error state component with retry functionality
 */
export default function ErrorState({
  message = "Something went wrong. Please try again.",
  onRetry,
}: ErrorStateProps) {
  return (
    <Paper
      sx={{
        p: 6,
        textAlign: "center",
        bgcolor: "background.paper",
        borderRadius: 2,
      }}
    >
      <ErrorOutlineIcon
        sx={{
          fontSize: 64,
          color: "error.main",
          mb: 2,
        }}
      />
      <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
        Unable to Load Data
      </Typography>
      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ mb: 3, maxWidth: 400, mx: "auto" }}
      >
        {message}
      </Typography>
      {onRetry && (
        <Button
          variant="contained"
          startIcon={<RefreshIcon />}
          onClick={onRetry}
          sx={{ mt: 1 }}
        >
          Try Again
        </Button>
      )}
    </Paper>
  );
}
