import React, { useMemo, useState } from "react";
import CustomInputField from "./CustomInputField";
import CustomButton from "./CustomButton";
import type { FilterBarProps, FilterField } from "../../models/filter";
import { Box } from "@mui/material";
import { useQueryClient } from "@tanstack/react-query";

function mapType(t?: string) {
  switch (t) {
    case "number":
      return "NUMBER";
    case "select":
      return "DROPDOWN";
    case "multi_select":
      return "MULTI_SELECT";
    case "date":
      return "DATE";
    case "textarea":
      return "TEXTAREA";
    default:
      return "TEXT";
  }
}

export default function FilterBar({
  fields = [],
  customFilters,
  onSearch,
  onClear,
  searchLabel = "Search",
  clearLabel = "Clear",
  showSearchButton = true,
  showClearButton = true,
  extraActions,
  invalidateQueryKeys,
  invalidateAllOnSearch,
}: FilterBarProps) {
  const queryClient = useQueryClient();
  const initialValues = useMemo(() => {
    const obj: Record<string, any> = {};
    fields.forEach((f) => {
      obj[f.name] = f.value ?? "";
    });
    return obj;
  }, [fields]);

  const [values, setValues] = useState<Record<string, any>>(initialValues);

  const handleFieldChange = (f: FilterField, value: any) => {
    if (f.onChange) {
      f.onChange(value);
      return;
    }
    setValues((prev) => ({ ...prev, [f.name]: value }));
  };

  const handleSearch = async () => {
    try {
      if (invalidateAllOnSearch) {
        await queryClient.invalidateQueries();
      } else if (invalidateQueryKeys) {
        if (Array.isArray(invalidateQueryKeys)) {
          await Promise.all(
            invalidateQueryKeys.map((k) => queryClient.invalidateQueries(k))
          );
        } else {
          await queryClient.invalidateQueries(invalidateQueryKeys);
        }
      }
    } catch (e) {
      // proceed even if invalidation fails
    }

    onSearch?.(values);
  };

  const handleClear = () => {
    const cleared: Record<string, any> = {};
    fields.forEach((f) => (cleared[f.name] = ""));
    setValues(cleared);
    onClear?.();
  };

  return (
    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2, flexWrap: "wrap" }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap", flex: "1 1 auto", minWidth: 0 }}>
        {customFilters}
        {fields.map((f) => {
          if (f.type === "custom") return <React.Fragment key={f.name}>{f.component}</React.Fragment>;

          const inputType = mapType(f.type);

          return (
            <div key={f.name} style={{ minWidth: 120, flex: '0 0 auto' }}>
              <CustomInputField
                width="250px"
                type={inputType as any}
                label={f.label}
                placeholder={f.placeholder}
                value={f.onChange ? f.value : values[f.name]}
                dropdownItems={f.options ?? []}
                onChange={(v) => handleFieldChange(f, v)}
              />
            </div>
          );
        })}
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        {extraActions}
        {showClearButton && (
          <CustomButton
            title={clearLabel}
            onClick={handleClear}
            width={110}
            backgroundColor="transparent"
            sx={{
              color: '#111827',
              border: '1px solid #111827',
              '&:hover': { backgroundColor: 'rgba(17,24,39,0.04)' },
            }}
          />
        )}
        {showSearchButton && (
          <CustomButton title={searchLabel} onClick={handleSearch} width={110} />
        )}
      </Box>
    </Box>
  );
}
