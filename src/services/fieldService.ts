import { http } from '../lib/http';
import type { RequestFormListResponse } from '../models/request';

export async function getFormFields(): Promise<RequestFormListResponse> {
  return http.get<RequestFormListResponse>('/fields');
}

export async function updateFormField(id: number | string, payload: Record<string, unknown>): Promise<void> {
  await http.put(`/fields/${id}`, payload);
}

export async function createFormField(payload: Record<string, unknown>): Promise<Record<string, unknown>> {
  return http.post<Record<string, unknown>, Record<string, unknown>>('/fields', payload);
}
