/**
 * Visual step indicator for multi-step workflows.
 * Displays numbered circles with labels showing progress.
 */
import { Box, Typography } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

interface StepIndicatorProps {
  readonly steps: readonly string[];
  readonly currentStep: number;
  readonly completedSteps?: readonly number[];
}

const STEP_CIRCLE_SIZE = 32;

/**
 * Step indicator with numbered circles and labels
 */
export default function StepIndicator({
  steps,
  currentStep,
  completedSteps = [],
}: StepIndicatorProps) {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: { xs: 2, sm: 4 },
        flexWrap: "wrap",
      }}
    >
      {steps.map((step, index) => {
        const stepNumber = index + 1;
        const isCompleted = completedSteps.includes(stepNumber);
        const isCurrent = currentStep === stepNumber;
        const isPast = stepNumber < currentStep || isCompleted;

        return (
          <Box
            key={step}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
          >
            {isPast ? (
              <CheckCircleIcon
                sx={{
                  fontSize: STEP_CIRCLE_SIZE,
                  color: "primary.main",
                }}
              />
            ) : (
              <Box
                sx={{
                  width: STEP_CIRCLE_SIZE,
                  height: STEP_CIRCLE_SIZE,
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 600,
                  fontSize: "0.875rem",
                  backgroundColor: isCurrent ? "primary.main" : "grey.200",
                  color: isCurrent ? "white" : "text.secondary",
                  transition: "all 0.2s ease-in-out",
                }}
              >
                {stepNumber}
              </Box>
            )}
            <Typography
              variant="body2"
              sx={{
                fontWeight: isCurrent || isPast ? 500 : 400,
                color: isCurrent
                  ? "primary.main"
                  : isPast
                    ? "text.primary"
                    : "text.secondary",
                display: { xs: "none", sm: "block" },
              }}
            >
              {step}
            </Typography>
          </Box>
        );
      })}
    </Box>
  );
}
