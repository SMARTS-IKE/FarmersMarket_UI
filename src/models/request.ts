export type RequestStatus = 0 | 1 | 2;
export type RequestType = 1 | 2 | 3;

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
}

export interface SellerRequestSearchRequest {
  sellerId?: number;
  status?: RequestStatus;
}

export interface SellerRequestListResponse {
  items: SellerRequest[];
  totalCount: number;
  page: number;
  pageSize: number;
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
}

export interface RequestFormListResponse {
  items: RequestFormItem[];
  totalCount: number;
  page: number;
  pageSize: number;
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
