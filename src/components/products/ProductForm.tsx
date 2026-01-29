import {
  TextField,
  Button,
  Box,
  Stack,
  MenuItem,
  CircularProgress,
  Paper,
  Typography,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  Save as SaveIcon,
  Close as CloseIcon,
} from "@mui/icons-material";
import { IconButton } from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/router";
import {
  ProductFormSchema,
  type ProductFormData,
} from "@/schemas/inventorySchema";

import type { Category } from "@/types/category";

interface ProductFormProps {
  readonly defaultValues?: Partial<ProductFormData>;
  readonly onSubmit: (data: ProductFormData) => Promise<void>;
  readonly isSubmitting?: boolean;
  readonly title: string;
  readonly description?: string;
  readonly categories: Category[];
}

export default function ProductForm({
  defaultValues,
  onSubmit,
  isSubmitting = false,
  title,
  description,
  onCancel,
  categories,
}: ProductFormProps & { readonly onCancel?: () => void }) {
  const router = useRouter();

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<ProductFormData>({
    resolver: zodResolver(ProductFormSchema),
    values: {
      sku: defaultValues?.sku || "",
      name: defaultValues?.name || "",
      categoryId: defaultValues?.categoryId || "",
      unitCost: defaultValues?.unitCost ?? 0,
      reorderPoint: defaultValues?.reorderPoint ?? 0,
      description: defaultValues?.description || "",
      image: defaultValues?.image || "",
    },
    mode: "onChange",
  });

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      router.push("/products");
    }
  };

  return (
    <>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={handleCancel}
        sx={{ mb: 3 }}
      >
        Back to Products
      </Button>

      <Paper
        elevation={0}
        sx={{ p: 4, border: 1, borderColor: "divider", borderRadius: 2 }}
      >
        <Typography variant="h5" component="h1" gutterBottom fontWeight="bold">
          {title}
        </Typography>
        {description && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
            {description}
          </Typography>
        )}

        <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
          <Stack spacing={3}>
            {/* Image Upload (Top) */}
            <Controller
              name="image"
              control={control}
              render={({ field }) => (
                <Box>
                  <Typography variant="subtitle2" gutterBottom>
                    Product Image
                  </Typography>

                  {/* 1. Image Preview (Outside Dropzone) */}
                  {field.value && (
                    <Box
                      sx={{
                        position: "relative",
                        mb: 2,
                        width: "fit-content",
                        maxWidth: "100%",
                        mx: "auto",
                        border: 1,
                        borderColor: "divider",
                        borderRadius: 2,
                        overflow: "hidden",
                        "&:hover .delete-icon": {
                          opacity: 1,
                        },
                      }}
                    >
                      <Box
                        component="img"
                        src={field.value}
                        alt="Product Preview"
                        sx={{
                          display: "block",
                          maxWidth: "100%",
                          maxHeight: 300,
                          objectFit: "contain",
                        }}
                      />
                      <IconButton
                        className="delete-icon"
                        onClick={() => field.onChange("")}
                        sx={{
                          position: "absolute",
                          top: 8,
                          right: 8,
                          bgcolor: "rgba(0, 0, 0, 0.6)",
                          color: "white",
                          opacity: 0,
                          transition: "opacity 0.2s",
                          "&:hover": {
                            bgcolor: "rgba(0, 0, 0, 0.8)",
                          },
                        }}
                        size="small"
                      >
                        <CloseIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  )}

                  {/* 2. Dropzone (Always visible to replace or add) */}
                  <Box
                    sx={{
                      border: "2px dashed",
                      borderColor: "divider",
                      borderRadius: 2,
                      p: 3,
                      textAlign: "center",
                      cursor: "pointer",
                      bgcolor: "background.default",
                      "&:hover": {
                        bgcolor: "action.hover",
                        borderColor: "primary.main",
                      },
                      transition: "all 0.2s",
                    }}
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                    onDrop={async (e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      const file = e.dataTransfer.files?.[0];
                      if (file && file.type.startsWith("image/")) {
                        const formData = new FormData();
                        formData.append("file", file);
                        try {
                          const res = await fetch("/api/upload", {
                            method: "POST",
                            body: formData,
                          });
                          if (res.ok) {
                            const data = await res.json();
                            field.onChange(data.url);
                          }
                        } catch (err) {
                          console.error(err);
                        }
                      }
                    }}
                  >
                    <input
                      type="file"
                      id="image-upload-input"
                      hidden
                      accept="image/*"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const formData = new FormData();
                          formData.append("file", file);
                          try {
                            const res = await fetch("/api/upload", {
                              method: "POST",
                              body: formData,
                            });
                            if (res.ok) {
                              const data = await res.json();
                              field.onChange(data.url);
                            }
                          } catch (err) {
                            console.error(err);
                          }
                        }
                      }}
                    />
                    <label
                      htmlFor="image-upload-input"
                      style={{ width: "100%", cursor: "pointer", display: "block" }}
                    >
                      <Box py={2}>
                        <Typography color="text.secondary">
                          {field.value
                            ? "Drag & drop or click to replace image"
                            : "Drag & drop image here, or click to browse"}
                        </Typography>
                      </Box>
                    </label>
                  </Box>
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                    Allowed *.jpeg, *.jpg, *.png, *.webp
                  </Typography>
                </Box>
              )}
            />

            <Controller
              name="sku"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  required
                  fullWidth
                  label="SKU"
                  error={!!errors.sku}
                  helperText={
                    errors.sku?.message || "Unique Stock Keeping Unit identifier"
                  }
                />
              )}
            />
            <Controller
              name="name"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  required
                  fullWidth
                  label="Product Name"
                  error={!!errors.name}
                  helperText={errors.name?.message}
                />
              )}
            />

            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  multiline
                  rows={4}
                  label="Description"
                  error={!!errors.description}
                  helperText={errors.description?.message}
                />
              )}
            />

            <Controller
              name="categoryId"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  select
                  required
                  fullWidth
                  label="Category"
                  error={!!errors.categoryId}
                  helperText={errors.categoryId?.message}
                >
                  {categories.map((cat) => (
                    <MenuItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </MenuItem>
                  ))}
                </TextField>
              )}
            />

            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <Controller
                name="unitCost"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    required
                    fullWidth
                    label="Unit Cost ($)"
                    type="number"
                    slotProps={{ htmlInput: { step: "0.01", min: "0" } }}
                    error={!!errors.unitCost}
                    helperText={errors.unitCost?.message}
                    onChange={(e) =>
                      field.onChange(Number.parseFloat(e.target.value) || 0)
                    }
                  />
                )}
              />
              <Controller
                name="reorderPoint"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    required
                    fullWidth
                    label="Reorder Point"
                    type="number"
                    slotProps={{ htmlInput: { min: "0" } }}
                    error={!!errors.reorderPoint}
                    helperText={
                      errors.reorderPoint?.message ||
                      "Minimum stock level before reordering"
                    }
                    onChange={(e) =>
                      field.onChange(Number.parseInt(e.target.value, 10) || 0)
                    }
                  />
                )}
              />
            </Stack>

            <Box sx={{ display: "flex", gap: 2, pt: 2, justifyContent: "flex-end" }}>
              <Button
                variant="outlined"
                size="large"
                onClick={handleCancel}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                size="large"
                startIcon={
                  isSubmitting ? (
                    <CircularProgress size={20} color="inherit" />
                  ) : (
                    <SaveIcon />
                  )
                }
                disabled={isSubmitting || !isValid}
              >
                {isSubmitting ? "Saving..." : "Save Product"}
              </Button>
            </Box>
          </Stack>
        </Box>
      </Paper>
    </>
  );
}
