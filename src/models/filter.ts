export type FilterFieldType =
  | "text"
  | "number"
  | "select"
  | "multi_select"
  | "date"
  | "textarea"
  | "custom";

export interface FilterOption {
  label: string;
  value: string | number;
}

export interface FilterField {
  name: string;
  label?: string;
  type?: FilterFieldType;
  placeholder?: string;
  options?: FilterOption[];
  value?: any;
  component?: React.ReactNode; // for type: custom
  onChange?: (value: any) => void;
}

export interface FilterBarProps {
  fields?: FilterField[];
  customFilters?: React.ReactNode; // arbitrary filter nodes
  onSearch?: (values?: Record<string, any>) => void;
  onClear?: () => void;
  searchLabel?: string;
  clearLabel?: string;
  showSearchButton?: boolean;
  showClearButton?: boolean;
  extraActions?: React.ReactNode;
  /** Invalidate these query keys (or key arrays) before running `onSearch` so data is refetched */
  invalidateQueryKeys?: unknown | unknown[];
  /** When true, invalidates all queries before running `onSearch` (use sparingly) */
  invalidateAllOnSearch?: boolean;
}
