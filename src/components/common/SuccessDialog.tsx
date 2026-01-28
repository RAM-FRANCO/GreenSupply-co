import {
  Dialog,
  DialogContent,
  DialogActions,
  Button,
  Typography,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

interface SuccessDialogProps {
  readonly open: boolean;
  readonly onClose: () => void;
  readonly title?: string;
  readonly message?: string;
  readonly buttonText?: string;
}

export default function SuccessDialog({
  open,
  onClose,
  title = "Success",
  message = "Operation completed successfully.",
  buttonText = "Done",
}: SuccessDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogContent sx={{ textAlign: "center", py: 4 }}>
        <CheckCircleIcon color="success" sx={{ fontSize: 64, mb: 2 }} />
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          {title}
        </Typography>
        <Typography color="text.secondary">{message}</Typography>
      </DialogContent>
      <DialogActions sx={{ justifyContent: "center", pb: 3 }}>
        <Button variant="contained" onClick={onClose}>
          {buttonText}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
