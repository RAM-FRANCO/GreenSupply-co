/**
 * Step 1: Route Selection
 * Allows user to select origin and destination warehouses.
 */
import { memo } from "react";
import {
  Card,
  CardContent,
  Stack,
  Avatar,
  Typography,
  Box,
  Grid2,
  useTheme,
} from "@mui/material";
import WarehouseIcon from "@mui/icons-material/Warehouse";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import FormSelect from "@/components/common/FormSelect";
import type { SelectOption } from "@/types/common";

interface StepRouteSelectionProps {
  readonly fromWarehouseId: number | undefined;
  readonly toWarehouseId: number | undefined;
  readonly warehouseOptions: readonly SelectOption[];
  readonly destinationOptions: readonly SelectOption[];
  readonly onFromChange: (value: number) => void;
  readonly onToChange: (value: number | undefined) => void;
  readonly errors?: {
    readonly fromWarehouseId?: string;
    readonly toWarehouseId?: string;
  };
}

const StepRouteSelection = memo(function StepRouteSelection({
  fromWarehouseId,
  toWarehouseId,
  warehouseOptions,
  destinationOptions,
  onFromChange,
  onToChange,
  errors,
}: StepRouteSelectionProps) {
  const theme = useTheme();

  return (
    <Box>
      <Grid2 container spacing={4} alignItems="center" justifyContent="center">
        {/* Origin Card */}
        <Grid2 size={{ xs: 12, md: 5 }}>
          <Card
            variant="outlined"
            sx={{
              borderRadius: 3,
              borderColor: fromWarehouseId ? "primary.main" : "divider",
              borderWidth: fromWarehouseId ? 2 : 1,
              boxShadow: fromWarehouseId ? theme.shadows[4] : "none",
              transition: "all 0.2s",
            }}
          >
            <CardContent sx={{ p: 4 }}>
              <Stack direction="row" spacing={2} alignItems="center" mb={2}>
                <Avatar
                  sx={{ bgcolor: "primary.light", color: "primary.main" }}
                >
                  <WarehouseIcon />
                </Avatar>
                <Typography variant="h6" fontWeight={600}>
                  Origin
                </Typography>
              </Stack>
              <FormSelect
                label="Select Source Warehouse"
                value={fromWarehouseId}
                options={warehouseOptions}
                onChange={(v) => {
                  onFromChange(v as number);
                  if (toWarehouseId === v) {
                    onToChange(undefined);
                  }
                }}
                error={errors?.fromWarehouseId}
                fullWidth
              />
            </CardContent>
          </Card>
        </Grid2>

        {/* Arrow visual */}
        <Grid2 size={{ xs: 12, md: 2 }} sx={{ textAlign: "center" }}>
          <ArrowForwardIcon
            sx={{
              color: "text.disabled",
              fontSize: 40,
              transform: { xs: "rotate(90deg)", md: "rotate(0deg)" },
            }}
          />
        </Grid2>

        {/* Destination Card */}
        <Grid2 size={{ xs: 12, md: 5 }}>
          <Card
            variant="outlined"
            sx={{
              borderRadius: 3,
              borderColor: toWarehouseId ? "success.main" : "divider",
              borderWidth: toWarehouseId ? 2 : 1,
              boxShadow: toWarehouseId ? theme.shadows[4] : "none",
              opacity: fromWarehouseId ? 1 : 0.6,
              transition: "all 0.2s",
            }}
          >
            <CardContent sx={{ p: 4 }}>
              <Stack direction="row" spacing={2} alignItems="center" mb={2}>
                <Avatar
                  sx={{ bgcolor: "success.light", color: "success.main" }}
                >
                  <WarehouseIcon />
                </Avatar>
                <Typography variant="h6" fontWeight={600}>
                  Destination
                </Typography>
              </Stack>
              <FormSelect
                label="Select Target Warehouse"
                value={toWarehouseId}
                options={destinationOptions}
                onChange={(v) => onToChange(v as number)}
                disabled={!fromWarehouseId}
                error={errors?.toWarehouseId}
                fullWidth
              />
            </CardContent>
          </Card>
        </Grid2>
      </Grid2>
    </Box>
  );
});

export default StepRouteSelection;
