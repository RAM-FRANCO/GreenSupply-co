import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Chip,
  Box,
  TextField,
  InputAdornment,
  TablePagination,
  Button,
  TableSortLabel,
} from "@mui/material";
import FilterListIcon from "@mui/icons-material/FilterList";
import SearchIcon from "@mui/icons-material/Search";
import { customPalette } from "@/theme/theme";
import type { InventoryItem } from "@/types/inventory";

type Order = "asc" | "desc";
type OrderBy = keyof InventoryItem | "status";

function descendingComparator<T>(a: T, b: T, orderBy: keyof T): number {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

function getComparator<T>(
  order: Order,
  orderBy: keyof T,
): (a: T, b: T) => number {
  return order === "desc"
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

function stableSort<T>(
  array: readonly T[],
  comparator: (a: T, b: T) => number,
): T[] {
  const stabilizedThis = array.map((el, index) => [el, index] as [T, number]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) {
      return order;
    }
    return a[1] - b[1];
  });
  return stabilizedThis.map((el) => el[0]);
}

interface SortableHeadCell {
  id: keyof InventoryItem;
  numeric: boolean;
  label: string;
  sortable: true;
}

interface NonSortableHeadCell {
  id: "status";
  numeric: boolean;
  label: string;
  sortable: false;
}

type HeadCell = SortableHeadCell | NonSortableHeadCell;

const headCells: readonly HeadCell[] = [
  { id: "sku", numeric: false, label: "SKU", sortable: true },
  { id: "name", numeric: false, label: "Product Name", sortable: true },
  { id: "category", numeric: false, label: "Category", sortable: true },
  { id: "totalQuantity", numeric: true, label: "Total Stock", sortable: true },
  { id: "reorderPoint", numeric: true, label: "Reorder Point", sortable: true },
  { id: "status", numeric: false, label: "Status", sortable: false },
];

interface InventoryTableProps {
  readonly inventory: InventoryItem[];
}

export default function InventoryTable({ inventory }: InventoryTableProps) {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [order, setOrder] = useState<Order>("asc");
  const [orderBy, setOrderBy] = useState<keyof InventoryItem>("name");

  const handleRequestSort = (property: keyof InventoryItem) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const createSortHandler = (property: keyof InventoryItem) => () => {
    handleRequestSort(property);
  };

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  // Filter logic
  const filteredInventory = inventory.filter((item) => {
    const term = searchTerm.toLowerCase();
    return (
      item.name.toLowerCase().includes(term) ||
      item.sku.toLowerCase().includes(term) ||
      item.category.toLowerCase().includes(term)
    );
  });

  const emptyRows =
    page > 0
      ? Math.max(0, (1 + page) * rowsPerPage - filteredInventory.length)
      : 0;

  return (
    <Paper
      sx={{
        width: "100%",
        overflow: "hidden",
        boxShadow:
          "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
      }}
    >
      {/* Header & Search */}
      <Box
        sx={{
          p: 3,
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: "1px solid #e5e7eb",
        }}
      >
        <Typography
          variant="h6"
          component="div"
          sx={{ fontWeight: 600, mb: { xs: 2, sm: 0 } }}
        >
          Inventory Overview
        </Typography>
        <Box
          sx={{ display: "flex", gap: 2, width: { xs: "100%", sm: "auto" } }}
        >
          <TextField
            size="small"
            placeholder="Search SKU or Name..."
            variant="outlined"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" color="action" />
                  </InputAdornment>
                ),
              },
            }}
            sx={{ width: { xs: "100%", sm: 250 } }}
          />
          <Button
            variant="outlined"
            size="medium"
            startIcon={<FilterListIcon />}
            sx={{
              color: "text.secondary",
              borderColor: "divider",
              textTransform: "none",
            }}
          >
            Filter
          </Button>
        </Box>
      </Box>

      {/* Table */}
      <TableContainer sx={{ maxHeight: 440, overflowX: "auto" }}>
        <Table stickyHeader aria-label="sticky table">
          <TableHead sx={{ bgcolor: "#F9FAFB" }}>
            <TableRow>
              {headCells.map((headCell) => (
                <TableCell
                  key={headCell.id}
                  align={headCell.numeric ? "right" : "left"}
                  sortDirection={orderBy === headCell.id ? order : false}
                  sx={{
                    fontWeight: 600,
                    color: "#6B7280",
                    textTransform: "uppercase",
                    fontSize: "0.75rem",
                    letterSpacing: "0.05em",
                  }}
                >
                  {headCell.sortable ? (
                    <TableSortLabel
                      active={orderBy === headCell.id}
                      direction={orderBy === headCell.id ? order : "asc"}
                      onClick={createSortHandler(headCell.id)}
                    >
                      {headCell.label}
                    </TableSortLabel>
                  ) : (
                    headCell.label
                  )}
                </TableCell>
              ))}
              <TableCell
                align="right"
                sx={{
                  fontWeight: 600,
                  color: "#6B7280",
                  textTransform: "uppercase",
                  fontSize: "0.75rem",
                  letterSpacing: "0.05em",
                }}
              >
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {stableSort(filteredInventory, getComparator(order, orderBy))
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((row) => (
                <TableRow hover role="checkbox" tabIndex={-1} key={row.id}>
                  <TableCell
                    component="th"
                    scope="row"
                    sx={{ fontWeight: 500, color: "#111827" }}
                  >
                    {row.sku}
                  </TableCell>
                  <TableCell sx={{ color: "#6B7280" }}>{row.name}</TableCell>
                  <TableCell sx={{ color: "#6B7280" }}>
                    {row.category}
                  </TableCell>
                  <TableCell
                    align="right"
                    sx={{
                      fontWeight: row.isLowStock ? 600 : 400,
                      color: row.isLowStock
                        ? customPalette.stats.red.icon
                        : "#6B7280",
                    }}
                  >
                    {row.totalQuantity}
                  </TableCell>
                  <TableCell align="right" sx={{ color: "#6B7280" }}>
                    {row.reorderPoint}
                  </TableCell>
                  <TableCell align="left">
                    <Chip
                      label={row.isLowStock ? "Low Stock" : "In Stock"}
                      size="small"
                      sx={{
                        fontWeight: 500,
                        bgcolor: row.isLowStock
                          ? customPalette.status.lowStock.bg
                          : customPalette.status.inStock.bg,
                        color: row.isLowStock
                          ? customPalette.status.lowStock.text
                          : customPalette.status.inStock.text,
                        borderRadius: "16px",
                        height: "22px",
                        "& .MuiChip-label": {
                          px: 1,
                          fontSize: "0.75rem",
                        },
                      }}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Typography
                      component="a"
                      href="#"
                      sx={{
                        color: "primary.main",
                        fontSize: "0.875rem",
                        fontWeight: 500,
                        textDecoration: "none",
                        "&:hover": { textDecoration: "underline" },
                      }}
                    >
                      Edit
                    </Typography>
                  </TableCell>
                </TableRow>
              ))}
            {emptyRows > 0 && (
              <TableRow style={{ height: 53 * emptyRows }}>
                <TableCell colSpan={7} />
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[10, 25, 100]}
        component="div"
        count={filteredInventory.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </Paper>
  );
}
