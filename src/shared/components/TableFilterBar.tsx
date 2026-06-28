import React, { useMemo } from "react";
import FilterBar from "./FilterBar";

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
  /** Optional custom width for this filter input */
  width?: number | string;
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
  initialValues,
}: TableFilterBarProps) {
  const mappedFields = useMemo(
    () =>
      filters.map((f) => ({
        name: f.title,
        label: f.label,
        type: f.type === "DROPDOWN" ? "select" : f.type === "DATE" ? "date" : "text",
        options: f.dataItems,
        value: initialValues?.[f.title] ?? "",
      })),
    [filters, initialValues]
  );

  return (
    <FilterBar
      fields={mappedFields as any}
      onSearch={onSearch}
      onClear={onClear}
      searchLabel="Αναζήτηση"
      clearLabel={clearButtonTitle}
    />
  );
}
