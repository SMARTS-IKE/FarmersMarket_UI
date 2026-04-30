export type RequestStatus = 0 | 1 | 2;
export type RequestType = 1 | 2 | 3;

export interface RequestSheet {
  id: number;
  title: string;
  description: string;
  status: RequestStatus;
  createdAt: string;
}

export interface SellerRequest {
  id: number;
  sellerName: string;
  marketName: string;
  requestType: RequestType;
  status: RequestStatus;
  submittedAt: string;
}
