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
  Alert
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import { subDays, subWeeks, subMonths, startOfDay, endOfDay } from 'date-fns';

interface AlertExportDialogProps {
  open: boolean;
  onClose: () => void;
  onExport: (startDate: Date | null, endDate: Date | null) => Promise<void>;
  loading?: boolean;
}

type DateRangeOption = 'all' | '3days' | '1week' | '1month' | 'custom';

export default function AlertExportDialog({
  open,
  onClose,
  onExport,
  loading = false
}: AlertExportDialogProps) {
  const [rangeOption, setRangeOption] = useState<DateRangeOption>('all');
  const [customStart, setCustomStart] = useState<Date | null>(null);
  const [customEnd, setCustomEnd] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleExport = async () => {
    setError(null);
    let start: Date | null = null;
    let end: Date | null = null;
    const now = new Date();

    if (rangeOption === '3days') {
      start = subDays(startOfDay(now), 3);
      end = endOfDay(now);
    } else if (rangeOption === '1week') {
      start = subWeeks(startOfDay(now), 1);
      end = endOfDay(now);
    } else if (rangeOption === '1month') {
      start = subMonths(startOfDay(now), 1);
      end = endOfDay(now);
    } else if (rangeOption === 'custom') {
      if (!customStart || !customEnd) {
        setError('Please select both start and end dates.');
        return;
      }
      if (customStart > customEnd) {
        setError('Start date cannot be after end date.');
        return;
      }
      start = startOfDay(customStart);
      end = endOfDay(customEnd);
    } else {
        // All - keep null to indicate no filter
    }

    try {
      await onExport(start, end);
      onClose();
    } catch (err) {
      console.error(err);
      setError('Failed to export. Please try again.');
    }
  };

  return (
    <Dialog open={open} onClose={loading ? undefined : onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Export Alerts Report</DialogTitle>
      <DialogContent>
        <Stack spacing={3} sx={{ mt: 1 }}>
          <FormControl>
            <FormLabel>Filter by Date</FormLabel>
            <RadioGroup
              value={rangeOption}
              onChange={(e) => setRangeOption(e.target.value as DateRangeOption)}
            >
              <FormControlLabel value="all" control={<Radio />} label="All Time" />
              <FormControlLabel value="3days" control={<Radio />} label="Last 3 Days" />
              <FormControlLabel value="1week" control={<Radio />} label="Last 1 Week" />
              <FormControlLabel value="1month" control={<Radio />} label="Last 1 Month" />
              <FormControlLabel value="custom" control={<Radio />} label="Custom Date Range" />
            </RadioGroup>
          </FormControl>

          {rangeOption === 'custom' && (
            <Stack direction="row" spacing={2}>
              <DatePicker
                label="Start Date"
                value={customStart}
                onChange={(newValue) => setCustomStart(newValue)}
                slotProps={{ textField: { fullWidth: true, size: 'small' } }}
              />
              <DatePicker
                label="End Date"
                value={customEnd}
                onChange={(newValue) => setCustomEnd(newValue)}
                slotProps={{ textField: { fullWidth: true, size: 'small' } }}
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
