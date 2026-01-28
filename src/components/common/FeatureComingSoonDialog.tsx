import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Chip,
  Box,
} from "@mui/material";
import type { SvgIconComponent } from "@mui/icons-material";

interface FeatureComingSoonDialogProps {
  readonly open: boolean;
  readonly onClose: () => void;
  readonly title: string;
  readonly description: string;
  readonly icon: SvgIconComponent;
  readonly actionLabel?: string;
}

export default function FeatureComingSoonDialog({
  open,
  onClose,
  title,
  description,
  icon: Icon,
  actionLabel = "Create New",
}: FeatureComingSoonDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ pb: 1 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Typography variant="h6" fontWeight="bold">
            {title}
          </Typography>
          <Chip
            label="Coming Soon"
            color="primary"
            size="small"
            variant="outlined"
          />
        </Box>
      </DialogTitle>
      <DialogContent dividers>
        <Box sx={{ py: 2, textAlign: "center" }}>
          <Icon sx={{ fontSize: 64, color: "text.disabled", mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            Module Under Construction
          </Typography>
          <Typography color="text.secondary" sx={{ maxWidth: 400, mx: "auto" }}>
            {description}
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose}>Close</Button>
        <Button variant="contained" disabled>
          {actionLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
