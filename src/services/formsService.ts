import { http } from '../lib/http';
import type { CreateRequestFormRequest, RequestFormItem, RequestFormListResponse } from '../models/request';

export async function getRequestForms(): Promise<RequestFormListResponse> {
  return http.get<RequestFormListResponse>('/forms');
}

export async function createRequestForm(payload: CreateRequestFormRequest): Promise<RequestFormItem> {
  return http.post<RequestFormItem, CreateRequestFormRequest>('/forms', payload);
}