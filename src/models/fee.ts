export interface FeeRule {
  id?: string | number; // Optional ID for table identification
  name: string;
  description: string;
  marketId: number | null;
  sellerType: string;
  licenseCategory: string;
  amount: number;
  basis: number;
  validFrom: string; // Date format: YYYY-MM-DD
  validTo: string; // Date format: YYYY-MM-DD
  priority: number;
  legalReference: string;
}

export interface FeeRuleListResponse {
  items: FeeRule[];
  totalCount: number;
  page: number;
  pageSize: number;
}

export interface FeeRuleSearchRequest {
  marketId?: number | string;
  sellerType?: string;
  page: number;
  pageSize: number;
}

export interface FeeRuleApiRequest {
  MarketId?: number;
  SellerType?: string;
  Page: number;
  PageSize: number;
}
