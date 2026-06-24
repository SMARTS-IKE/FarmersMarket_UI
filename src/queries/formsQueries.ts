import { useMutation, useQuery } from '@tanstack/react-query';
import type { CreateRequestFormRequest, RequestFormItem, RequestFormListResponse, RequestFormField } from '../models/request';
import { queryClient } from '../lib/queryClient';
import { createRequestForm, getRequestFormById, getRequestForms } from '../services/formsService';

const FORMS_STALE_TIME_MS = 5 * 60 * 1000;
const FORMS_GC_TIME_MS = 15 * 60 * 1000;

export const formsKeys = {
  all: ['forms'] as const,
  requestForms: () => ['forms', 'request-forms'] as const,
  requestFormFields: () => ['forms', 'request-form-fields'] as const,
  requestFormDetail: (id: string) => ['forms', 'request-form-detail', id] as const,
};

export function useRequestFormsQuery() {
  return useQuery<RequestFormListResponse, Error>({
    queryKey: formsKeys.requestForms(),
    queryFn: getRequestForms,
    staleTime: FORMS_STALE_TIME_MS,
    gcTime: FORMS_GC_TIME_MS,
  });
}

export function useRequestFormByIdQuery(id: string) {
  return useQuery<RequestFormItem, Error>({
    queryKey: formsKeys.requestFormDetail(id),
    queryFn: () => getRequestFormById(id),
    enabled: Boolean(id),
    staleTime: FORMS_STALE_TIME_MS,
    gcTime: FORMS_GC_TIME_MS,
  });
}

export function useCreateRequestFormMutation() {
  return useMutation<RequestFormItem, Error, CreateRequestFormRequest>({
    mutationFn: (payload) => createRequestForm(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: formsKeys.requestForms() });
    },
  });
}

import { getFormFields } from '../services/fieldService';
import { updateFormField } from '../services/fieldService';
import { createFormField } from '../services/fieldService';

export function useFormFieldsQuery(enabled = true) {
  return useQuery<RequestFormField[], Error>({
    queryKey: formsKeys.requestFormFields(),
    queryFn: async () => {
      const resp = await getFormFields();
      return Array.isArray((resp as any).items) ? (resp as any).items as RequestFormField[] : [];
    },
    enabled: Boolean(enabled),
    staleTime: FORMS_STALE_TIME_MS,
    gcTime: FORMS_GC_TIME_MS,
  });
}

export function useUpdateFormFieldMutation() {
  return useMutation<void, Error, { id: number | string; payload: Record<string, unknown> }>(
    {
      mutationFn: ({ id, payload }) => updateFormField(id, payload),
      onSuccess: async (_data, variables) => {
        await queryClient.invalidateQueries({ queryKey: formsKeys.requestFormFields() });
      },
    }
  );
}

export function useCreateFormFieldMutation() {
  return useMutation<Record<string, unknown>, Error, Record<string, unknown>>({
    mutationFn: (payload) => createFormField(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: formsKeys.requestFormFields() });
    },
  });
}