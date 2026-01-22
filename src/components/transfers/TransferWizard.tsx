import {
  Box,
  Stepper,
  Step,
  StepLabel,
  Paper,
  Typography,
  Button,
  useTheme,
  alpha,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useRouter } from "next/router";

interface TransferWizardProps {
  readonly activeStep: number;
  readonly steps: readonly string[];
  readonly children: React.ReactNode;
  readonly title: string;
  readonly transparentContent?: boolean;
}

export default function TransferWizard({
  activeStep,
  steps,
  children,
  title,
  transparentContent = false,
}: TransferWizardProps) {
  const router = useRouter();
  const theme = useTheme();

  return (
    <Box sx={{ maxWidth: 1200, mx: "auto", width: "100%" }}>
      {/* Wizard Header */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          mb: 4,
        }}
      >
        <Box>
          <Typography variant="h5" fontWeight={700} sx={{ mb: 0.5 }}>
            {title}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Complete the steps below to move inventory.
          </Typography>
        </Box>
      </Box>

      {/* Stepper */}
      <Box sx={{ mb: 4 }}>
        <Stepper activeStep={activeStep} alternativeLabel>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel
                StepIconProps={{
                  sx: {
                    "&.Mui-active": { color: "primary.main" },
                    "&.Mui-completed": { color: "success.main" },
                  },
                }}
              >
                {label}
              </StepLabel>
            </Step>
          ))}
        </Stepper>
      </Box>

      {/* Main Content Card */}
      <Paper
        elevation={0}
        sx={{
          p: transparentContent ? 0 : { xs: 2, md: 4 },
          borderRadius: 4,
          border: transparentContent ? 0 : 1,
          borderColor: "divider",
          backgroundColor: transparentContent
            ? "transparent"
            : alpha(theme.palette.background.paper, 0.8),
          backdropFilter: transparentContent ? "none" : "blur(10px)",
          minHeight: transparentContent ? "auto" : 400,
          transition: "all 0.3s ease-in-out",
        }}
      >
        {children}
      </Paper>
    </Box>
  );
}
