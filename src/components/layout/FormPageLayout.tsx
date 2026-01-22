import { Container, Paper, Typography, Box } from "@mui/material";

interface FormPageLayoutProps {
  readonly title: string;
  readonly children: React.ReactNode;
  readonly maxWidth?: "xs" | "sm" | "md" | "lg" | "xl";
}

/**
 * Reusable layout for form pages (Add/Edit).
 * Enforces consistent spacing, paper styling, and title typography.
 */
export default function FormPageLayout({
  title,
  children,
  maxWidth = "sm",
}: FormPageLayoutProps) {
  return (
    <Container maxWidth={maxWidth} sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom fontWeight={600}>
          {title}
        </Typography>
        <Box sx={{ mt: 2 }}>{children}</Box>
      </Paper>
    </Container>
  );
}
