import { SellerTypeLabels } from '../shared/components/GlobalEnums';

export const SELLER_TYPE_LABELS: Record<string, string> = Object.fromEntries(
  Object.entries(SellerTypeLabels).map(([k, v]) => [String(k), v]),
) as Record<string, string>;
