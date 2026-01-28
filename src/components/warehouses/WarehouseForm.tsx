import { useEffect, useRef } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { TextField, Button, Box, Autocomplete, InputAdornment } from "@mui/material";
import { AccountCircle as AccountCircleIcon, Place as PlaceIcon, AddBusiness as AddBusinessIcon } from "@mui/icons-material";
import {
  WarehouseFormSchema,
  type WarehouseFormData,
} from "../../schemas/inventorySchema";

import { useManagers } from "@/hooks/useManagers";
// ... imports

// Remove static AVAILABLE_MANAGERS const

export interface WarehouseFormProps {
  readonly defaultValues?: Partial<WarehouseFormData>;
  readonly onSubmit: (data: WarehouseFormData) => Promise<void>;
  readonly isSubmitting?: boolean;
  readonly onCancel?: () => void;
  readonly isEditMode?: boolean;
}

export default function WarehouseForm({
  defaultValues,
  onSubmit,
  isSubmitting = false,
  onCancel,
  isEditMode = false,
}: WarehouseFormProps) {
  const { managers } = useManagers();
  
  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isValid },
  } = useForm({
    resolver: zodResolver(WarehouseFormSchema),
    defaultValues: {
      name: "",
      location: "",
      code: "",
      managerName: "",
      type: "Distribution Center", // Ensure default type
      maxSlots: 500,
      ...defaultValues,
    },
    mode: "onChange",
  });

  // Auto-generate code based on name
  const warehouseName = watch("name");
  
  // Stable random suffix for this session
  const randomSuffix = useRef(Math.floor(Math.random() * 90) + 10);

  // Effect to update code when name changes
  useEffect(() => {
    // Check if we are in "create" mode (no default code) OR if the user hasn't manually entered a code yet (optional)
    // For now, strict check on defaultValues?.code ensures we don't mess up edits.
    const isCreateMode = !defaultValues?.code; 

    if (isCreateMode && warehouseName) {
       const initials = warehouseName
        .split(" ")
        .map(word => word[0]) // Take first letter of each word
        .join("")
        .toUpperCase()
        .slice(0, 3);
       
       const autoCode = `${initials}-${randomSuffix.current}`;
       setValue("code", autoCode, { shouldValidate: true });
    }
  }, [warehouseName, setValue, defaultValues?.code]);

  const buttonText = (() => {
    if (isSubmitting) return "Saving...";
    return isEditMode ? "Save" : "Create Warehouse";
  })();

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
      <Box display="flex" flexDirection="column" gap={3}>
          {/* Row 1: Code and Name */}
          <Box display="flex" gap={2}>
            <Controller
                name="code"
                control={control}
                render={({ field }) => (
                <TextField
                    {...field}
                    required
                    fullWidth
                    label="Warehouse Code (Auto)"
                    placeholder="e.g. SDC-01"
                    error={!!errors.code}
                    helperText={errors.code?.message}
                    slotProps={{
                       input: { 
                           readOnly: true,
                           sx: { borderRadius: 2, bgcolor: "action.hover" } 
                       },
                    }}
                    sx={{ flex: 1 }}
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
                    label="Warehouse Name"
                    placeholder="e.g. Seattle Distribution Center"
                    error={!!errors.name}
                    helperText={errors.name?.message}
                    slotProps={{
                       input: { sx: { borderRadius: 2 } },
                    }}
                    sx={{ flex: 1 }}
                />
                )}
            />
          </Box>

          {/* Row 2: Warehouse Type */}
          <Controller
            name="type"
            control={control}
            render={({ field }) => (
            <TextField
                {...field}
                select
                fullWidth
                label="Warehouse Type"
                error={!!errors.type}
                helperText={errors.type?.message}
                slotProps={{
                    input: { sx: { borderRadius: 2 } },
                }}
                SelectProps={{
                    native: true,
                }}
            >
                <option value="Distribution Center">Distribution Center</option>
                <option value="Fulfillment Center">Fulfillment Center</option>
                <option value="Cold Storage">Cold Storage</option>
                <option value="Retail Store">Retail Store</option>
            </TextField>
            )}
        />

          {/* Row 3: Address */}
          <Controller
            name="location"
            control={control}
            render={({ field }) => (
            <TextField
                {...field}
                required
                fullWidth
                label="Address"
                placeholder="e.g. 123 Green Way, NY"
                error={!!errors.location}
                helperText={errors.location?.message}
                slotProps={{
                  input: { 
                      startAdornment: (
                        <InputAdornment position="start">
                            <PlaceIcon color="action" />
                        </InputAdornment>
                      ),
                      sx: { borderRadius: 2 } 
                  },
                }}
            />
            )}
            />

          {/* Row 4: Manager and Max Slots */}
          <Box display="flex" gap={2}>
             <Controller
                name="managerName"
                control={control}
                render={({ field: { onChange, value } }) => (
                <Autocomplete
                    freeSolo
                    options={managers.map(m => m.name)}
                    value={value || ""}
                    onChange={(_, newValue) => onChange(newValue)}
                    onInputChange={(_, newInputValue) => onChange(newInputValue)}
                    renderInput={(params) => (
                        <TextField
                            {...params}
                            fullWidth
                            label="Manager"
                            placeholder="Assign Manager..."
                            error={!!errors.managerName}
                            helperText={errors.managerName?.message}
                            slotProps={{
                                input: {
                                    ...params.InputProps,
                                    startAdornment: (
                                        <>
                                            <InputAdornment position="start">
                                                <AccountCircleIcon color="action" />
                                            </InputAdornment>
                                            {params.InputProps.startAdornment}
                                        </>
                                    ),
                                    sx: { borderRadius: 2 }
                                },
                            }}
                        />
                    )}
                    sx={{ flex: 1 }}
                />
                )}
            />
           <Controller
            name="maxSlots"
            control={control}
            render={({ field }) => (
            <TextField
                {...field}
                type="number"
                required
                fullWidth
                label="Max slots (capacity)"
                placeholder="0"
                error={!!errors.maxSlots}
                helperText={errors.maxSlots?.message}
                slotProps={{
                    input: { sx: { borderRadius: 2 } },
                }}
                onChange={(e) => field.onChange(Number(e.target.value))}
                sx={{ flex: 1 }}
            />
            )}
            />
          </Box>
      </Box>

      <Box sx={{ mt: 4, display: "flex", justifyContent: "flex-end", gap: 2 }}>
        {onCancel && (
          <Button
            variant="text"
            onClick={onCancel}
            disabled={isSubmitting}
            sx={{ fontWeight: "bold", color: "text.secondary" }}
          >
            Cancel
          </Button>
        )}
        <Button
          type="submit"
          variant="contained"
          color="primary"
          disabled={isSubmitting || !isValid}
          startIcon={<AddBusinessIcon />}
          sx={{ borderRadius: 2, px: 3, height: 44, fontWeight: "bold" }}
        >
          {buttonText}
        </Button>
      </Box>
    </Box>
  );
}
