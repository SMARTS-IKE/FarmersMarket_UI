---
name: custom-input-field
description: 'Use when adding any input field, text field, textarea, dropdown, number input, or date picker to a React component. Always use the CustomInputField component from src/shared/components/CustomInputField.tsx instead of raw MUI TextField, Select, or similar primitives.'
---

# CustomInputField Usage

## When to Use
Whenever you need to add any kind of input to a component:
- Text input
- Number input
- Textarea / multiline input
- Dropdown / select
- Date picker

Always import and use `CustomInputField` from `src/shared/components/CustomInputField.tsx`. Never use raw MUI `TextField`, `Select`, `FormControl`, or similar primitives directly.

## Import

```tsx
import CustomInputField from "@/shared/components/CustomInputField";
```

## Props Reference

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `type` | `"TEXT" \| "NUMBER" \| "TEXTAREA" \| "DROPDOWN" \| "DATE"` | `"TEXT"` | The input type |
| `label` | `string` | — | Field label |
| `value` | `string \| number` | — | Controlled value |
| `defaultValue` | `string \| number` | — | Uncontrolled default |
| `placeholder` | `string` | — | Placeholder text |
| `disabled` | `boolean` | `false` | Disables the field |
| `backgroundColor` | `string` | — | Custom background color |
| `width` | `number \| string` | `240` | Field width |
| `prefixIcon` | `React.ReactNode` | — | Icon shown at the start |
| `dropdownItems` | `DropdownOption[]` | `[]` | Options for DROPDOWN type |
| `validation` | `ValidationRules` | — | Built-in validation rules |
| `error` | `string` | — | External error message |
| `onChange` | `(value: string \| number) => void` | — | Change handler |
| `onBlur` | `() => void` | — | Blur handler |
| `sx` | `SxProps<Theme>` | — | MUI sx overrides |

## Examples

### Text input
```tsx
<CustomInputField
  type="TEXT"
  label="Full Name"
  value={name}
  onChange={(v) => setName(v as string)}
  validation={{ required: true, minLength: 2 }}
/>
```

### Dropdown
```tsx
<CustomInputField
  type="DROPDOWN"
  label="Role"
  value={role}
  onChange={(v) => setRole(v as string)}
  dropdownItems={[
    { label: "Admin", value: "admin" },
    { label: "Seller", value: "seller" },
  ]}
/>
```

### Number input
```tsx
<CustomInputField
  type="NUMBER"
  label="Price"
  value={price}
  onChange={(v) => setPrice(v as number)}
  validation={{ required: true, min: 0 }}
/>
```

### Date picker
```tsx
<CustomInputField
  type="DATE"
  label="Birth Date"
  value={date}
  onChange={(v) => setDate(v as string)}
/>
```

### Textarea
```tsx
<CustomInputField
  type="TEXTAREA"
  label="Description"
  value={description}
  onChange={(v) => setDescription(v as string)}
  validation={{ maxLength: 500 }}
/>
```

## Validation Rules

```ts
interface ValidationRules {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;       // NUMBER type only
  max?: number;       // NUMBER type only
  pattern?: RegExp;
  patternMessage?: string;
}
```

Validation runs automatically when `validation` and `value` props are both provided.
