import { useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  MenuItem,
  Icon,
  Box,
} from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Category } from "@/types/category";

import { categorySchema, CategoryFormData } from "@/schemas/category";
import { CATEGORY_COLORS, CATEGORY_ICONS } from "@/constants/categoryOptions";

interface CategoryModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CategoryFormData) => Promise<void>;
  initialData?: Category | null;
  loading?: boolean;
}

export default function CategoryModal({
  open,
  onClose,
  onSubmit,
  initialData,
  loading = false,
}: CategoryModalProps) {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: "",
      icon: "category",
      color: "green",
    },
  });



  useEffect(() => {
    if (open) {
      if (initialData) {
        reset({
          name: initialData.name,
          icon: initialData.icon,
          color: initialData.color,
        });
      } else {
        reset({
          name: "",
          icon: "category",
          color: "green",
        });
      }
    }
  }, [open, initialData, reset]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogTitle>
          {initialData ? "Edit Category" : "Add New Category"}
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Controller
                name="name"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Category Name"
                    fullWidth
                    error={!!errors.name}
                    helperText={errors.name?.message}
                  />
                )}
              />
            </Grid>
            <Grid item xs={6}>
              <Controller
                name="icon"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    select
                    label="Icon"
                    fullWidth
                    error={!!errors.icon}
                    helperText={errors.icon?.message}
                  >
                    {CATEGORY_ICONS.map((icon) => (
                      <MenuItem key={icon} value={icon}>
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <Icon fontSize="small">{icon}</Icon>
                          {icon}
                        </Box>
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              />
            </Grid>
            <Grid item xs={6}>
              <Controller
                name="color"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    select
                    label="Color Theme"
                    fullWidth
                    error={!!errors.color}
                    helperText={errors.color?.message}
                  >
                    {CATEGORY_COLORS.map((color) => (
                      <MenuItem key={color} value={color}>
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <Box
                            sx={{
                              width: 16,
                              height: 16,
                              borderRadius: "50%",
                              bgcolor: `${color}.500`, // Tailwind-like color mapping
                            }}
                          />
                          {color.charAt(0).toUpperCase() + color.slice(1)}
                        </Box>
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained" disabled={loading}>
            {loading
              ? "Saving..."
              : initialData
                ? "Save Changes"
                : "Add Category"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
