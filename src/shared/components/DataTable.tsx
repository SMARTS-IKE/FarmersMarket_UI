import { useState, useMemo, useEffect } from "react";
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
  Paper,
  Typography,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import InputAdornment from "@mui/material/InputAdornment";
import TableFilterBar from "./TableFilterBar";
import type { FilterDef, FilterValues } from "./TableFilterBar";
import { useLayoutSlot } from "../../lib/layoutSlotContext";

export type { FilterDef, FilterValues };
export type { FilterType, DropdownItem } from "./TableFilterBar";

// ── Column definitions ───────────────────────────────────────────
export interface ColumnDef<T> {
  /** Unique key, used to access row data if no `render` is provided */
  key: keyof T | string;
  /** Column header label */
  label: string;
  /** Optional custom cell renderer */
  render?: (row: T) => React.ReactNode;
  /** Whether this column participates in global filter matching (default: true) */
  filterable?: boolean;
}

interface DataTableProps<T> {
  rows: T[];
  columns: ColumnDef<T>[];
  /** Unique key per row – used as React key */
  rowKey: keyof T;
  /** Label shown above the table (optional) */
  title?: string;
  /** Placeholder text for the global filter input */
  filterPlaceholder?: string;
  /** Rows per page options */
  rowsPerPageOptions?: number[];
  /** Default rows per page */
  defaultRowsPerPage?: number;
  /** Whether to show the global text filter input (default: true) */
  showFilter?: boolean;
  /** Declarative filter bar above the table */
  filters?: FilterDef[];
  /** Initial values for declarative filters */
  initialFilterValues?: FilterValues;
  /** Called when the user clicks the Search button; receives filter title→value map */
  onSearch?: (values: FilterValues) => void;
  /** Optional callback to clear all declarative filters */
  onClearFilters?: () => void;
  /** Optional clear button label shown on declarative filter bar */
  clearFiltersButtonTitle?: string;
  /** Optional clear button background color shown on declarative filter bar */
  clearFiltersButtonBackgroundColor?: string;
  /** Optional clear button prefix icon shown on declarative filter bar */
  clearFiltersPrefixIcon?: React.ReactNode;
  /** Optional row click handler for selection-driven flows */
  onRowClick?: (row: T) => void;
  /** Hide built-in pagination when data is already paged by the backend */
  hidePagination?: boolean;
  /** Controlled page index for server-side pagination (zero-based) */
  page?: number;
  /** Controlled rows per page for server-side pagination */
  rowsPerPage?: number;
  /** Total number of rows for server-side pagination */
  totalCount?: number;
  /** Controlled page change callback for server-side pagination */
  onPageChange?: (page: number) => void;
  /** Controlled rows-per-page change callback for server-side pagination */
  onRowsPerPageChange?: (rowsPerPage: number) => void;
  /** Optional content shown at the start of the pagination row */
  paginationPrefix?: React.ReactNode;
}

