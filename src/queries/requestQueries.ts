import { useMutation, useQuery } from '@tanstack/react-query';
import { queryClient } from '../lib/queryClient';
import type {
  CreateMarketPeriodRequest,
  MarketPeriodDetail,
  MarketPeriod,
  SellerRequest,
  SellerRequestSearchRequest,
  SubmittedRequestDetail,
  UpdateMarketPeriodRequest,
} from '../models/request';
import { createMarketPeriod, getMarketPeriodById, updateMarketPeriod } from '../services/periodService';
import { approveRequest, createRequest, deleteRequest, getSellerRequests, getSubmittedRequestById, rejectRequest, reviewFieldValue, recalculateFieldReviews, setRequestStatus } from '../services/requestService';
import { updateRequestScore } from '../services/requestService';

const REQUESTS_STALE_TIME_MS = 5 * 60 * 1000;
const REQUESTS_GC_TIME_MS = 15 * 60 * 1000;

export const requestKeys = {
  all: ['requests'] as const,
  sellerList: (params: SellerRequestSearchRequest) => ['requests', 'seller-list', params] as const,
  marketPeriodDetail: (id: string) => ['requests', 'market-period-detail', id] as const,
  submittedDetail: (id: string | number) => ['requests', 'submitted-detail', id] as const,
};

export function useSellerRequestsQuery(params: SellerRequestSearchRequest) {
  return useQuery<SellerRequest[], Error>({
    queryKey: requestKeys.sellerList(params),
    queryFn: () => getSellerRequests(params),
    staleTime: REQUESTS_STALE_TIME_MS,
    gcTime: REQUESTS_GC_TIME_MS,
  });
}

export function useUpdateRequestScoreMutation() {
  return useMutation<void, Error, { id: string | number; payload: { score: number | null; note?: string } }>(
    {
      mutationFn: ({ id, payload }) => updateRequestScore(id, payload),
      onSuccess: async (_data, variables) => {
        await queryClient.invalidateQueries({ queryKey: requestKeys.submittedDetail(variables.id) });
        await queryClient.invalidateQueries({ queryKey: requestKeys.sellerList({} as any) });
      },
    }
  );
}

export function useCreateMarketPeriodMutation() {
  return useMutation<MarketPeriod, Error, CreateMarketPeriodRequest>({
    mutationFn: (payload) => createMarketPeriod(payload),
  });
}

export function useApproveRequestMutation() {
  return useMutation<void, Error, number>({
    mutationFn: (id) => approveRequest(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['requests', 'seller-list'] });
    },
  });
}

export function useRejectRequestMutation() {
  return useMutation<void, Error, number>({
    mutationFn: (id) => rejectRequest(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['requests', 'seller-list'] });
    },
  });
}

export function useDeleteRequestMutation() {
  return useMutation<void, Error, number>({
    mutationFn: (id) => deleteRequest(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['requests', 'seller-list'] });
    },
  });
}

export function useMarketPeriodDetailQuery(id: string) {
  return useQuery<MarketPeriodDetail, Error>({
    queryKey: requestKeys.marketPeriodDetail(id),
    queryFn: () => getMarketPeriodById(id),
    enabled: Boolean(id),
    staleTime: REQUESTS_STALE_TIME_MS,
    gcTime: REQUESTS_GC_TIME_MS,
  });
}

export function useSubmittedRequestDetailQuery(id: string | number) {
  return useQuery<SubmittedRequestDetail, Error>({
    queryKey: requestKeys.submittedDetail(id),
    queryFn: () => getSubmittedRequestById(id),
    enabled: Boolean(id),
    staleTime: REQUESTS_STALE_TIME_MS,
    gcTime: REQUESTS_GC_TIME_MS,
  });
}

export function useUpdateMarketPeriodMutation(id: string) {
  return useMutation<MarketPeriod, Error, UpdateMarketPeriodRequest>({
    mutationFn: (payload) => updateMarketPeriod(id, payload),
    onSuccess: async (_data, variables) => {
      queryClient.setQueryData<MarketPeriodDetail | undefined>(requestKeys.marketPeriodDetail(id), (current) => {
        if (!current) return current;

        return {
          ...current,
          marketId: variables.marketId,
          title: variables.title ?? current.title,
          description: variables.description ?? current.description,
          licenseCategory: variables.licenseCategory,
          submissionStart: variables.submissionStart,
          submissionEnd: variables.submissionEnd,
          operationStart: variables.operationStart ?? '',
          operationEnd: variables.operationEnd ?? '',
          availableSpots: variables.availableSpots,
          lotteryEnabled: variables.lotteryEnabled,
          lotteryDate: variables.lotteryDate ?? '',
          formId: variables.formId ?? null,
        };
      });

    },
  });
}

export function useCreateRequestMutation() {
  return useMutation<void, Error, any>({
    mutationFn: (payload) => createRequest(payload as any),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['requests', 'seller-list'] });
    },
  });
}

export function useReviewFieldValueMutation() {
  return useMutation<void, Error, { requestId: string | number; fieldValueId: string | number; payload: { isApproved: boolean; adjustedScore: number; reviewNote: string } }>(
    {
      mutationFn: ({ requestId, fieldValueId, payload }) => reviewFieldValue(requestId, fieldValueId, payload),
      onSuccess: async (_data, variables) => {
        await queryClient.invalidateQueries({ queryKey: requestKeys.submittedDetail(variables.requestId) });
      },
    }
  );
}

export function useRecalculateFieldReviewsMutation() {
  return useMutation<void, Error, string | number>({
    mutationFn: (id) => recalculateFieldReviews(id),
    onSuccess: async (_data, id) => {
      await queryClient.invalidateQueries({ queryKey: requestKeys.submittedDetail(id) });
    },
  });
}

export function useSetRequestStatusMutation() {
  return useMutation<void, Error, { id: string | number; payload: { status: number; reason: string; processedByUserId: string } }>(
    {
      mutationFn: ({ id, payload }) => setRequestStatus(id, payload),
      onSuccess: async (_data, variables) => {
        await queryClient.invalidateQueries({ queryKey: requestKeys.submittedDetail(variables.id) });
        await queryClient.invalidateQueries({ queryKey: requestKeys.sellerList({} as any) });
      },
    }
  );
}


