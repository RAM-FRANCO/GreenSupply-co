/**
 * Transfer form orchestrator using the useTransferFormLogic hook.
 * Delegates rendering to extracted step components for maintainability.
 */
import { Button, Alert, CircularProgress, Box } from "@mui/material";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import TransferWizard from "./TransferWizard";
import StepRouteSelection from "./steps/StepRouteSelection";
import StepItemSelection from "./steps/StepItemSelection";
import StepReview from "./steps/StepReview";
import TransferFormSkeleton from "./TransferFormSkeleton";
import { FORM_STEPS } from "./transferConstants";
import { useTransferFormLogic } from "./hooks/useTransferFormLogic";

interface TransferFormProps {
  readonly onTransferComplete?: () => void;
}

export default function TransferForm({
  onTransferComplete,
}: TransferFormProps) {
  const {
    formValues,
    errors,
    setValue,
    productOptions,
    warehouseOptions,
    destinationOptions,
    availableStock,
    stockPercentage,
    from,
    to,
    product,
    activeStep,
    loading,
    initialLoading,
    submitError,
    success,
    handleNext,
    handleBack,
    handleSubmit,
    clearSubmitError,
    clearSuccess,
  } = useTransferFormLogic(onTransferComplete);

  if (initialLoading) {
    return <TransferFormSkeleton />;
  }

  return (
    <TransferWizard
      title="New Stock Transfer"
      activeStep={activeStep}
      steps={FORM_STEPS}
      transparentContent={activeStep === 0}
    >
      {submitError && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={clearSubmitError}>
          {submitError}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={clearSuccess}>
          {success}
        </Alert>
      )}

      {/* Step 1: Route Selection */}
      {activeStep === 0 && (
        <StepRouteSelection
          fromWarehouseId={formValues.fromWarehouseId}
          toWarehouseId={formValues.toWarehouseId}
          warehouseOptions={warehouseOptions}
          destinationOptions={destinationOptions}
          onFromChange={(v) => setValue("fromWarehouseId", v)}
          onToChange={(v) => setValue("toWarehouseId", v)}
          errors={{
            fromWarehouseId: errors.fromWarehouseId?.message,
            toWarehouseId: errors.toWarehouseId?.message,
          }}
        />
      )}

      {/* Step 2: Item Selection */}
      {activeStep === 1 && (
        <StepItemSelection
          inventory={{
            from,
            to,
            productOptions,
            availableStock,
            stockPercentage,
          }}
          productId={formValues.productId}
          quantity={formValues.quantity}
          notes={formValues.notes}
          onProductChange={(v) => setValue("productId", v)}
          onQuantityChange={(v) => setValue("quantity", v)}
          onNotesChange={(v) => setValue("notes", v)}
          errors={{
            productId: errors.productId?.message,
            quantity: errors.quantity?.message,
          }}
        />
      )}

      {/* Step 3: Review */}
      {activeStep === 2 && (
        <StepReview
          from={from}
          to={to}
          product={product}
          quantity={formValues.quantity}
          notes={formValues.notes}
        />
      )}

      {/* Footer Actions */}
      <Box sx={{ mt: 5, display: "flex", justifyContent: "flex-end", gap: 2 }}>
        {activeStep > 0 && (
          <Button
            onClick={handleBack}
            disabled={loading}
            sx={{ minWidth: 100 }}
          >
            Back
          </Button>
        )}
        {activeStep < 2 ? (
          <Button
            variant="contained"
            onClick={handleNext}
            sx={{ minWidth: 120, borderRadius: 2 }}
            endIcon={<ArrowForwardIcon />}
          >
            Next Step
          </Button>
        ) : (
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={loading}
            color="primary"
            sx={{ minWidth: 140, borderRadius: 2, py: 1 }}
            startIcon={
              loading ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                <CheckCircleIcon />
              )
            }
          >
            {loading ? "Submitting..." : "Confirm Transfer"}
          </Button>
        )}
      </Box>
    </TransferWizard>
  );
}