// ── Main DataTable component ─────────────────────────────────────
export default function DataTable<T extends object>({
  rows = [],
  columns = [],
  rowKey,
  title,
  filterPlaceholder = "Αναζήτηση…",
  rowsPerPageOptions = [10, 25, 50],
  defaultRowsPerPage = 10,
  showFilter = true,
  filters,
  initialFilterValues,
  onSearch,
  onClearFilters,
  clearFiltersButtonTitle,
  clearFiltersButtonBackgroundColor,
  clearFiltersPrefixIcon,
  onRowClick,
  hidePagination = false,
  page,
  rowsPerPage,
  totalCount,
  onPageChange,
  onRowsPerPageChange,
  paginationPrefix,
}: DataTableProps<T>) {
  const [filterText, setFilterText] = useState("");
  const [internalPage, setInternalPage] = useState(0);
  const [internalRowsPerPage, setInternalRowsPerPage] = useState(defaultRowsPerPage);
  const { setFilterSlot } = useLayoutSlot();

  const isControlledPagination =
    page !== undefined &&
    rowsPerPage !== undefined &&
    onPageChange !== undefined &&
    onRowsPerPageChange !== undefined;

  const currentPage = isControlledPagination ? page : internalPage;
  const currentRowsPerPage = isControlledPagination ? rowsPerPage : internalRowsPerPage;

  useEffect(() => {
    if (filters && filters.length > 0 && onSearch) {
      setFilterSlot(
        <TableFilterBar
          filters={filters}
          onSearch={onSearch}
          onClear={onClearFilters}
          clearButtonTitle={clearFiltersButtonTitle}
          clearButtonBackgroundColor={clearFiltersButtonBackgroundColor}
          clearButtonPrefixIcon={clearFiltersPrefixIcon}
          initialValues={initialFilterValues}
        />
      );
    }
    return () => setFilterSlot(null);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, onSearch, onClearFilters, clearFiltersButtonTitle, clearFiltersButtonBackgroundColor, clearFiltersPrefixIcon, initialFilterValues]);

  const filterableCols = useMemo(
    () => columns.filter((c) => c.filterable !== false),
    [columns]
  );

  const filteredRows = useMemo(() => {
    const query = filterText.trim().toLowerCase();
    if (!query) return rows;
    return rows.filter((row) =>
      filterableCols.some((col) => {
        const value = (row as Record<string, unknown>)[col.key as string];
        return String(value ?? "").toLowerCase().includes(query);
      })
    );
  }, [rows, filterText, filterableCols]);

  const paginatedRows = useMemo(
    () => (isControlledPagination
      ? filteredRows
      : filteredRows.slice(currentPage * currentRowsPerPage, currentPage * currentRowsPerPage + currentRowsPerPage)),
    [filteredRows, isControlledPagination, currentPage, currentRowsPerPage]
  );

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilterText(e.target.value);
    if (isControlledPagination) {
      onPageChange(0);
      return;
    }

    setInternalPage(0);
  };

  const handleChangePage = (_: unknown, newPage: number) => {
    if (isControlledPagination) {
      onPageChange(newPage);
      return;
    }

    setInternalPage(newPage);
  };

  const handleChangeRowsPerPage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nextRowsPerPage = parseInt(e.target.value, 10);

    if (isControlledPagination) {
      onRowsPerPageChange(nextRowsPerPage);
      return;
    }

    setInternalRowsPerPage(nextRowsPerPage);
    setInternalPage(0);
  };

  const getCellContent = (row: T, col: ColumnDef<T>): React.ReactNode => {
    if (col.render) return col.render(row);
    const value = (row as Record<string, unknown>)[col.key as string];
    return value != null ? String(value) : "—";
  };

  return (
    <Box className="flex flex-col gap-4">
      {/* Title + global search row */}
      {(title || showFilter) && (
        <Box className="flex items-center justify-between gap-4 flex-wrap">
          {title && (
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              {title}
            </Typography>
          )}
          {showFilter && (
            <TextField
              size="small"
              placeholder={filterPlaceholder}
              value={filterText}
              onChange={handleFilterChange}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" />
                    </InputAdornment>
                  ),
                },
              }}
              sx={{ minWidth: 220 }}
            />
          )}
        </Box>
      )}

      <Paper variant="outlined">
        <TableContainer>
          <Table size="small">
            <TableHead sx={{ backgroundColor: 'var(--color-text-muted)', }}>
              <TableRow>
                {columns.map((col) => (
                  <TableCell sx={{ color: 'var(--color-surface)', fontWeight: 700 }} key={String(col.key)}>
                    {col.label}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedRows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={columns.length} align="center" sx={{ py: 4 }}>
                    Δεν βρέθηκαν αποτελέσματα.
                  </TableCell>
                </TableRow>
              ) : (
                paginatedRows.map((row, index) => (
                  <TableRow
                    key={String((row as Record<string, unknown>)[rowKey as string])}
                    hover
                    onClick={onRowClick ? () => onRowClick(row) : undefined}
                    sx={{
                      backgroundColor: index % 2 === 0 ? "var(--color-bg)" : "var(--color-border-subtle)",
                      cursor: onRowClick ? "pointer" : "default",
                    }}
                  >
                    {columns.map((col) => (
                      <TableCell key={String(col.key)}>
                        {getCellContent(row, col)}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {!hidePagination && (
          <Box
            className="flex flex-wrap items-center justify-between gap-3 px-4"
            sx={{
              minHeight: 35,
              backgroundColor: "var(--color-dark)",
              color: "var(--color-surface)",
            }}
          >
            {paginationPrefix ? (
              <Typography variant="body2" sx={{ fontWeight: 600, color: "inherit" }}>
                {paginationPrefix}
              </Typography>
            ) : (
              <Box />
            )}

            <TablePagination
              labelRowsPerPage="Αποτελέσματα ανά σελίδα:"
              component="div"
              count={isControlledPagination ? (totalCount ?? filteredRows.length) : filteredRows.length}
              page={currentPage}
              onPageChange={handleChangePage}
              rowsPerPage={currentRowsPerPage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              rowsPerPageOptions={rowsPerPageOptions}
              sx={{
                minHeight: 35,
                height: 35,
                backgroundColor: "transparent",
                color: "var(--color-surface)",
                overflow: "hidden",
                marginLeft: "auto",
                "& .MuiTablePagination-toolbar": { minHeight: 35, height: 35, paddingTop: 0, paddingBottom: 0, paddingRight: 0 },
                "& .MuiTablePagination-spacer": { display: "none" },
                "& .MuiSelect-icon": { color: "var(--color-surface)" },
                "& .MuiIconButton-root": { color: "var(--color-surface)" },
                "& .MuiIconButton-root.Mui-disabled": { color: "var(--color-text-muted)" },
              }}
            />
          </Box>
        )}
      </Paper>
    </Box>
  );
}
