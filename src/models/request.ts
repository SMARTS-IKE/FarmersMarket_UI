export type RequestStatus = 0 | 3 | 4;
export type RequestType = 1 | 2 | 3;
export type MarketPeriodStatus = "draft" | "scheduled" | "active" | "closed";
export type LicenseCategoryType = 0 | 1 | 2;

export interface RequestSheet {
  id: number;
  title: string;
  description: string;
  createdAt: string;
}

export interface SellerRequest {
  id: number;
  sellerFullName: string;
  sellerName?: string;
  marketName: string;
  requestType: RequestType;
  status: RequestStatus;
  submittedAt: string;
  sellerId: number;
  formId: number;
  sellerAfm: string;
  score: number | null;
  processedAt: string | null;
  rejectionReason: string | null;
  notes: string | null;
  markets: RequestedMarket[];
  fieldValues: RequestFieldValue[];
  documents: SubmittedRequestDocument[];
}

export interface SellerRequestSearchRequest {
  sellerId?: number;
  status?: RequestStatus;
  formId?: number;
}

export interface SellerRequestListResponse {
  items: SellerRequest[];
  totalCount: number;
  page: number;
  pageSize: number;
}

export interface MarketPeriod {
  id: number;
  title: string;
  marketName: string;
  startDate: string;
  endDate: string;
  status: MarketPeriodStatus;
  marketId: number,
  formId: number,
  formTitle: string,
  description: string | null,
  licenseCategory: LicenseCategoryType,
  submissionStart: string,
  submissionEnd: string,
  operationStart: string,
  operationEnd: string,
  availableSpots: number,
  totalRequests: number,
  lotteryEnabled: boolean,
  lotteryDate: string | null,
  createdAt: string,
  updatedAt: string
}


export interface MarketPeriodSearchRequest {
  market?: string;
  status?: MarketPeriodStatus;
  page: number;
  pageSize: number;
}

export interface MarketPeriodListResponse {
  items: MarketPeriod[];
  totalCount: number;
  page: number;
  pageSize: number;
}

export interface CreateMarketPeriodRequest {
  marketId: number;
  title?: string;
  description?: string;
  licenseCategory: LicenseCategoryType;
  submissionStart: string;
  submissionEnd: string;
  operationStart?: string | null;
  operationEnd?: string | null;
  availableSpots: number;
  lotteryEnabled: boolean;
  lotteryDate?: string | null;
  formId?: number | null;
}

export type UpdateMarketPeriodRequest = CreateMarketPeriodRequest;

export interface MarketPeriodDetail {
  id: number;
  marketId: number;
  marketName?: string;
  title: string;
  description: string;
  licenseCategory: LicenseCategoryType;
  submissionStart: string;
  submissionEnd: string;
  operationStart: string;
  operationEnd: string;
  availableSpots: number;
  lotteryEnabled: boolean;
  lotteryDate: string;
  formId: number | null;
}

export interface CreateMarketPeriodDraft {
  marketId: number;
  title: string;
  description: string;
  licenseCategory: LicenseCategoryType;
  submissionStart: string;
  submissionEnd: string;
  operationStart: string;
  operationEnd: string;
  availableSpots: number;
  lotteryEnabled: boolean;
  lotteryDate: string;
  formId: number | "";
}

export interface RequestFormField {
  id: number;
  label: string;
  typeOfFields: number;
  isRequired: boolean;
  weight: number;
  order: number;
  options: string[];
}

export interface RequestFormItem {
  id: number;
  title: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  fields: RequestFormField[];
  // Optional additional fields returned by the API (e.g. documents / "other" section)
  other?: RequestFormOtherField[];
}

export interface RequestFormOtherField {
  id: number;
  // some APIs may use `label` or `title` for display text
  label?: string;
  title?: string;
  isRequired: boolean;
  order?: number;
  [key: string]: unknown;
}

export interface RequestFormListResponse {
  items: RequestFormItem[];
  totalCount: number;
  page: number;
  pageSize: number;
}

export interface RequestedMarket {
  marketId: number;
  marketName: string;
}

export interface RequestFieldValue {
  id: number;
  fieldId: number;
  fieldLabel: string;
  value: string;
  weight?: number;
  reviewStatus: number | null;
  reviewComment: string | null;
}

export interface SubmittedRequestDocument {
  id?: number;
  name?: string | null;
  title?: string | null;
  fileName?: string | null;
  url?: string | null;
  downloadUrl?: string | null;
  contentType?: string | null;
  [key: string]: unknown;
}

export interface SubmittedRequestDetail {
  id: number;
  sellerId: number;
  formId: number | null;
  sellerFullName: string;
  sellerAfm: string;
  sellerType?: string | number;
  sellerLicenseNumber?: string;
  status: RequestStatus;
  score: number | null;
  submittedAt: string;
  processedAt: string | null;
  rejectionReason: string | null;
  notes: string | null;
  markets: RequestedMarket[];
  fieldValues: RequestFieldValue[];
  documents: SubmittedRequestDocument[];
}

export interface CreateRequestFormFieldRequest {
  label: string;
  typeOfFields: number;
  isRequired: boolean;
  weight: number;
  order: number;
  options: string[];
}

export interface CreateRequestFormRequest {
  title: string;
  description: string;
  fields: CreateRequestFormFieldRequest[];
}

export type DesignRequestFieldType = "TEXT" | "NUMBER" | "DATE" | "TEXTAREA" | "DROPDOWN" | "BOOLEAN";

export interface DesignRequestDynamicField {
  id: number;
  title: string;
  type: DesignRequestFieldType;
  availableValues: string[];
  weight: number;
  isRequired: boolean;
}

export interface DesignRequestRequiredDocument {
  id: number;
  title: string;
  isRequired: boolean;
}

export interface DesignRequestDraft {
  title: string;
  description: string;
  dynamicFields: DesignRequestDynamicField[];
  requiredDocuments: DesignRequestRequiredDocument[];
}
