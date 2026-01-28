import { Fragment, useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  getExpandedRowModel,
  flexRender,
  SortingState,
  ExpandedState,
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
  IconButton,
  Collapse,
} from "@mui/material";
import {
  Inventory2 as EmptyIcon,
  KeyboardArrowDown as KeyboardArrowDownIcon,
  KeyboardArrowUp as KeyboardArrowUpIcon,
} from "@mui/icons-material";
import type { DataTableProps } from "../../types/table.types";

/** Approximate height of a table row in pixels for layout stability */
const ROW_HEIGHT_PX = 73;

/**
 * Reusable DataTable component powered by TanStack Table.
 * Provides consistent styling, sorting, pagination, and expandable rows.
 */
export default function DataTable<T extends object>({
  data,
  columns,
  title,
  headerActions,
  rowCount,
  enableSorting = true,
  enablePagination = true,
  pageSize = 10,
  isLoading = false,
  emptyMessage = "No data found",
  emptyState,
  renderSubComponent,
  getRowCanExpand,
  // Props are now fully typed in DataTableProps<T>
  onRowClick,
  pageCount,
  paginationState,
  onPaginationChange,
  sx,
}: DataTableProps<T>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [expanded, setExpanded] = useState<ExpandedState>({});
  
  // Internal state fallback if not controlled
  const [internalPagination, setInternalPagination] = useState({
    pageIndex: 0,
    pageSize,
  });

  const pagination = paginationState ?? internalPagination;

  const table = useReactTable({
    data,
    columns,
    pageCount: pageCount ?? -1, // -1 means unknown/client-side, usually
    state: { 
        sorting, 
        expanded,
        pagination 
    },
    onSortingChange: setSorting,
    onExpandedChange: setExpanded,
    onPaginationChange: (updater) => {
        if (typeof updater === 'function') {
            const newState = updater(pagination);
            if (onPaginationChange) {
                onPaginationChange(newState);
            } else {
                setInternalPagination(newState);
            }
        } else {
             if (onPaginationChange) {
                onPaginationChange(updater);
            } else {
                setInternalPagination(updater);
            }
        }
    },
    manualPagination: !!pageCount, // Enable manual if pageCount provided
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: enableSorting ? getSortedRowModel() : undefined,
    getPaginationRowModel: enablePagination
      ? getPaginationRowModel() // This still needed? Yes, if manual=false
      : undefined,
    getExpandedRowModel: getExpandedRowModel(),
    getRowCanExpand: getRowCanExpand
      ? (row) => getRowCanExpand(row.original)
      : undefined,
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
        <TableContainer sx={{ minHeight: ROW_HEIGHT_PX * 6 }}>
          <Table sx={{ minWidth: 650 }}>
            <TableHead sx={{ bgcolor: "action.hover" }}>
              <TableRow>
                {renderSubComponent && (
                  <TableCell sx={{ width: 48 }}>
                    <Skeleton variant="circular" width={24} height={24} />
                  </TableCell>
                )}
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
                  {renderSubComponent && (
                    <TableCell>
                      <Skeleton variant="circular" width={24} height={24} />
                    </TableCell>
                  )}
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
      sx={{ border: 1, borderColor: "divider", borderRadius: 2, ...sx }}
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
      <TableContainer sx={{ overflowX: "auto", minHeight: ROW_HEIGHT_PX * 6 }}>
        <Table sx={{ minWidth: 650 }}>
          <TableHead sx={{ bgcolor: "action.hover" }}>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {/* Expander Column Header */}
                {renderSubComponent && <TableCell sx={{ width: 48 }} />}
                
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
                  colSpan={columns.length + (renderSubComponent ? 1 : 0)}
                  align="center"
                  sx={{ py: 6 }}
                >
                  {emptyState ? (
                    emptyState
                  ) : (
                    <>
                      <EmptyIcon
                        sx={{ fontSize: 48, color: "text.disabled", mb: 2 }}
                      />
                      <Typography variant="h6" color="text.secondary">
                        {emptyMessage}
                      </Typography>
                    </>
                  )}
                </TableCell>
              </TableRow>
            ) : (
              <>
                {table.getRowModel().rows.map((row) => (
                  <Fragment key={row.id}>
                    <TableRow
                      hover
                      onClick={() => onRowClick?.(row.original)}
                      sx={{
                        cursor: onRowClick ? "pointer" : "default",
                      }}
                    >
                      {/* Expander Cell */}
                      {renderSubComponent && (
                        <TableCell>
                          {row.getCanExpand() && (
                            <IconButton
                              aria-label="expand row"
                              size="small"
                              onClick={row.getToggleExpandedHandler()}
                            >
                              {row.getIsExpanded() ? (
                                <KeyboardArrowUpIcon />
                              ) : (
                                <KeyboardArrowDownIcon />
                              )}
                            </IconButton>
                          )}
                        </TableCell>
                      )}
                      
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
                    
                    {/* Expanded Content */}
                    {row.getIsExpanded() && renderSubComponent && (
                      <TableRow>
                        <TableCell
                          colSpan={columns.length + 1}
                          sx={{ pb: 0, pt: 0, borderBottom: 0 }}
                        >
                          <Collapse in={row.getIsExpanded()} timeout="auto" unmountOnExit>
                             {renderSubComponent({ row: row.original })}
                          </Collapse>
                        </TableCell>
                      </TableRow>
                    )}
                  </Fragment>
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
                      <TableCell colSpan={columns.length + (renderSubComponent ? 1 : 0)} />
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
          count={rowCount ?? (pageCount ? pageCount * table.getState().pagination.pageSize : data.length)}
          // TanStack stores pageCount (number of pages). MUI TablePagination needs total item count.
          // Props should probably include `totalRows` if manual.
          // Let's check props.
          // I didn't add totalRows to props in previous step.
          // For manual pagination, we generally know 'total'.
          // Let's assume pageCount * pageSize for now or update props to include `rowCount`.
          // Better: Update props to accept `rowCount`.
          
          // Re-reading previous step... I added `pageCount`.
          // Let's add `rowCount` to props in next step or use what we have.
          // If manualPagination is true, `table.getPrePaginationRowModel().rows.length` is just the current page rows.
          // I need to accept `rowCount` prop.
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
