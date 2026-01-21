import { Box, Grid2, Card, CardContent, Paper, Skeleton } from "@mui/material";

/**
 * Skeleton loader matching dashboard layout structure
 */
export default function DashboardSkeleton() {
  return (
    <Box sx={{ p: 0 }}>
      {/* Header Skeleton */}
      <Box sx={{ mb: 4 }}>
        <Skeleton variant="text" width={180} height={40} />
        <Skeleton variant="text" width={320} height={24} />
      </Box>

      {/* Stats Grid Skeleton */}
      <Grid2 container spacing={3} sx={{ mb: 4 }}>
        {[1, 2, 3, 4].map((item) => (
          <Grid2 size={{ xs: 12, sm: 6, lg: 3 }} key={item}>
            <Card sx={{ height: "100%" }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <Skeleton
                    variant="circular"
                    width={48}
                    height={48}
                    sx={{ mr: 2 }}
                  />
                  <Box sx={{ flex: 1 }}>
                    <Skeleton variant="text" width="60%" height={20} />
                    <Skeleton variant="text" width="40%" height={32} />
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid2>
        ))}
      </Grid2>

      {/* Charts Skeleton */}
      <Grid2 container spacing={3} sx={{ mb: 4 }}>
        <Grid2 size={{ xs: 12, lg: 6 }}>
          <Paper sx={{ p: 3, height: "100%" }}>
            <Skeleton variant="text" width={160} height={28} sx={{ mb: 2 }} />
            <Skeleton
              variant="rounded"
              width="100%"
              height={300}
              animation="wave"
            />
          </Paper>
        </Grid2>
        <Grid2 size={{ xs: 12, lg: 6 }}>
          <Paper sx={{ p: 3, height: "100%" }}>
            <Skeleton variant="text" width={180} height={28} sx={{ mb: 2 }} />
            <Skeleton
              variant="rounded"
              width="100%"
              height={300}
              animation="wave"
            />
          </Paper>
        </Grid2>
      </Grid2>

      {/* Table Skeleton */}
      <Paper sx={{ p: 3, overflow: "hidden" }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
          <Skeleton variant="text" width={160} height={28} />
          <Box sx={{ display: "flex", gap: 2 }}>
            <Skeleton variant="rounded" width={200} height={40} />
            <Skeleton variant="rounded" width={80} height={40} />
          </Box>
        </Box>
        {/* Table Header */}
        <Box
          sx={{
            display: "flex",
            gap: 2,
            mb: 2,
            borderBottom: "1px solid #e5e7eb",
            pb: 2,
          }}
        >
          {[80, 150, 100, 80, 100, 80, 60].map((width, idx) => (
            <Skeleton key={idx} variant="text" width={width} height={20} />
          ))}
        </Box>
        {/* Table Rows */}
        {[1, 2, 3, 4, 5].map((row) => (
          <Box
            key={row}
            sx={{
              display: "flex",
              gap: 2,
              py: 2,
              borderBottom: "1px solid #f3f4f6",
            }}
          >
            {[80, 150, 100, 80, 100, 80, 60].map((width, idx) => (
              <Skeleton
                key={idx}
                variant="text"
                width={width}
                height={24}
                animation="wave"
              />
            ))}
          </Box>
        ))}
      </Paper>
    </Box>
  );
}
