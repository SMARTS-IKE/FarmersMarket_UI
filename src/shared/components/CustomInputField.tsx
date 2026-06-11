import {
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  FormHelperText,
  InputAdornment,
  Box,
  Chip,
  Input,
} from "@mui/material";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import type { SxProps, Theme } from "@mui/material";
import { useState } from "react";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { el } from "date-fns/locale";

const GREECE_TIMEZONE = "Europe/Athens";

export type InputFieldType = "TEXT" | "NUMBER" | "TEXTAREA" | "DROPDOWN" | "MULTI_SELECT" | "DATE";

export interface DropdownOption {
  label: string;
  value: string | number;
}

export interface ValidationRules {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: RegExp;
  patternMessage?: string;
}

interface CustomInputFieldProps {
  type?: InputFieldType;
  label?: string;
  value?: string | number | string[];
  defaultValue?: string | number;
  placeholder?: string;
  disabled?: boolean;
  backgroundColor?: string;
  width?: number | string;
  prefixIcon?: React.ReactNode;
  dropdownItems?: DropdownOption[];
  disabledDropdownValues?: Array<string | number>;
  validation?: ValidationRules;
  showValidation?: boolean;
  error?: string;
  onChange?: (value: string | number | string[]) => void;
  onBlur?: () => void;
  sx?: SxProps<Theme>;
}

function validate(
  value: string | number | string[] | undefined,
  rules: ValidationRules,
  type: InputFieldType
): string {
  const strValue = Array.isArray(value) ? value.join(",") : String(value ?? "");
  const numValue = Number(value);

  if (
    rules.required &&
    (Array.isArray(value) ? value.length === 0 : strValue.trim() === "")
  ) {
    return "Το πεδίο είναι υποχρεωτικό.";
  }
  if (rules.minLength && strValue.length < rules.minLength) {
    return `Ελάχιστος αριθμός χαρακτήρων: ${rules.minLength}.`;
  }
  if (rules.maxLength && strValue.length > rules.maxLength) {
    return `Μέγιστος αριθμός χαρακτήρων: ${rules.maxLength}.`;
  }
  if (type === "NUMBER") {
    if (isNaN(numValue)) return "Εισάγετε έγκυρο αριθμό.";
    if (rules.min !== undefined && numValue < rules.min) {
      return `Ελάχιστη τιμή: ${rules.min}.`;
    }
    if (rules.max !== undefined && numValue > rules.max) {
      return `Μέγιστη τιμή: ${rules.max}.`;
    }
  }
  if (rules.pattern && !rules.pattern.test(strValue)) {
    return rules.patternMessage ?? "Μη έγκυρη μορφή.";
  }
  return "";
}

function toDateInputValue(value: string | number | string[] | undefined): string {
  if (value === undefined || Array.isArray(value) || value === "") return "";

  const raw = String(value);

  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;

  const greekFormatMatch = raw.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (greekFormatMatch) {
    const [, day, month, year] = greekFormatMatch;
    return `${year}-${month}-${day}`;
  }

  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) return raw;

  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: GREECE_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(parsed);

  const year = parts.find((part) => part.type === "year")?.value;
  const month = parts.find((part) => part.type === "month")?.value;
  const day = parts.find((part) => part.type === "day")?.value;

  if (!year || !month || !day) return raw;
  return `${year}-${month}-${day}`;
}

