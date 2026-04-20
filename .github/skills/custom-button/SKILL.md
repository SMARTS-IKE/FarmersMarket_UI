---
name: custom-button
description: 'Use when adding any button, action trigger, submit button, or clickable control to a React component. Always use the CustomButton component from src/shared/components/CustomButton.tsx instead of raw MUI Button or similar primitives.'
---

# CustomButton Usage

## When to Use
Whenever you need to add a button to a component:
- Submit / confirm actions
- Cancel / back actions
- Any clickable action trigger

Always import and use `CustomButton` from `src/shared/components/CustomButton.tsx`. Never use raw MUI `Button` or similar primitives directly.

## Import

```tsx
import CustomButton from "@/shared/components/CustomButton";
```

## Props Reference

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | `string` | `"Κουμπί"` | Button label text |
| `prefixIcon` | `React.ReactNode` | — | Icon shown at the start |
| `backgroundColor` | `string` | `"var(--color-dark)"` | Background color |
| `disabled` | `boolean` | `false` | Disables the button |
| `width` | `number \| string` | `140` | Button width |
| `onClick` | `() => void` | — | Click handler |
| `sx` | `SxProps<Theme>` | — | MUI sx overrides |

## Examples

### Basic button
```tsx
<CustomButton
  title="Save"
  onClick={handleSave}
/>
```

### With icon
```tsx
import AddIcon from "@mui/icons-material/Add";

<CustomButton
  title="Add Item"
  prefixIcon={<AddIcon />}
  onClick={handleAdd}
/>
```

### Custom color and width
```tsx
<CustomButton
  title="Delete"
  backgroundColor="var(--color-error)"
  width={200}
  onClick={handleDelete}
/>
```

### Disabled state
```tsx
<CustomButton
  title="Submit"
  disabled={isLoading}
  onClick={handleSubmit}
/>
```
