/**
 * Reusable form select component.
 * DRY wrapper for MUI Select with consistent styling.
 */
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
} from "@mui/material";

interface SelectOption {
  readonly id: number | string;
  readonly label: string;
}

interface FormSelectProps {
  readonly label: string;
  readonly value: number | string;
  readonly options: readonly SelectOption[];
  readonly onChange: (value: number | string) => void;
  readonly disabled?: boolean;
  readonly error?: string;
  readonly required?: boolean;
  readonly fullWidth?: boolean;
}

/**
 * Generic select dropdown for forms
 */
export default function FormSelect({
  label,
  value,
  options,
  onChange,
  disabled = false,
  error,
  required = false,
  fullWidth = true,
}: FormSelectProps) {
  const labelId = `${label.toLowerCase().replaceAll(/\s+/g, "-")}-label`;

  return (
    <FormControl
      fullWidth={fullWidth}
      error={Boolean(error)}
      disabled={disabled}
      required={required}
    >
      <InputLabel id={labelId}>{label}</InputLabel>
      <Select
        labelId={labelId}
        value={value}
        label={label}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map((option) => (
          <MenuItem key={option.id} value={option.id}>
            {option.label}
          </MenuItem>
        ))}
      </Select>
      {error && <FormHelperText>{error}</FormHelperText>}
    </FormControl>
  );
}
