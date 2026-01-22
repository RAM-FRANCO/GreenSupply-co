/**
 * Step 3: Review & Confirm
 * Displays transfer summary in invoice style before submission.
 */
import { memo } from "react";
import {
  Box,
  Card,
  CardContent,
  Grid2,
  Typography,
  Chip,
  Divider,
  Stack,
  alpha,
  useTheme,
} from "@mui/material";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";
import type { Product, Warehouse } from "@/types/inventory";

interface StepReviewProps {
  readonly from: Warehouse | undefined;
  readonly to: Warehouse | undefined;
  readonly product: Product | undefined;
  readonly quantity: number | undefined;
  readonly notes: string | undefined;
}

const StepReview = memo(function StepReview({
  from,
  to,
  product,
  quantity,
  notes,
}: StepReviewProps) {
  const theme = useTheme();

  return (
    <Grid2 container justifyContent="center">
      <Grid2 size={{ xs: 12, md: 8 }}>
        <Card variant="outlined" sx={{ borderRadius: 3 }}>
          <Box
            sx={{
              p: 4,
              textAlign: "center",
              bgcolor: alpha(theme.palette.primary.main, 0.04),
            }}
          >
            <Typography
              variant="overline"
              color="text.secondary"
              fontWeight={700}
              letterSpacing={2}
            >
              TRANSFER MANIFEST
            </Typography>
            <Typography variant="h4" fontWeight={800} sx={{ my: 2 }}>
              {quantity} Units
            </Typography>
            <Chip
              label={product?.name || "Unknown Product"}
              color="primary"
              variant="outlined"
              sx={{ fontWeight: 600 }}
            />
          </Box>
          <Divider />
          <CardContent sx={{ p: 4 }}>
            <Stack spacing={3}>
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    FROM
                  </Typography>
                  <Typography variant="subtitle1" fontWeight={600}>
                    {from?.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {from?.location}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {from?.code}
                  </Typography>
                </Box>
                <SwapHorizIcon
                  sx={{ color: "text.disabled", alignSelf: "center" }}
                />
                <Box sx={{ textAlign: "right" }}>
                  <Typography variant="caption" color="text.secondary">
                    TO
                  </Typography>
                  <Typography variant="subtitle1" fontWeight={600}>
                    {to?.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {to?.location}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {to?.code}
                  </Typography>
                </Box>
              </Box>

              {notes && (
                <Box sx={{ p: 2, bgcolor: "grey.50", borderRadius: 2 }}>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    fontWeight={600}
                  >
                    NOTES
                  </Typography>
                  <Typography variant="body2">{notes}</Typography>
                </Box>
              )}
            </Stack>
          </CardContent>
        </Card>
      </Grid2>
    </Grid2>
  );
});

export default StepReview;
