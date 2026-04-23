export type MarketType = 0 | 1 | 2;

/** Day of week numbers matching the API: 0=Sunday, 1=Monday … 6=Saturday */
export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export const DAY_NAME_TO_NUMBER: Record<string, DayOfWeek> = {
  Sunday: 0,
  Monday: 1,
  Tuesday: 2,
  Wednesday: 3,
  Thursday: 4,
  Friday: 5,
  Saturday: 6,
};

/** Shape sent to GET /Markets */
export interface MarketApiRequest {
  name?: string;
  marketType?: number;
  day?: number;
  isActive?: boolean;
  Page: number;
  PageSize: number;
}

export interface Market {
  id: number;
  name: string;
  marketType: MarketType;
  address: string;
  openTime: string;
  closeTime: string;
  operatingDays: string;
}

export interface MarketSearchRequest {
  name: string;
  marketType: MarketType | "";
  operatingDays: string[];
  page: number;
  pageSize: number;
}

export interface MarketListResponse {
  items: Market[];
  totalCount: number;
  page: number;
  pageSize: number;
}

export type MarketFormMode = "create" | "edit" | "view";

export interface MarketOperatingDay {
  day: string;
  openTime: string;
  closeTime: string;
}

export interface MarketFormValues {
  name: string;
  marketType: Exclude<MarketType, 0>;
  address: string;
  operatingDays: MarketOperatingDay[];
}

export interface MarketFormProps {
  mode: MarketFormMode;
  values: MarketFormValues;
  onChange: (values: MarketFormValues) => void;
  onSubmit?: (values: MarketFormValues) => void;
  onCancel?: () => void;
  submitLabel?: string;
}
