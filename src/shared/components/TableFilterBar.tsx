import { useState, useMemo } from "react";
import {
  Box,
  TextField,
  MenuItem,
  Button,
  Select,
  FormControl,
  InputLabel,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";

export type FilterType = "TEXT" | "DROPDOWN" | "DATE";

export interface DropdownItem {
  label: string;
  value: string | number;
}

export interface FilterDef {
  /** The key that will be returned in the onSearch callback */
  title: string;
  /** Display label shown above the input */
  label: string;
  type: FilterType;
  /** Required for DROPDOWN type */
  dataItems?: DropdownItem[];
}

export type FilterValues = Record<string, string | number | undefined>;

interface TableFilterBarProps {
  filters: FilterDef[];
  onSearch: (values: FilterValues) => void;
}

export default function TableFilterBar({ filters, onSearch }: TableFilterBarProps) {
  const initial = useMemo(
    () => Object.fromEntries(filters.map((f) => [f.title, ""])) as FilterValues,
    [filters]
  );
  const [values, setValues] = useState<FilterValues>(initial);

  const handleChange = (title: string, value: string | number) => {
    setValues((prev) => ({ ...prev, [title]: value }));
  };

  const handleSearch = () => {
    onSearch(values);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSearch();
  };

  return (
    <Box
      className="flex flex-wrap items-end gap-3 rounded-sm border border-gray-200 bg-gray-50 p-4"
      onKeyDown={handleKeyDown}
    >
      {filters.map((filter) => {
        if (filter.type === "DROPDOWN") {
          return (
            <FormControl key={filter.title} size="small" sx={{ minWidth: 160 }}>
              <InputLabel>{filter.label}</InputLabel>
              <Select
                label={filter.label}
                value={values[filter.title] ?? ""}
                onChange={(e) => handleChange(filter.title, e.target.value)}
              >
                <MenuItem value="">
                  <em>Όλα</em>
                </MenuItem>
                {filter.dataItems?.map((item) => (
                  <MenuItem key={item.value} value={item.value}>
                    {item.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          );
        }

        if (filter.type === "DATE") {
          return (
            <TextField
              key={filter.title}
              size="small"
              label={filter.label}
              type="date"
              value={values[filter.title] ?? ""}
              onChange={(e) => handleChange(filter.title, e.target.value)}
              slotProps={{ inputLabel: { shrink: true } }}
              sx={{ minWidth: 160 }}
            />
          );
        }

        // TEXT (default)
        return (
          <TextField
            key={filter.title}
            size="small"
            label={filter.label}
            value={values[filter.title] ?? ""}
            onChange={(e) => handleChange(filter.title, e.target.value)}
            sx={{ minWidth: 160 }}
          />
        );
      })}

      <Button
        variant="contained"
        size="medium"
        startIcon={<SearchIcon />}
        onClick={handleSearch}
        sx={{ height: 40 }}
      >
        Αναζήτηση
      </Button>
    </Box>
  );
}
