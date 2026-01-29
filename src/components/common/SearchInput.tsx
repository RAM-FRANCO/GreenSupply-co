import React from "react";
import { TextField, InputAdornment, Theme, SxProps } from "@mui/material";
import { Search as SearchIcon } from "@mui/icons-material";

interface SearchInputProps {
  readonly value: string;
  readonly onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  readonly placeholder?: string;
  readonly className?: string;
  readonly sx?: SxProps<Theme>;
  readonly onFocus?: () => void;
  readonly onBlur?: () => void;
}

export default function SearchInput({
  value,
  onChange,
  placeholder = "Search...",
  className,
  sx,
  onFocus,
  onBlur,
}: SearchInputProps) {
  return (
    <TextField
      size="small"
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className={className}
      onFocus={onFocus}
      onBlur={onBlur}
      sx={{ ...sx }}
      slotProps={{
        input: {
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon color="action" fontSize="small" />
            </InputAdornment>
          ),
          sx: { borderRadius: 2 }
        },
      }}
    />
  );
}
