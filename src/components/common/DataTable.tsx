import { useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  flexRender,
  SortingState,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TableSortLabel,
  Paper,
  Box,
  Typography,
  Skeleton,
} from "@mui/material";
import { Inventory2 as EmptyIcon } from "@mui/icons-material";
import type { DataTableProps } from "../../types/table.types";

/** Approximate height of a table row in pixels for layout stability */
const ROW_HEIGHT_PX = 73;

/**
 * Reusable DataTable component powered by TanStack Table.
 * Provides consistent styling, sorting, and pagination across the app.
 */
export default function DataTable<T extends object>({
  data,
  columns,
  title,
  headerActions,
  enableSorting = true,
  enablePagination = true,
  pageSize = 10,
  isLoading = false,
  emptyMessage = "No data found",
}: DataTableProps<T>) {
  const [sorting, setSorting] = useState<SortingState>([]);

  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: enableSorting ? getSortedRowModel() : undefined,
    getPaginationRowModel: enablePagination
      ? getPaginationRowModel()
      : undefined,
    initialState: {
      pagination: { pageSize },
    },
  });

  const { pageIndex } = table.getState().pagination;

  if (isLoading) {
    return (
      <Paper
        elevation={0}
        sx={{ border: 1, borderColor: "divider", borderRadius: 2 }}
      >
        {title && (
          <Box sx={{ p: 2, borderBottom: 1, borderColor: "divider" }}>
            <Skeleton variant="text" width={200} height={32} />
          </Box>
        )}
        <TableContainer>
          <Table>
            <TableHead sx={{ bgcolor: "action.hover" }}>
              <TableRow>
                {columns.map((_, i) => (
                  <TableCell key={`header-skeleton-${i}`}>
                    <Skeleton variant="text" width={100} />
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {Array.from({ length: 5 }).map((_, rowIdx) => (
                <TableRow key={`row-skeleton-${rowIdx}`}>
                  {columns.map((_, colIdx) => (
                    <TableCell key={`cell-skeleton-${rowIdx}-${colIdx}`}>
                      <Skeleton variant="text" />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    );
  }

  return (
    <Paper
      elevation={0}
      sx={{ border: 1, borderColor: "divider", borderRadius: 2 }}
    >
      {/* Header */}
      {(title || headerActions) && (
        <Box
          sx={{
            p: 2,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderBottom: 1,
            borderColor: "divider",
          }}
        >
          {title && (
            <Typography variant="h6" fontWeight={600}>
              {title}
            </Typography>
          )}
          {headerActions}
        </Box>
      )}

      {/* Table */}
      <TableContainer sx={{ overflowX: "auto" }}>
        <Table sx={{ minWidth: 650 }}>
          <TableHead sx={{ bgcolor: "action.hover" }}>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const meta = header.column.columnDef.meta as
                    | { align?: string }
                    | undefined;
                  const align =
                    (meta?.align as "left" | "center" | "right") || "left";

                  return (
                    <TableCell
                      key={header.id}
                      align={align}
                      sx={{
                        fontWeight: 600,
                        color: "text.secondary",
                        textTransform: "uppercase",
                        fontSize: "0.75rem",
                        letterSpacing: "0.05em",
                      }}
                    >
                      {header.column.getCanSort() ? (
                        <TableSortLabel
                          active={!!header.column.getIsSorted()}
                          direction={
                            header.column.getIsSorted() === "desc"
                              ? "desc"
                              : "asc"
                          }
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                        </TableSortLabel>
                      ) : (
                        flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )
                      )}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableHead>
          <TableBody>
            {table.getRowModel().rows.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  align="center"
                  sx={{ py: 6 }}
                >
                  <EmptyIcon
                    sx={{ fontSize: 48, color: "text.disabled", mb: 2 }}
                  />
                  <Typography variant="h6" color="text.secondary">
                    {emptyMessage}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              <>
                {table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id} hover>
                    {row.getVisibleCells().map((cell) => {
                      const meta = cell.column.columnDef.meta as
                        | { align?: string }
                        | undefined;
                      const align =
                        (meta?.align as "left" | "center" | "right") || "left";

                      return (
                        <TableCell key={cell.id} align={align}>
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext(),
                          )}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))}
                {/* Avoid layout jump when on the last page with empty rows */}
                {enablePagination &&
                  table.getRowModel().rows.length <
                    table.getState().pagination.pageSize && (
                    <TableRow
                      aria-hidden="true"
                      style={{
                        height:
                          ROW_HEIGHT_PX *
                          (table.getState().pagination.pageSize -
                            table.getRowModel().rows.length),
                      }}
                    >
                      <TableCell colSpan={columns.length} />
                    </TableRow>
                  )}
              </>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      {enablePagination && data.length > 0 && (
        <TablePagination
          component="div"
          count={data.length}
          page={pageIndex}
          rowsPerPage={table.getState().pagination.pageSize}
          rowsPerPageOptions={[10, 25, 50]}
          onPageChange={(_, page) => table.setPageIndex(page)}
          onRowsPerPageChange={(e) => table.setPageSize(Number(e.target.value))}
        />
      )}
    </Paper>
  );
}
