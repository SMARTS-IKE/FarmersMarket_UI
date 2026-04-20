import { useState, useMemo } from "react";
import { Box } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import CustomButton from "./CustomButton";
import CustomInputField from "./CustomInputField";

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
      className="flex flex-wrap items-end gap-3 rounded-sm "
      onKeyDown={handleKeyDown}
    >
      {filters.map((filter) => {
        if (filter.type === "DROPDOWN") {
          return (
            <CustomInputField
              key={filter.title}
              type="DROPDOWN"
              label={filter.label}
              value={values[filter.title] ?? ""}
              dropdownItems={filter.dataItems}
              onChange={(val) => handleChange(filter.title, val)}
              width={160}
            />
          );
        }

        if (filter.type === "DATE") {
          return (
            <CustomInputField
              key={filter.title}
              type="DATE"
              label={filter.label}
              value={values[filter.title] ?? ""}
              onChange={(val) => handleChange(filter.title, val)}
              width={160}
            />
          );
        }

        // TEXT (default)
        return (
          <CustomInputField
            key={filter.title}
            type="TEXT"
            label={filter.label}
            value={values[filter.title] ?? ""}
            onChange={(val) => handleChange(filter.title, val)}
            width={160}
          />
        );
      })}

      <CustomButton
        title="Αναζήτηση"
        prefixIcon={<SearchIcon />}
        onClick={handleSearch}
        width={140}
      />
    </Box>
  );
}
