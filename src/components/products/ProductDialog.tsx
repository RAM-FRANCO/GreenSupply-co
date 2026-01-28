import { Dialog, DialogContent, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ProductForm from "./ProductForm";
import type { ProductFormData } from "@/schemas/inventorySchema";

interface ProductDialogProps {
  readonly open: boolean;
  readonly onClose: () => void;
  readonly mode: "add" | "edit";
  readonly initialData?: Partial<ProductFormData>;
  readonly onSubmit: (data: ProductFormData) => Promise<void>;
  readonly isSubmitting?: boolean;
  readonly categories: Category[];
}

import type { Category } from "@/types/category";

export default function ProductDialog({
  open,
  onClose,
  mode,
  initialData,
  onSubmit,
  isSubmitting = false,
  categories,
}: ProductDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogContent sx={{ position: "relative", p: 0 }}>
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            position: "absolute",
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
            zIndex: 1,
          }}
        >
          <CloseIcon />
        </IconButton>
        <ProductForm
          title={mode === "add" ? "Add New Product" : "Edit Product"}
          description={
            mode === "add"
              ? "Enter details for the new product."
              : "Update product details."
          }
          defaultValues={initialData}
          onSubmit={onSubmit}
          isSubmitting={isSubmitting}
          onCancel={onClose}
          categories={categories}
        />
      </DialogContent>
    </Dialog>
  );
}
