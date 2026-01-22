/**
 * Step 2: Item Selection
 * Allows user to select product, quantity, and view stock information.
 */
import { memo } from "react";
import {
  Box,
  Card,
  CardContent,
  Grid2,
  Typography,
  TextField,
  Stack,
  Divider,
  Alert,
  LinearProgress,
  alpha,
  useTheme,
} from "@mui/material";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import FormSelect from "@/components/common/FormSelect";
import {
  STOCK_WARNING_THRESHOLD_PERCENT,
  LOW_STOCK_THRESHOLD,
} from "../transferConstants";
import type { InventoryData } from "@/types/transfers";
import { isIntegerKey } from "@/utils/validation";

interface StepItemSelectionProps {
  readonly inventory: InventoryData;
  readonly productId: number | undefined;
  readonly quantity: number | undefined;
  readonly notes: string | undefined;
  readonly onProductChange: (value: number) => void;
  readonly onQuantityChange: (value: number | undefined) => void;
  readonly onNotesChange: (value: string) => void;
  readonly errors?: {
    readonly productId?: string;
    readonly quantity?: string;
  };
}

const StepItemSelection = memo(function StepItemSelection({
  inventory: { from, to, productOptions, availableStock, stockPercentage },
  productId,
  quantity,
  notes,
  onProductChange,
  onQuantityChange,
  onNotesChange,
  errors,
}: StepItemSelectionProps) {
  const theme = useTheme();

  return (
    <Box>
      {/* Route Summary - Context from Step 1 */}
      <Card
        variant="outlined"
        sx={{
          mb: 4,
          borderRadius: 3,
          bgcolor: alpha(theme.palette.primary.main, 0.03),
          borderColor: alpha(theme.palette.primary.main, 0.2),
        }}
      >
        <CardContent
          sx={{
            py: 2,
            "&:last-child": { pb: 2 },
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 4,
          }}
        >
          <Box sx={{ textAlign: "center" }}>
            <Typography variant="caption" color="text.secondary">
              FROM
            </Typography>
            <Typography variant="subtitle2" fontWeight={600}>
              {from?.name || "Not Selected"}
            </Typography>
          </Box>
          <ArrowForwardIcon sx={{ color: "primary.main", fontSize: 24 }} />
          <Box sx={{ textAlign: "center" }}>
            <Typography variant="caption" color="text.secondary">
              TO
            </Typography>
            <Typography variant="subtitle2" fontWeight={600}>
              {to?.name || "Not Selected"}
            </Typography>
          </Box>
        </CardContent>
      </Card>

      {/* Main Form Content */}
      <Grid2 container spacing={3}>
        {/* Left Column: Product Selection & Quantity */}
        <Grid2 size={{ xs: 12, md: 6 }}>
          <Typography variant="h6" fontWeight={600} gutterBottom>
            What are you moving?
          </Typography>

          <Stack spacing={3}>
            <FormSelect
              label="Select Product"
              value={productId}
              options={productOptions}
              onChange={(v) => onProductChange(v as number)}
              error={errors?.productId}
              fullWidth
            />

            <TextField
              label="Quantity to Transfer"
              type="number"
              value={quantity ?? ""}
              onChange={(e) =>
                onQuantityChange(
                  e.target.value ? Number(e.target.value) : undefined,
                )
              }
              onKeyDown={(e) => {
                if (isIntegerKey(e)) {
                  e.preventDefault();
                }
              }}
              fullWidth
              slotProps={{
                input: { sx: { borderRadius: 3 } },
              }}
              error={
                !!errors?.quantity ||
                (availableStock !== null && (quantity ?? 0) > availableStock)
              }
              helperText={
                errors?.quantity ||
                (availableStock !== null && (quantity ?? 0) > availableStock
                  ? `Exceeds available stock (${availableStock})`
                  : undefined)
              }
            />

            <TextField
              label="Notes (Optional)"
              multiline
              rows={3}
              value={notes ?? ""}
              onChange={(e) => onNotesChange(e.target.value)}
              fullWidth
              slotProps={{
                input: { sx: { borderRadius: 3 } },
              }}
              placeholder="Reason for transfer, special handling instructions..."
            />
          </Stack>
        </Grid2>

        {/* Right Column: Stock Availability Info */}
        <Grid2 size={{ xs: 12, md: 6 }}>
          <Typography variant="h6" fontWeight={600} gutterBottom>
            Stock Information
          </Typography>

          <Card
            variant="outlined"
            sx={{
              borderRadius: 3,
              bgcolor: productId ? "background.paper" : "grey.50",
            }}
          >
            <CardContent>
              {productId && availableStock !== null ? (
                <Stack spacing={2}>
                  <Box>
                    <Typography
                      variant="caption"
                      fontWeight={600}
                      color="text.secondary"
                      sx={{ textTransform: "uppercase", letterSpacing: 1 }}
                    >
                      Available at {from?.name}
                    </Typography>
                    <Typography
                      variant="h3"
                      fontWeight={700}
                      color={
                        availableStock < LOW_STOCK_THRESHOLD
                          ? "error.main"
                          : "text.primary"
                      }
                    >
                      {availableStock}
                      <Typography
                        component="span"
                        variant="h6"
                        color="text.secondary"
                        sx={{ ml: 1 }}
                      >
                        units
                      </Typography>
                    </Typography>
                  </Box>

                  <Divider />

                  <Box>
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      mb={1}
                    >
                      <Typography variant="body2">Transfer Amount</Typography>
                      <Typography
                        variant="body2"
                        fontWeight={600}
                        color={
                          stockPercentage > STOCK_WARNING_THRESHOLD_PERCENT
                            ? "warning.main"
                            : "primary.main"
                        }
                      >
                        {quantity ?? 0} units ({Math.round(stockPercentage)}%)
                      </Typography>
                    </Stack>
                    <LinearProgress
                      variant="determinate"
                      value={stockPercentage}
                      color={
                        stockPercentage > STOCK_WARNING_THRESHOLD_PERCENT
                          ? "warning"
                          : "primary"
                      }
                      sx={{
                        height: 10,
                        borderRadius: 5,
                        bgcolor: "grey.200",
                      }}
                    />
                  </Box>

                  {stockPercentage > STOCK_WARNING_THRESHOLD_PERCENT && (
                    <Alert severity="warning" sx={{ borderRadius: 2 }}>
                      You are transferring more than{" "}
                      {STOCK_WARNING_THRESHOLD_PERCENT}% of available stock.
                    </Alert>
                  )}
                </Stack>
              ) : (
                <Box sx={{ textAlign: "center", py: 4 }}>
                  <Typography variant="body2" color="text.secondary">
                    Select a product to see stock availability
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid2>
      </Grid2>
    </Box>
  );
});

export default StepItemSelection;
