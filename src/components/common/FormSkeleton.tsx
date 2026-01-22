import { Skeleton, Box, Paper, Stack, Container } from "@mui/material";

export default function FormSkeleton() {
  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      {/* Back Button Skeleton */}
      <Skeleton variant="text" width={150} sx={{ mb: 3, fontSize: "1rem" }} />

      <Paper
        elevation={0}
        sx={{ p: 4, border: 1, borderColor: "divider", borderRadius: 2 }}
      >
        {/* Title */}
        <Skeleton variant="text" width={200} height={40} sx={{ mb: 1 }} />
        <Skeleton variant="text" width={300} sx={{ mb: 4 }} />

        <Stack spacing={3}>
          {/* Text Fields */}
          {[1, 2, 3].map((i) => (
            <Box key={i}>
              <Skeleton variant="text" width={100} sx={{ mb: 1 }} />
              <Skeleton variant="rounded" height={56} />
            </Box>
          ))}

          {/* Row of Fields */}
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <Box sx={{ flex: 1 }}>
              <Skeleton variant="text" width={80} sx={{ mb: 1 }} />
              <Skeleton variant="rounded" height={56} />
            </Box>
            <Box sx={{ flex: 1 }}>
              <Skeleton variant="text" width={100} sx={{ mb: 1 }} />
              <Skeleton variant="rounded" height={56} />
            </Box>
          </Stack>

          {/* Buttons */}
          <Box sx={{ display: "flex", gap: 2, pt: 2 }}>
            <Skeleton variant="rounded" width={150} height={42} />
            <Skeleton variant="rounded" width={100} height={42} />
          </Box>
        </Stack>
      </Paper>
    </Container>
  );
}
