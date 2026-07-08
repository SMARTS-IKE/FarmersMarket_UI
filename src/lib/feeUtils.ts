import { SellerTypeLabels } from '../shared/mappings/GlobalEnums';

export const SELLER_TYPE_LABELS: Record<string, string> = Object.fromEntries(
  Object.entries(SellerTypeLabels).map(([k, v]) => [String(k), v]),
) as Record<string, string>;

export const FEE_TYPE_OPTIONS: { value: string; label: string }[] = [
  { value: 'FLAT', label: 'Σταθερό' },
  { value: 'DAILY', label: 'Ημερήσιο' },
  { value: 'PER_METER', label: 'Ανά μέτρο' },
];
