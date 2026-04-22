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
  error?: string;
  onChange?: (value: string | number | string[]) => void;
  onBlur?: () => void;
  sx?: SxProps<Theme>;
}

function validate(
  value: string | number | undefined,
  rules: ValidationRules,
  type: InputFieldType
): string {
  const strValue = String(value ?? "");
  const numValue = Number(value);

  if (rules.required && strValue.trim() === "") {
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
  error,
  onChange,
  onBlur,
  sx,
}: CustomInputFieldProps) {
  const internalError =
    error ?? (validation && value !== undefined && !Array.isArray(value)
      ? validate(value, validation, type)
      : "");

  const focusSx: SxProps<Theme> = {
    "& .MuiInput-underline:after": { borderBottomColor: "var(--color-dark)" },
    "& .MuiFormLabel-root.Mui-focused": { color: "var(--color-dark)" },
  };

  const sharedSx: SxProps<Theme> = {
    width,
    ...(backgroundColor && {
      "& .MuiInputBase-root": { backgroundColor },
    }),
    ...focusSx,
    ...sx,
  };

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [multiOpen, setMultiOpen] = useState(false);

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
                  backgroundColor: backgroundColor ?? "var(--color-dark)",
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
                  backgroundColor: backgroundColor ?? "var(--color-dark)",
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
          <MenuItem value="">
            <em>Επιλέξτε…</em>
          </MenuItem>
          {dropdownItems.map((item) => (
            <MenuItem
              key={item.value}
              value={item.value}
              disabled={disabledDropdownValues.includes(item.value)}
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
            "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "var(--color-dark)" },
            "& .MuiFormLabel-root.Mui-focused": { color: "var(--color-dark)" },
            ...sx,
          }}
        />
      </Box>
    );
  }

  return (
    <TextField
      variant="standard"
      label={label}
      placeholder={placeholder}
      type={type === "NUMBER" ? "number" : type === "DATE" ? "date" : "text"}
      value={value ?? defaultValue ?? ""}
      disabled={disabled}
      error={!!internalError}
      helperText={internalError}
      onChange={(e) =>
        onChange?.(type === "NUMBER" ? Number(e.target.value) : e.target.value)
      }
      onBlur={onBlur}
      slotProps={{
        inputLabel: type === "DATE" ? { shrink: true } : undefined,
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
