import { useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { TextField, Button, Box } from "@mui/material";
import FormPageLayout from "../../components/layout/FormPageLayout";
import {
  WarehouseFormSchema,
  type WarehouseFormData,
} from "../../schemas/inventorySchema";

export default function AddWarehouse() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<WarehouseFormData>({
    resolver: zodResolver(WarehouseFormSchema),
    defaultValues: {
      name: "",
      location: "",
      code: "",
    },
    mode: "onChange",
  });

  const onSubmit = async (data: WarehouseFormData) => {
    setSubmitting(true);
    const res = await fetch("/api/warehouses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      router.push("/warehouses");
    } else {
      setSubmitting(false);
    }
  };

  return (
    <FormPageLayout title="Add New Warehouse">
      <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
        <Controller
          name="code"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              margin="normal"
              required
              fullWidth
              label="Warehouse Code"
              error={!!errors.code}
              helperText={errors.code?.message}
              slotProps={{
                input: { sx: { borderRadius: 2 } },
              }}
            />
          )}
        />
        <Controller
          name="name"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              margin="normal"
              required
              fullWidth
              label="Warehouse Name"
              error={!!errors.name}
              helperText={errors.name?.message}
              slotProps={{
                input: { sx: { borderRadius: 2 } },
              }}
            />
          )}
        />
        <Controller
          name="location"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              margin="normal"
              required
              fullWidth
              label="Location"
              error={!!errors.location}
              helperText={errors.location?.message}
              slotProps={{
                input: { sx: { borderRadius: 2 } },
              }}
            />
          )}
        />
        <Box sx={{ mt: 3, display: "flex", gap: 2 }}>
          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            disabled={submitting || !isValid}
            sx={{ borderRadius: 2, height: 48 }}
          >
            {submitting ? "Adding..." : "Add Warehouse"}
          </Button>
          <Button
            fullWidth
            variant="outlined"
            component={Link}
            href="/warehouses"
            disabled={submitting}
            sx={{ borderRadius: 2, height: 48 }}
          >
            Cancel
          </Button>
        </Box>
      </Box>
    </FormPageLayout>
  );
}
