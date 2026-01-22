/**
 * Loading skeleton for the Transfer Form.
 * Matches the layout of the actual form for a smoother loading experience.
 */
import { Box, Grid2, Skeleton, Card, CardContent, Stack } from "@mui/material";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

export default function TransferFormSkeleton() {
  return (
    <Box>
      {/* Title Skeleton */}
      <Skeleton variant="text" width={250} height={40} sx={{ mb: 1 }} />
      <Skeleton variant="text" width={400} height={20} sx={{ mb: 4 }} />

      {/* Stepper Skeleton */}
      <Box sx={{ mb: 6, px: 4 }}>
        <Stack direction="row" alignItems="center" spacing={2}>
          {[1, 2, 3].map((step) => (
            <Box
              key={step}
              sx={{ display: "flex", alignItems: "center", flex: 1 }}
            >
              <Skeleton
                variant="circular"
                width={32}
                height={32}
                sx={{ mr: 2 }}
              />
              <Skeleton variant="text" width="60%" />
              {step < 3 && (
                <Skeleton
                  variant="rectangular"
                  height={2}
                  width="100%"
                  sx={{ mx: 2, flex: 1 }}
                />
              )}
            </Box>
          ))}
        </Stack>
      </Box>

      {/* Form Content Skeleton (Route Selection Layout) */}
      <Grid2 container spacing={4} alignItems="center" justifyContent="center">
        {/* Origin Card Skeleton */}
        <Grid2 size={{ xs: 12, md: 5 }}>
          <Card variant="outlined" sx={{ borderRadius: 3, height: 200 }}>
            <CardContent sx={{ p: 4 }}>
              <Stack direction="row" spacing={2} alignItems="center" mb={2}>
                <Skeleton variant="circular" width={40} height={40} />
                <Skeleton variant="text" width={100} height={32} />
              </Stack>
              <Skeleton
                variant="rectangular"
                height={56}
                sx={{ borderRadius: 1 }}
              />
            </CardContent>
          </Card>
        </Grid2>

        {/* Arrow Skeleton */}
        <Grid2 size={{ xs: 12, md: 2 }} sx={{ textAlign: "center" }}>
          <ArrowForwardIcon sx={{ color: "action.disabled", fontSize: 40 }} />
        </Grid2>

        {/* Destination Card Skeleton */}
        <Grid2 size={{ xs: 12, md: 5 }}>
          <Card variant="outlined" sx={{ borderRadius: 3, height: 200 }}>
            <CardContent sx={{ p: 4 }}>
              <Stack direction="row" spacing={2} alignItems="center" mb={2}>
                <Skeleton variant="circular" width={40} height={40} />
                <Skeleton variant="text" width={100} height={32} />
              </Stack>
              <Skeleton
                variant="rectangular"
                height={56}
                sx={{ borderRadius: 1 }}
              />
            </CardContent>
          </Card>
        </Grid2>
      </Grid2>
    </Box>
  );
}
