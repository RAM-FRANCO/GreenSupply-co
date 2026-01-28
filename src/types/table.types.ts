import type { ColumnDef } from "@tanstack/react-table";
import { SxProps, Theme } from "@mui/material";

/**
 * Extended column metadata for MUI styling
 */
export interface ColumnMeta {
  align?: "left" | "center" | "right";
  width?: number | string;
  hideOnMobile?: boolean;
}

/**
 * Generic column definition - uses TanStack's ColumnDef directly
 *
 * Note: We use `any` for the second type parameter because TanStack Table v8
 * has complex generic inference that breaks when combined with MUI cell renderers.
 * This is a known limitation documented in TanStack Table's TypeScript guide.
 * @see https://tanstack.com/table/v8/docs/guide/typescript
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type DataTableColumn<T> = ColumnDef<T, any>;

/**
 * Props for the DataTable component
 */
export interface DataTableProps<T> {
  /** Data array to display */
  readonly data: T[];
  /** Column definitions */
  readonly columns: DataTableColumn<T>[];
  /** Optional table title */
  readonly title?: string;
  /** Optional header actions (buttons, filters) */
  readonly headerActions?: React.ReactNode;
  /** Enable/disable sorting (default: true) */
  readonly enableSorting?: boolean;
  /** Enable/disable pagination (default: true) */
  readonly enablePagination?: boolean;
  /** Initial page size (default: 10) */
  readonly pageSize?: number;
  /** Loading state */
  readonly isLoading?: boolean;
  /** Empty state message */
  readonly emptyMessage?: string;
  /** Custom empty state component (overrides emptyMessage) */
  readonly emptyState?: React.ReactNode;
  /** Function to render expanded row content */
  readonly renderSubComponent?: (props: { row: T }) => React.ReactNode;
  /** Function to determine if a row can be expanded */
  /** Function to determine if a row can be expanded */
  readonly getRowCanExpand?: (row: T) => boolean;
  /** Total page count for manual pagination */
  readonly pageCount?: number;
  /** Controlled pagination state */
  readonly paginationState?: { pageIndex: number; pageSize: number };
  /** Callback for pagination changes */
  readonly onPaginationChange?: (state: { pageIndex: number; pageSize: number }) => void;
  /** Row click handler */
  readonly onRowClick?: (row: T) => void;
  /** Total row count (optional override) */
  readonly rowCount?: number;
  /** Custom styles */
  readonly sx?: SxProps<Theme>;
}
