import { useState, useMemo } from "react";
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
  /** Called when the user clicks the Search button; receives filter title→value map */
  onSearch?: (values: FilterValues) => void;
}

// ── Main DataTable component ─────────────────────────────────────
export default function DataTable<T extends object>({
  rows,
  columns,
  rowKey,
  title,
  filterPlaceholder = "Αναζήτηση…",
  rowsPerPageOptions = [10, 25, 50],
  defaultRowsPerPage = 10,
  showFilter = true,
  filters,
  onSearch,
}: DataTableProps<T>) {
  const [filterText, setFilterText] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(defaultRowsPerPage);

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
    () => filteredRows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
    [filteredRows, page, rowsPerPage]
  );

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilterText(e.target.value);
    setPage(0);
  };

  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(e.target.value, 10));
    setPage(0);
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

      {/* Declarative filter bar */}
      {filters && filters.length > 0 && onSearch && (
        <TableFilterBar filters={filters} onSearch={onSearch} />
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
                paginatedRows.map((row) => (
                  <TableRow
                    key={String((row as Record<string, unknown>)[rowKey as string])}
                    hover
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

        <TablePagination
          labelRowsPerPage="Αποτελέσματα ανά σελίδα:"
          component="div"
          count={filteredRows.length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={rowsPerPageOptions}
        />
      </Paper>
    </Box>
  );
}