function parseDateValue(value: string | number | string[] | undefined): Date | null {
  if (value === undefined || Array.isArray(value) || value === "") return null;

  const normalized = toDateInputValue(value);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(normalized)) return null;

  const parsed = new Date(`${normalized}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return null;

  return parsed;
}

function toIsoDateString(date: Date): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: GREECE_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);

  const year = parts.find((part) => part.type === "year")?.value;
  const month = parts.find((part) => part.type === "month")?.value;
  const day = parts.find((part) => part.type === "day")?.value;

  if (!year || !month || !day) return "";
  return `${year}-${month}-${day}`;
}
export default function CustomInputField({
  type = "TEXT",
  label,
  value,
  defaultValue,
  placeholder,
  disabled = false,
  backgroundColor,
  width = 240,
  prefixIcon,
  dropdownItems = [],
  disabledDropdownValues = [],
  validation,
  showValidation = true,
  error,
  onChange,
  onBlur,
  sx,
}: CustomInputFieldProps) {
  const normalizedDateValue = type === "DATE"
    ? toDateInputValue((value ?? defaultValue) as string)
    : (value ?? defaultValue ?? "");

  const shouldValidate = showValidation !== false;
  const internalError =
    error ?? (shouldValidate && validation && value !== undefined
      ? validate(value, validation, type)
      : "");

  const focusSx: SxProps<Theme> = {
    "& .MuiInput-underline:after": { borderBottomColor: "var(--color-dark)" },
    "& .MuiFormLabel-root.Mui-focused": { color: "var(--color-dark)" },
  };

  const placeholderSx: SxProps<Theme> = {
    "& .MuiInputBase-input::placeholder": {
      fontSize: "0.65rem",
      fontWeight: 500,
      opacity: 1,
    },
  };

  const labelSx: SxProps<Theme> = {
    "& .MuiInputLabel-root, & .MuiFormLabel-root": {
      fontWeight: 600,
    },
  };

  const sharedSx: SxProps<Theme> = {
    width,
    ...(backgroundColor && {
      "& .MuiInputBase-root": { backgroundColor },
    }),
    ...focusSx,
    ...placeholderSx,
    ...labelSx,
    ...sx,
  };

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [multiOpen, setMultiOpen] = useState(false);

  const dropdownMenuProps = {
    slotProps: {
      paper: {
        sx: {
          mt: 0.5,
          borderRadius: "14px",
          border: "1px solid var(--color-border)",
          boxShadow: "var(--shadow-lg)",
          p: "4px",
        },
      },
      list: {
        sx: {
          p: 0,
        },
      },
    },
  };

  const dropdownMenuItemSx: SxProps<Theme> = {
    width: "100%",
    boxSizing: "border-box",
    borderRadius: "8px",
    my: 0,
    mx: 0,
    px: 2,
    minHeight: 36,
    fontWeight: 500,
    "&.Mui-selected": {
      backgroundColor: "#C4B5A0",
      color: "#ffffff",
      fontWeight: 700,
    },
    "&.Mui-selected:hover": {
      backgroundColor: "#ECE5DC",
    },
    "&:hover": {
      backgroundColor: "#F7F3EE",
    },
  };

  if (type === "MULTI_SELECT") {
    const multiValue = Array.isArray(value) ? value : [];
    return (
      <FormControl
        variant="standard"
        disabled={disabled}
        error={!!internalError}
        sx={{ width, ...sx }}
      >
        {label && <InputLabel>{label}</InputLabel>}
        <Select
          multiple
          open={multiOpen}
          onOpen={() => setMultiOpen(true)}
          onClose={() => setMultiOpen(false)}
          value={multiValue}
          onChange={(e) => onChange?.(e.target.value as string[])}
          onBlur={onBlur}
          MenuProps={dropdownMenuProps}
          input={<Input />}
          IconComponent={() => null}
          endAdornment={
            <InputAdornment
              position="end"
              sx={{ mr: "2px", cursor: "pointer" }}
              onClick={() => !disabled && setMultiOpen((prev) => !prev)}
            >
              <Box
                component="span"
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 28,
                  height: 28,
                  borderRadius: "4px",
                  backgroundColor: backgroundColor ?? "var(--color-text)",
                  "& svg": {
                    transition: "transform 200ms",
                    transform: multiOpen ? "rotate(180deg)" : "rotate(0deg)",
                    color: "var(--color-surface)",
                    fontSize: 20,
                  },
                }}
              >
                <ArrowDropDownIcon />
              </Box>
            </InputAdornment>
          }
          renderValue={(selected) => (
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
              {(selected as string[]).map((val) => (
                <Chip
                  key={val}
                  label={dropdownItems.find((d) => d.value === val)?.label ?? val}
                  size="small"
                />
              ))}
            </Box>
          )}
          sx={{
            "&:before": { borderBottomColor: "rgba(0, 0, 0, 0.42)" },
            "&:hover:not(.Mui-disabled):before": { borderBottomColor: "rgba(0, 0, 0, 0.87)" },
            "&:after": { borderBottomColor: "var(--color-dark)" },
            ...sx,
          }}
        >
          {dropdownItems.map((item) => (
            <MenuItem
              key={item.value}
              value={item.value as string}
              disabled={disabledDropdownValues.includes(item.value)}
              sx={dropdownMenuItemSx}
            >
              {item.label}
            </MenuItem>
          ))}
        </Select>
        {internalError && <FormHelperText>{internalError}</FormHelperText>}
      </FormControl>
    );
  }

  if (type === "DROPDOWN") {
    return (
      <FormControl
        variant="standard"
        disabled={disabled}
        error={!!internalError}
        sx={{
          width,
          "& .MuiInput-underline:after": { borderBottomColor: "var(--color-dark)" },
          "& .MuiFormLabel-root.Mui-focused": { color: "var(--color-dark)" },
          ...labelSx,
          ...sx,
        }}
      >
        {label && <InputLabel>{label}</InputLabel>}
        <Select
          variant="standard"
          open={dropdownOpen}
          onOpen={() => setDropdownOpen(true)}
          onClose={() => setDropdownOpen(false)}
          value={value ?? defaultValue ?? ""}
          onChange={(e) => onChange?.(e.target.value as string | number)}
          onBlur={onBlur}
          MenuProps={dropdownMenuProps}
          IconComponent={() => null}
          endAdornment={
            <InputAdornment
              position="end"
              sx={{ mr: "2px", cursor: "pointer" }}
              onClick={() => !disabled && setDropdownOpen((prev) => !prev)}
            >
              <Box
                component="span"
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 28,
                  height: 28,
                  borderRadius: "4px",
                  backgroundColor: backgroundColor ?? "var(--color-text)",
                  "& svg": {
                    transition: "transform 200ms",
                    transform: dropdownOpen ? "rotate(180deg)" : "rotate(0deg)",
                    color: "var(--color-surface)",
                    fontSize: 20,
                  },
                }}
              >
                <ArrowDropDownIcon />
              </Box>
            </InputAdornment>
          }
          startAdornment={
            prefixIcon ? (
              <InputAdornment position="start">{prefixIcon}</InputAdornment>
            ) : undefined
          }
        >
          <MenuItem value="" sx={dropdownMenuItemSx}>
            <em>Επιλέξτε…</em>
          </MenuItem>
          {dropdownItems.map((item) => (
            <MenuItem
              key={item.value}
              value={item.value}
              disabled={disabledDropdownValues.includes(item.value)}
              sx={dropdownMenuItemSx}
            >
              {item.label}
            </MenuItem>
          ))}
        </Select>
        {internalError && <FormHelperText>{internalError}</FormHelperText>}
      </FormControl>
    );
  }

  if (type === "TEXTAREA") {
    return (
      <Box sx={{ width }}>
        <TextField
          label={label}
          placeholder={placeholder}
          value={value ?? defaultValue ?? ""}
          disabled={disabled}
          multiline
          minRows={3}
          fullWidth
          error={!!internalError}
          helperText={internalError}
          onChange={(e) => onChange?.(e.target.value)}
          onBlur={onBlur}
          slotProps={{
            input: {
              startAdornment: prefixIcon ? (
                <InputAdornment position="start">{prefixIcon}</InputAdornment>
              ) : undefined,
            },
          }}
          sx={{
            ...(backgroundColor && {
              "& .MuiInputBase-root": { backgroundColor },
            }),
            ...placeholderSx,
            ...labelSx,
            "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "var(--color-dark)" },
            "& .MuiFormLabel-root.Mui-focused": { color: "var(--color-dark)" },
            ...sx,
          }}
        />
      </Box>
    );
  }

  if (type === "DATE") {
    return (
      <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={el}>
        <DatePicker
          label={label}
          format="dd/MM/yyyy"
          value={parseDateValue(value ?? defaultValue)}
          disabled={disabled}
          onChange={(newValue) => {
            if (!newValue) {
              onChange?.("");
              return;
            }

            const isoDate = toIsoDateString(newValue);
            if (isoDate) {
              onChange?.(isoDate);
            }
          }}
          slotProps={{
            textField: {
              variant: "standard",
              placeholder,
              error: !!internalError,
              helperText: internalError,
              onBlur,
              sx: sharedSx,
              slotProps: {
                inputLabel: { shrink: true },
                input: {
                  startAdornment: prefixIcon ? (
                    <InputAdornment position="start">{prefixIcon}</InputAdornment>
                  ) : undefined,
                },
              },
            } as any,
          }}
        />
      </LocalizationProvider>
    );
  }

  return (
    <TextField
      variant="standard"
      label={label}
      placeholder={placeholder}
      type={type === "NUMBER" ? "number" : "text"}
      value={normalizedDateValue}
      disabled={disabled}
      error={!!internalError}
      helperText={internalError}
      onChange={(e) => {
        onChange?.(e.target.value);
      }}
      onBlur={onBlur}
      slotProps={{
        inputLabel: undefined,
        input: {
          startAdornment: prefixIcon ? (
            <InputAdornment position="start">{prefixIcon}</InputAdornment>
          ) : undefined,
        },
      }}
      sx={sharedSx}
    />
  );
}
