import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import WarehouseForm from "./WarehouseForm";
import { WarehouseFormData } from "@/schemas/inventorySchema";

interface WarehouseDialogProps {
  readonly open: boolean;
  readonly onClose: () => void;
  readonly mode: "add" | "edit";
  readonly initialData?: Partial<WarehouseFormData>;
  readonly onSubmit: (data: WarehouseFormData) => Promise<void>;
  readonly isSubmitting?: boolean;
}

export default function WarehouseDialog({
  open,
  onClose,
  mode,
  initialData,
  onSubmit,
  isSubmitting = false,
}: WarehouseDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ m: 0, p: 2 }}>
        <Typography variant="h6" component="div">
          {mode === "add" ? "Add New Warehouse" : "Edit Warehouse"}
        </Typography>
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            position: "absolute",
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <WarehouseForm
          defaultValues={initialData}
          onSubmit={onSubmit}
          isSubmitting={isSubmitting}
          onCancel={onClose}
          isEditMode={mode === "edit"}
        />
      </DialogContent>
    </Dialog>
  );
}
