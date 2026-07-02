import {
  TextField,
  MenuItem,
  Select,
  FormControl,
  FormHelperText,
  InputAdornment,
  Box,
  Chip,
  Input,
} from "@mui/material";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import type { SxProps, Theme } from "@mui/material";
import { useState, type CSSProperties } from "react";
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
  /** When true, render inputs with transparent background and only a bottom border */
  bottomOnly?: boolean;
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
  bottomOnly = true,
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
  // Keep inputClass empty — styling is provided via MUI `sx` below.
  // Previous Tailwind-like string contained invalid tokens (e.g. border-(--color-border))
  // which prevented correct rendering. Use MUI sx rules instead.
  const inputClass = '';
  const normalizedDateValue = type === "DATE"
    ? toDateInputValue((value ?? defaultValue) as string)
    : (value ?? defaultValue ?? "");

  const shouldValidate = showValidation !== false;
  const internalError =
    error ?? (shouldValidate && validation && value !== undefined
      ? validate(value, validation, type)
      : "");

  const computedWidth = (width === 240 && (type === "DROPDOWN" || type === "MULTI_SELECT")) ? 320 : width;

  const labelFontSize = type === "TEXT" ? '15px' : '12px';

  const focusSx: SxProps<Theme> = {
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
      position: 'absolute',
      top: '-10px',
      left: '-4px',
      zIndex: 1000,
      fontWeight: 600,
      color: 'rgba(0, 0, 0, 0.6)',
      fontSize: '12px',
      fontFamily: 'Roboto, Helvetica, Arial, sans-serif',
    },
  };

  // Overrides for multiline textarea so it doesn't get vertically centered
  // or forced to a single fixed height from the shared styles.
  const textareaOverrideSx: SxProps<Theme> = {
    "& .MuiInputBase-root": {
      height: 'auto',
      minHeight: 40,
      alignItems: 'flex-start',
      paddingTop: 2,
      paddingBottom: 2,
    },
    "& .MuiInputBase-input, & .MuiOutlinedInput-input, & textarea": {
      height: 'auto',
      padding: '4px 16px',
      paddingRight: '40px',
      alignItems: 'flex-start',
      lineHeight: 1.4,
      whiteSpace: 'pre-wrap',
    },
    // position the label a bit higher for multiline boxes
    "& .MuiInputLabel-root:not(.MuiInputLabel-shrink), & .MuiFormLabel-root:not(.MuiInputLabel-shrink)": {
      top: '4px',
      transform: 'translate(16px, 0)'
    }
  };

  const sharedSx: SxProps<Theme> = {
    width: computedWidth,
    // When bottomOnly is true render transparent background + only bottom border
    ...(bottomOnly
      ? {
          "& .MuiInputBase-root": {
            borderRadius: 0,
            border: 'none',
            borderBottom: '2px solid var(--color-dark)',
            height: 40,
            padding: 0,
            display: 'flex',
            alignItems: 'center',
            position: 'relative',
            backgroundColor: 'transparent',
          },
          "& .MuiInputBase-input:not(.MuiSelect-select), & .MuiOutlinedInput-input:not(.MuiSelect-select), & input:not(.MuiSelect-select), & textarea": {
            height: 40,
            padding: '8px 16px',
            paddingRight: '40px',
            display: 'flex',
            alignItems: 'center',
            lineHeight: '1',
            fontSize: 'inherit',
            '&:focus': {
              outline: 'none',
              boxShadow: 'none',
              borderBottom: '2px solid var(--color-dark)',
            },
          },
          "& .MuiSelect-select": { fontSize: '14px' },
                  // Prevent MUI from drawing additional focus outlines/notches
                  "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": { border: 'none' },
                  "& .MuiOutlinedInput-root.Mui-focused": { boxShadow: 'none' },
                  "& .MuiInputBase-root.Mui-focused": { boxShadow: 'none' },
                  "& .MuiInputBase-input:focus": { outline: 'none', boxShadow: 'none' },
        }
      : {
          // Ensure the root input container matches the custom box style
          ...(backgroundColor && {
            "& .MuiInputBase-root": { backgroundColor },
          }),
          "& .MuiInputBase-root": {
            borderRadius: 8,
            border: '2px solid var(--color-dark)',
            height: 40,
            padding: 0,
            display: 'flex',
            alignItems: 'center',
            position: 'relative',
            backgroundColor: backgroundColor ?? 'var(--color-bg)',
          },
          "& .MuiInputBase-input:not(.MuiSelect-select), & .MuiOutlinedInput-input:not(.MuiSelect-select), & input:not(.MuiSelect-select), & textarea": {
            height: 40,
            padding: '0 16px',
            paddingRight: '40px',
            display: 'flex',
            alignItems: 'center',
            lineHeight: '1',
            fontSize: 'inherit',
            '&:focus': {
              outline: 'none',
              boxShadow: 'none',
              borderBottom: 'none',
            },
          },
          "& .MuiSelect-select": { fontSize: '14px' },
        }),
    // ensure placeholder text is left-aligned
    "& .MuiOutlinedInput-input::placeholder, & .MuiInputBase-input::placeholder, & input::placeholder": {
      textAlign: 'left',
    },
    // vertically center labels when not shrunk so label overlaps input centered vertically
    "& .MuiInputLabel-root:not(.MuiInputLabel-shrink), & .MuiFormLabel-root:not(.MuiInputLabel-shrink)": {
      top: bottomOnly ? '45%' : '40%',
      transform: bottomOnly ? 'translate(16px, -50%)' : 'translate(16px, -50%)',
      fontSize: 'inherit',
      fontFamily: 'inherit',
      pointerEvents: 'none',
    },
    // ensure shrunk label uses default small transform (include FormLabel)
    "& .MuiInputLabel-root.MuiInputLabel-shrink, & .MuiFormLabel-root.MuiInputLabel-shrink": {
      transform: 'translate(16px, -9px) scale(1)',
      fontSize: labelFontSize,
      fontFamily: 'Roboto, Helvetica, Arial, sans-serif',
    },
    // place adornments inside the input box on the right
    "& .MuiInputAdornment-root": {
      position: 'absolute',
      right: 8,
      top: '50%',
      transform: 'translateY(-50%)',
      margin: 0,
      display: 'flex',
      alignItems: 'center',
      pointerEvents: 'auto',
    },
    // move the error helper a bit upward so it sits closer to the input/label
    "& .MuiFormHelperText-root.Mui-error": {
      marginTop: '-20px',
      transform: 'translateY(90%)',
      marginBottom: '10px',
    },
    "& .MuiSelect-icon": {
      right: 8,
      color: 'var(--color-text-muted)',
      fontSize: '16px'
    },
    "& .MuiSelect-select:focus": {
      backgroundColor: 'transparent',
      outline: 'none',
      boxShadow: 'none'
    },
    // Ensure native date inputs and their picker icons match the input text color
    "& input[type='date']": {
      color: 'var(--color-dark)'
    },
    "& input[type='date']::-webkit-calendar-picker-indicator": {
      /* Ensure the calendar icon uses the dark color (don't invert it). */
      filter: 'none',
      opacity: 1,
      // Ensure the indicator uses the theme dark color where possible
      color: 'var(--color-dark)'
    },
    // Aggressively disable MUI focus pseudo-elements/outlines that can draw
    // an extra underline or outline on focus. This targets underline pseudo
    // elements and notched outlines across Input/OutlinedInput/Select.
    "& .MuiInput-underline:before, & .MuiInput-underline:after, & .MuiInputBase-root:before, & .MuiInputBase-root:after, & .MuiOutlinedInput-root:before, & .MuiOutlinedInput-root:after, & .MuiOutlinedInput-notchedOutline": {
      border: 'none',
      borderBottom: 'none',
      display: 'none',
    },
    // Remove any residual focus shadows/outlines on focused elements
    "& .Mui-focused, & .Mui-focused *": { boxShadow: 'none', outline: 'none' },
    "& input:focus, & textarea:focus, & .MuiInputBase-input:focus": { outline: 'none', boxShadow: 'none' },
    ...focusSx,
    ...placeholderSx,
    ...labelSx,
    ...sx,
  };

  const customLabelSx: CSSProperties = {
    position: "absolute",
    top: '-10px',
    zIndex: 1000,
    fontWeight: 600,
    color: 'rgba(0, 0, 0, 0.6)',
    fontSize: labelFontSize,
    fontFamily: "Roboto, Helvetica, Arial, sans-serif",
  };

  // Remove MUI "standard" variant underline so custom borders are used instead
  const removeUnderlineSx: SxProps<Theme> = {
    "& .MuiInput-underline:before": { borderBottom: 'none' },
    "& .MuiInput-underline:after": { borderBottom: 'none' },
    "& .MuiInput-root:before": { borderBottom: 'none' },
    "& .MuiInput-root:after": { borderBottom: 'none' },
    "& .MuiSelect-root:before": { borderBottom: 'none' },
    "& .MuiSelect-root:after": { borderBottom: 'none' },
    "& .MuiFormControl-root .MuiInput-underline:before": { borderBottom: 'none' },
    "& .MuiFormControl-root .MuiInput-underline:after": { borderBottom: 'none' },
    "& .MuiOutlinedInput-notchedOutline": { border: 'none !important', display: 'none !important' },
    "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": { border: 'none !important', display: 'none !important' },
    // Also remove any ::before/::after pseudo underlines used by MUI variants
    "& .MuiOutlinedInput-root::before, & .MuiOutlinedInput-root::after, & .MuiInput-root::before, & .MuiInput-root::after, & .MuiInput-underline:before, & .MuiInput-underline:after": {
      border: 'none !important',
      display: 'none !important',
      boxShadow: 'none !important',
    },
    "& .MuiInputBase-root.Mui-focused:before": { borderBottom: 'none !important' },
    "& .MuiInputBase-root.Mui-focused:after": { borderBottom: 'none !important' },
    "& .MuiSelect-select:focus": { backgroundColor: 'transparent' },
  };

  // Merge underline removal into sharedSx
  Object.assign(sharedSx as object, removeUnderlineSx as object);

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [multiOpen, setMultiOpen] = useState(false);
  const [nativeFocused, setNativeFocused] = useState(false);

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
    },
    "&.Mui-selected:hover": {
      backgroundColor: "#ECE5DC",
    },
    "&:hover": {
      backgroundColor: "#F7F3EE",
    }
  };

  if (type === "MULTI_SELECT") {
    const multiValue = Array.isArray(value) ? value.map(String) : [];
    return (
      <FormControl
        variant="standard"
        disabled={disabled}
        error={!!internalError}
        sx={sharedSx}
      >
        {label && <span style={customLabelSx}>{label}</span>}
        <Select
          multiple
          open={multiOpen}
          onOpen={() => setMultiOpen(true)}
          onClose={() => setMultiOpen(false)}
          value={multiValue}
          onChange={(e) => onChange?.(e.target.value as string[])}
          onBlur={onBlur}
          MenuProps={dropdownMenuProps}
          input={<Input className={inputClass} disableUnderline />}
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
                  width: 22,
                  height: 22,
                  borderRadius: "4px",
                  backgroundColor: backgroundColor ?? "var(--color-text)",
                  "& svg": {
                    transition: "transform 200ms",
                    transform: multiOpen ? "rotate(180deg)" : "rotate(0deg)",
                    color: "var(--color-surface)",
                    fontSize: 16,
                  },
                }}
              >
                <ArrowDropDownIcon />
              </Box>
            </InputAdornment>
          }
          renderValue={(selected) => {
            const sel = (selected as string[]) || [];
            if (sel.length === 0) return <em>{placeholder ?? "Επιλέξτε…"}</em>;
            return (
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                {sel.map((val) => (
                  <Chip
                    key={String(val)}
                    label={dropdownItems.find((d) => String(d.value) === String(val))?.label ?? String(val)}
                    size="small"
                  />
                ))}
              </Box>
            );
          }}
          sx={{
            "& .MuiInput-underline:before, & .MuiInput-underline:after": { borderBottom: 'none !important', display: 'none !important' },
            "& .MuiSelect-select:focus": { outline: 'none', boxShadow: 'none' },
            "& .MuiOutlinedInput-notchedOutline": { border: 'none !important', display: 'none !important' },
            ...sx,
          } as any}
        >
          {dropdownItems.map((item) => (
            <MenuItem
              key={String(item.value)}
              value={String(item.value)}
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
        sx={sharedSx}
      >
        {label && <span style={customLabelSx}>{label}</span>}
        <Select
          variant="standard"
          displayEmpty
          open={dropdownOpen}
          onOpen={() => setDropdownOpen(true)}
          onClose={() => setDropdownOpen(false)}
          value={String(value ?? defaultValue ?? "")}
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
                  width: 22,
                  height: 22,
                  borderRadius: "4px",
                  backgroundColor: backgroundColor ?? "var(--color-text)",
                  "& svg": {
                    transition: "transform 200ms",
                    transform: dropdownOpen ? "rotate(180deg)" : "rotate(0deg)",
                    color: "var(--color-surface)",
                    fontSize: 16,
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
          input={<Input className={inputClass} disableUnderline />}
          renderValue={(selected) => {
            const sel = selected as string | number | undefined;
            if (sel === undefined || sel === "") return <em>{placeholder ?? "Επιλέξτε…"}</em>;
            const found = dropdownItems.find((d) => String(d.value) === String(sel));
            return found ? String(found.label) : String(sel);
          }}
          sx={{
            "& .MuiInput-underline:before, & .MuiInput-underline:after": { borderBottom: 'none !important', display: 'none !important' },
            "& .MuiSelect-select:focus": { outline: 'none', boxShadow: 'none' },
            "& .MuiOutlinedInput-notchedOutline": { border: 'none !important', display: 'none !important' },
            ...sx,
          } as any}
        >
          <MenuItem value="" sx={dropdownMenuItemSx}>
            <em>Επιλέξτε…</em>
          </MenuItem>
          {dropdownItems.map((item) => (
            <MenuItem
              key={String(item.value)}
              value={String(item.value)}
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
     const labelStyle: CSSProperties = {
      position: 'absolute',
      left: -4,
      top: -12,
      transform: 'translate(0,0) scale(0.85)',
      transformOrigin: 'left top',
      fontWeight: 600,
      color: 'rgba(0,0,0,0.6)',
      fontSize: '15px',
      backgroundColor: 'transparent',
      padding: '0 4px',
      pointerEvents: 'none',
    };
      if (bottomOnly) {
      const inputId = `custom-textarea-${Math.random().toString(36).slice(2, 9)}`;
      return (
        <Box sx={sharedSx}>
          <Box sx={{ position: 'relative' }}>
            {label && (
              <label htmlFor={inputId} style={labelStyle}>
                {label}
              </label>
            )}
            <textarea
              id={inputId}
              value={value ?? defaultValue ?? ''}
              onChange={(e) => onChange?.(e.target.value)}
              onFocus={() => setNativeFocused(true)}
              onBlur={() => { setNativeFocused(false); onBlur?.(); }}
              disabled={disabled}
              placeholder={placeholder}
              rows={3}
              style={{
                width: '100%',
                minHeight: 80,
                padding: '8px 0',
                border: 'none',
                borderBottom: '2px solid var(--color-dark)',
                background: 'transparent',
                outline: 'none',
                fontFamily: 'inherit',
                resize: 'vertical',
              }}
            />
          </Box>
          {internalError && <FormHelperText error>{internalError}</FormHelperText>}
        </Box>
      );
    }

    return (
      <Box sx={sharedSx}>
        <TextField
          label={label}
          placeholder={placeholder}
          value={value ?? defaultValue ?? ""}
          disabled={disabled}
          variant="outlined"
          multiline
          minRows={3}
          fullWidth
          error={!!internalError}
          helperText={internalError}
          onChange={(e) => onChange?.(e.target.value)}
          onBlur={onBlur}
          slotProps={{
            inputLabel: { shrink: true },
            input: {
              className: inputClass,
              startAdornment: prefixIcon ? (
                <InputAdornment position="start">{prefixIcon}</InputAdornment>
              ) : undefined,
            },
          }}
          sx={{
            ...(bottomOnly
              ? {
                  "& .MuiInputBase-root": {
                    backgroundColor: 'transparent',
                    border: 'none',
                    borderBottom: '2px solid var(--color-dark)',
                    borderRadius: 0,
                  },
                }
              : {
                  ...(backgroundColor && {
                    "& .MuiInputBase-root": { backgroundColor },
                  }),
                }),
            ...placeholderSx,
            ...labelSx,
            ...(bottomOnly
              ? {
                  "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": { border: 'none' },
                }
              : { "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "var(--color-dark)" } }),
            "& .MuiFormLabel-root.Mui-focused": { color: "var(--color-dark)" },
            ...sharedSx,
            ...textareaOverrideSx,
            ...sx,
            height: 'auto',
          } as any}
        />
      </Box>
    );
  }

  if (type === "DATE") {
     const labelStyle: CSSProperties = {
      position: 'absolute',
      left: '-2px',
      top: -10,
      transform: 'translate(0,0) scale(0.85)',
      transformOrigin: 'left top',
      fontWeight: 600,
      color: 'rgba(0,0,0,0.6)',
      fontSize: '15px',
      backgroundColor: 'transparent',
      padding: '0 4px',
      pointerEvents: 'none',
    };

    if (bottomOnly) {
      const inputId = `custom-date-${Math.random().toString(36).slice(2, 9)}`;
      const currentValue = toDateInputValue(value ?? defaultValue);
      return (
        <Box sx={sharedSx}>
          <Box sx={{ position: 'relative' }}>
            {label && (
              <label htmlFor={inputId} style={labelStyle}>
                {label}
              </label>
            )}
            <input
              id={inputId}
              type="date"
              value={currentValue}
              onChange={(e) => onChange?.(e.target.value)}
              onFocus={() => setNativeFocused(true)}
              onBlur={() => { setNativeFocused(false); onBlur?.(); }}
              disabled={disabled}
              style={{
                width: '100%',
                height: 40,
                padding: '8px 0',
                border: 'none',
                borderBottom: '2px solid var(--color-dark)',
                background: 'transparent',
                outline: 'none',
                color: 'var(--color-dark)',
                fontFamily: 'inherit',
              }}
            />
          </Box>
          {internalError && <FormHelperText error>{internalError}</FormHelperText>}
        </Box>
      );
    }

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
              variant: "outlined",
              
              error: !!internalError,
              helperText: internalError,
              onBlur,
                  sx: ({ ...sharedSx,
                    ...(bottomOnly
                      ? {
                          "& .MuiOutlinedInput-root": {
                            borderRadius: 0,
                            border: 'none',
                            borderBottom: '2px solid var(--color-dark)',
                            boxShadow: 'none',
                            height: 40,
                            padding: 0,
                            display: 'flex',
                            alignItems: 'center',
                            backgroundColor: 'transparent',
                          },
                          "& .MuiOutlinedInput-input": {
                            height: 40,
                            padding: '8px 16px',
                            display: 'flex',
                            alignItems: 'center',
                          },
                          // ensure the notched outline does not draw
                          "& .MuiOutlinedInput-notchedOutline": { border: 'none' },
                        }
                      : {
                          "& .MuiOutlinedInput-root": {
                            borderRadius: 8,
                            border: '2px solid var(--color-border)',
                            boxShadow: 'none',
                            height: 40,
                            padding: 0,
                            display: 'flex',
                            alignItems: 'center',
                            backgroundColor: backgroundColor ?? 'var(--color-bg)'
                          },
                          "& .MuiOutlinedInput-input": {
                            height: 40,
                            padding: '0 16px',
                            display: 'flex',
                            alignItems: 'center',
                          },
                          // ensure the notched outline matches the border
                          "& .MuiOutlinedInput-notchedOutline": {
                            border: '2px solid var(--color-border)'
                          },
                        }
                    ),
                    "& .MuiInputAdornment-root": {
                      margin: 0,
                      display: 'flex',
                      alignItems: 'center',
                    },
                    "& .MuiSvgIcon-root": { fontSize: '20px', color: 'var(--color-dark)' },
                    "& .MuiInput-underline:before": { borderBottom: 'none' },
                    "& .MuiInput-underline:after": { borderBottom: 'none' },
                  } as any),
              slotProps: {
                inputLabel: { shrink: true },
                input: {
                  className: inputClass,
                  sx: { borderRadius: '20px' },
                  startAdornment: prefixIcon ? (
                    <InputAdornment position="start">{prefixIcon}</InputAdornment>
                  ) : undefined,
                },
              },
            },
          }}
        />
      </LocalizationProvider>
    );
  }

  if (bottomOnly) {
    // Render a plain native input for bottom-only style to avoid MUI focus artifacts
    const inputId = `custom-input-${Math.random().toString(36).slice(2, 9)}`;
    const labelStyle: CSSProperties = {
      position: 'absolute',
      left: prefixIcon ? 40 : '-4px',
      top: -10,
      transform: 'translate(0,0) scale(0.85)',
      transformOrigin: 'left top',
      fontWeight: 600,
      color: 'rgba(0,0,0,0.6)',
      fontSize: '15px',
      backgroundColor: 'transparent',
      padding: '0 4px',
      pointerEvents: 'none',
    };

    return (
      <Box sx={sharedSx}>
        <Box sx={{ position: 'relative' }}>
          {label && (
            <label htmlFor={inputId} style={labelStyle}>
              {label}
            </label>
          )}
          {prefixIcon && (
            <InputAdornment position="start" sx={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)' }}>
              {prefixIcon}
            </InputAdornment>
          )}
          <input
            id={inputId}
            value={normalizedDateValue as string}
            onChange={(e) => onChange?.(e.target.value)}
            onBlur={(e) => { setNativeFocused(false); onBlur?.(); }}
            onFocus={() => setNativeFocused(true)}
            disabled={disabled}
            placeholder={placeholder}
            type={type === 'NUMBER' ? 'number' : 'text'}
            style={{
              width: '100%',
              height: 40,
              padding: prefixIcon ? '8px 16px 8px 40px' : '8px 0px',
              border: 'none',
              borderBottom: '2px solid var(--color-dark)',
              background: 'transparent',
              outline: 'none',
              fontFamily: 'inherit',
              fontSize: '0.95rem',
            }}
          />
        </Box>
        {internalError && <FormHelperText error>{internalError}</FormHelperText>}
      </Box>
    );
  }

  return (
    <TextField
      variant="outlined"
      label={label}
      InputLabelProps={{ shrink: true }}
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
          className: inputClass,
          startAdornment: prefixIcon ? (
            <InputAdornment position="start">{prefixIcon}</InputAdornment>
          ) : undefined,
        },
      }}
      sx={{
        // apply shared styles then add textfield-specific focus overrides
        ...sharedSx,
        // Target the OutlinedInput root to remove any notched outline / pseudo-elements
        "& .MuiOutlinedInput-root": {
          "& .MuiOutlinedInput-notchedOutline": { border: 'none', display: 'none' },
          "&::before, &::after": { border: 'none', display: 'none' },
          "&.Mui-focused": { boxShadow: 'none', outline: 'none' },
        },
        // Ensure the input itself has no native focus outline/shadow
        "& input": { outline: 'none', boxShadow: 'none' },
        // Also ensure helper text/focus color doesn't introduce borders
        "& .MuiFormHelperText-root": { boxShadow: 'none' },
      } as any}
    />
  );
}
