import { useMutation, useQuery } from '@tanstack/react-query';
import type { CreateRequestFormRequest, RequestFormItem, RequestFormListResponse } from '../models/request';
import { queryClient } from '../lib/queryClient';
import { createRequestForm, getRequestForms } from '../services/formsService';

const FORMS_STALE_TIME_MS = 5 * 60 * 1000;
const FORMS_GC_TIME_MS = 15 * 60 * 1000;

export const formsKeys = {
  all: ['forms'] as const,
  requestForms: () => ['forms', 'request-forms'] as const,
};

export function useRequestFormsQuery() {
  return useQuery<RequestFormListResponse, Error>({
    queryKey: formsKeys.requestForms(),
    queryFn: getRequestForms,
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