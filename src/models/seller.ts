/** Maps to SellerType enum: 0 = Unknown, 1 = Παραγωγός, 2 = Μεταπωλητής */
export type SellerType = 0 | 1 | "";

export interface License {
  id?: number;
  number: string;
  issuedAt: string;
  expiresAt: string;
}

// Detailed license model returned as `currentLicense` from the API
export interface CurrentLicense {
  id: number;
  fromDate: string;
  toDate?: string | null;
  isActive: boolean;
  sellerType: number;
  isSeasonal: boolean;
  seasonalFromDate?: string | null;
  seasonalToDate?: string | null;
  licenseCategory: number;
  licenseStatus: number;
  licenseNumber: string;
  licenseExpiry?: string | null;
  notes?: string | null;
}

export interface SellerSearchRequest {
  name: string;
  afm: string;
  sellerType: SellerType;
  isActive?: boolean;
  page: number;
  pageSize: number;
}

export interface Seller {
  id: number;
  firstName: string;
  lastName: string;
  afm: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  sellerType: SellerType;
  isActive: boolean;
  licenses?: License[];
  userId?: number;
  fullName?: string;
  createdAt?: string;
  currentLicense?: CurrentLicense | null;
}

export interface SellerListResponse {
  items: Seller[];
  totalCount: number;
  page: number;
  pageSize: number;
}
