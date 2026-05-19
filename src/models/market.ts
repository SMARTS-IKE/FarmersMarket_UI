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
  latitude: number;
  longitude: number;
  totalSpots: number;
  occupiedSpots: number;
  openTime: string;
  closeTime: string;
  notes: string;
  isActive: boolean;
  schedules: MarketSchedule[];
  marketSellers: unknown[];
  supervisors: MarketSupervisor[];
}

export interface MarketSchedule {
  id: number;
  day: DayOfWeek;
  exceptionDate: string | null;
  isCancelled: boolean;
  cancellationReason: string | null;
}

export interface MarketSupervisor {
    userId: string;
    email: string;
    firstName: string;
    lastName: string;
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
  availableSlots: number;
  supervisors: string[];
  area: string;
  occupiedSpots: number;
  latitude: number | null;
  longitude: number | null;
  radius: number | null;
}

export interface MarketFormProps {
  mode: MarketFormMode;
  values: MarketFormValues;
  onChange: (values: MarketFormValues) => void;
  onSubmit?: (values: MarketFormValues) => void;
  onCancel?: () => void;
  submitLabel?: string;
}

export interface MarketExceptionToAddRequest {
  exceptionDate: string;
  isCancelled: boolean;
  cancellationReason: string | null;
}

export interface UpdateMarketRequest {
  name: string;
  marketType: MarketType;
  address: string;
  area: string;
  latitude: number;
  longitude: number;
  totalSpots: number;
  openTime: string;
  closeTime: string;
  notes: string;
  isActive: boolean;
  formId: number;
  supervisorsToAdd: string[];
  supervisorsToRemove: string[];
  exceptionsToAdd: MarketExceptionToAddRequest[];
}
