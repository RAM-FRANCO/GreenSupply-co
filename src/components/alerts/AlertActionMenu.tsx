import { useState } from "react";
import {
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
} from "@mui/material";
import {
  MoreVert as MoreVertIcon,
  CheckCircle as CheckCircleIcon,
  Snooze as SnoozeIcon,
  Done as DoneIcon,
} from "@mui/icons-material";
import type { AlertStatusUpdate } from "@/schemas/alertSchema";

interface AlertActionMenuProps {
  readonly onUpdate: (update: AlertStatusUpdate) => Promise<void>;
}

export default function AlertActionMenu({ onUpdate }: AlertActionMenuProps) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [snoozeOpen, setSnoozeOpen] = useState(false);
  const [snoozeDuration, setSnoozeDuration] = useState("1d"); // 1d, 3d, 1w

  const handleOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleAction = async (status: "acknowledged" | "resolved") => {
    handleClose();
    await onUpdate({ status });
  };

  const handleSnoozeClick = () => {
    handleClose();
    setSnoozeOpen(true);
  };

  const handleSnoozeConfirm = async () => {
    const date = new Date();
    if (snoozeDuration === "1d") date.setDate(date.getDate() + 1);
    if (snoozeDuration === "3d") date.setDate(date.getDate() + 3);
    if (snoozeDuration === "1w") date.setDate(date.getDate() + 7);

    await onUpdate({
      status: "snoozed",
      snoozeUntil: date.toISOString(),
      notes: `Snoozed for ${snoozeDuration}`,
    });
    setSnoozeOpen(false);
  };

  return (
    <>
      <IconButton size="small" onClick={handleOpen}>
        <MoreVertIcon fontSize="small" />
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <MenuItem onClick={() => handleAction("acknowledged")}>
          <ListItemIcon>
            <CheckCircleIcon fontSize="small" color="primary" />
          </ListItemIcon>
          <ListItemText>Acknowledge</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleSnoozeClick}>
          <ListItemIcon>
            <SnoozeIcon fontSize="small" color="warning" />
          </ListItemIcon>
          <ListItemText>Snooze</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleAction("resolved")}>
          <ListItemIcon>
            <DoneIcon fontSize="small" color="success" />
          </ListItemIcon>
          <ListItemText>Mark Resolved</ListItemText>
        </MenuItem>
      </Menu>

      <Dialog open={snoozeOpen} onClose={() => setSnoozeOpen(false)}>
        <DialogTitle>Snooze Alert</DialogTitle>
        <DialogContent sx={{ minWidth: 300, pt: 1 }}>
          <FormControl fullWidth margin="dense">
            <InputLabel>Duration</InputLabel>
            <Select
              native
              value={snoozeDuration}
              onChange={(e) => setSnoozeDuration(e.target.value)}
              label="Duration"
            >
              <option value="1d">1 Day</option>
              <option value="3d">3 Days</option>
              <option value="1w">1 Week</option>
            </Select>
          </FormControl>
          <TextField
            margin="dense"
            label="Notes (Optional)"
            fullWidth
            multiline
            rows={2}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSnoozeOpen(false)}>Cancel</Button>
          <Button onClick={handleSnoozeConfirm} variant="contained">
            Snooze
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
