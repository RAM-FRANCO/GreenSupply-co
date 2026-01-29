import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Stack,
  TextField,
  Alert
} from '@mui/material';

export type ExportDateRange = '1d' | '3d' | '1w' | '1m' | 'custom' | 'all';

interface PurchaseOrderExportDialogProps {
  readonly open: boolean;
  readonly onClose: () => void;
  readonly onExport: (range: ExportDateRange, customStart?: string, customEnd?: string) => Promise<void>;
  readonly loading?: boolean;
}

export default function PurchaseOrderExportDialog({
  open,
  onClose,
  onExport,
  loading = false
}: PurchaseOrderExportDialogProps) {
  const [range, setRange] = useState<ExportDateRange>('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleExport = async () => {
    setError(null);
    if (range === 'custom') {
        if (!startDate || !endDate) {
            setError('Please select both start and end dates.');
            return;
        }
        if (new Date(startDate) > new Date(endDate)) {
            setError('Start date must be before end date.');
            return;
        }
    }

    try {
      await onExport(range, startDate, endDate);
      onClose(); 
    } catch (err) {
      console.error(err);
      setError('Failed to export. Please try again.');
    }
  };

  return (
    <Dialog open={open} onClose={loading ? undefined : onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Export Purchase Orders</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={3}>
          <FormControl>
            <FormLabel>Date Range</FormLabel>
            <RadioGroup
              value={range}
              onChange={(e) => setRange(e.target.value as ExportDateRange)}
            >
              <FormControlLabel value="all" control={<Radio />} label="All Time" />
              <FormControlLabel value="1d" control={<Radio />} label="Last 24 Hours" />
              <FormControlLabel value="3d" control={<Radio />} label="Last 3 Days" />
              <FormControlLabel value="1w" control={<Radio />} label="Last Week" />
              <FormControlLabel value="1m" control={<Radio />} label="Last Month" />
              <FormControlLabel value="custom" control={<Radio />} label="Custom Date Range" />
            </RadioGroup>
          </FormControl>

          {range === 'custom' && (
            <Stack direction="row" spacing={2}>
                <TextField
                    label="Start Date"
                    type="date"
                    size="small"
                    fullWidth
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    slotProps={{ inputLabel: { shrink: true } }}
                />
                <TextField
                    label="End Date"
                    type="date"
                    size="small"
                    fullWidth
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    slotProps={{ inputLabel: { shrink: true } }}
                />
            </Stack>
          )}

          {error && <Alert severity="error">{error}</Alert>}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button onClick={handleExport} variant="contained" disabled={loading}>
            {loading ? 'Exporting...' : 'Export PDF'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
