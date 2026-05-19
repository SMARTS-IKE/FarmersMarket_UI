import { useState, useMemo, useEffect } from "react";
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
  onClear?: () => void;
  clearButtonTitle?: string;
  clearButtonBackgroundColor?: string;
  clearButtonPrefixIcon?: React.ReactNode;
  initialValues?: FilterValues;
}

export default function TableFilterBar({
  filters,
  onSearch,
  onClear,
  clearButtonTitle = "Καθαρισμός",
  clearButtonBackgroundColor = "var(--color-text-muted)",
  clearButtonPrefixIcon,
  initialValues,
}: TableFilterBarProps) {
  const initial = useMemo(
    () => Object.fromEntries(filters.map((f) => [f.title, initialValues?.[f.title] ?? ""])) as FilterValues,
    [filters, initialValues]
  );
  const [values, setValues] = useState<FilterValues>(initial);

  useEffect(() => {
    setValues(initial);
  }, [initial]);

  const handleChange = (title: string, value: string | number) => {
    setValues((prev) => ({ ...prev, [title]: value }));
  };

  const handleSearch = () => {
    onSearch(values);
  };

  const handleClear = () => {
    setValues(initial);
    onClear?.();
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

      {onClear && (
        <CustomButton
          title={clearButtonTitle}
          prefixIcon={clearButtonPrefixIcon}
          backgroundColor={clearButtonBackgroundColor}
          onClick={handleClear}
          width={140}
        />
      )}
    </Box>
  );
}
