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
  Select,
  MenuItem,
  Stack,
  InputLabel,
  Alert
} from '@mui/material';

interface Category {
  id: string;
  name: string;
}

interface ProductExportDialogProps {
  open: boolean;
  onClose: () => void;
  categories: Category[];
  onExport: (type: 'all' | 'category', categoryId?: string) => Promise<void>;
  loading?: boolean;
}

export default function ProductExportDialog({
  open,
  onClose,
  categories,
  onExport,
  loading = false
}: ProductExportDialogProps) {
  const [exportType, setExportType] = useState<'all' | 'category'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const handleExport = async () => {
    setError(null);
    if (exportType === 'category' && !selectedCategory) {
      setError('Please select a category.');
      return;
    }

    try {
      await onExport(exportType, selectedCategory);
      onClose(); // Close on success
    } catch (err) {
      console.error(err);
      setError('Failed to export. Please try again.');
    }
  };

  return (
    <Dialog open={open} onClose={loading ? undefined : onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Export Products</DialogTitle>
      <DialogContent>
        <Stack spacing={3} sx={{ mt: 1 }}>
          <FormControl>
            <FormLabel>Export Options</FormLabel>
            <RadioGroup
              value={exportType}
              onChange={(e) => setExportType(e.target.value as 'all' | 'category')}
            >
              <FormControlLabel value="all" control={<Radio />} label="All Products" />
              <FormControlLabel value="category" control={<Radio />} label="By Category" />
            </RadioGroup>
          </FormControl>

          {exportType === 'category' && (
            <FormControl fullWidth size="small">
              <InputLabel>Category</InputLabel>
              <Select
                value={selectedCategory}
                label="Category"
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                {categories.map((cat) => (
                  <MenuItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
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
