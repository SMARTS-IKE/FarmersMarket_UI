import { http } from '../lib/http';
import type { RequestFormListResponse } from '../models/request';

export async function getRequestForms(): Promise<RequestFormListResponse> {
  return http.get<RequestFormListResponse>('/forms');
}