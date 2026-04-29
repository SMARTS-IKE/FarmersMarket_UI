/** Maps to SellerType enum: 0 = Unknown, 1 = Παραγωγός, 2 = Μεταπωλητής */
export type SellerType = 0 | 1 | "";

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
}

export interface SellerListResponse {
  items: Seller[];
  totalCount: number;
  page: number;
  pageSize: number;
}
