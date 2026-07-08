import React from 'react';
import { useSellersQuery } from '../queries/sellerQueries';
import { useUsersQuery } from '../queries/userQueries';
import type { UserSearchRequest } from '../models/user';
import { useMarketsQuery } from '../queries/marketQueries';
import type { MarketSearchRequest } from '../models/market';
import type { SellerSearchRequest } from '../models/seller';
import PersonIcon from '@mui/icons-material/Person';
import PlaceIcon from '@mui/icons-material/Place';
import StorefrontIcon from '@mui/icons-material/Storefront';

export default function MetricsBox() {
  const sellerParams: SellerSearchRequest = {
    name: '',
    afm: '',
    sellerType: '',
    isActive: true,
    page: 1,
    pageSize: 1,
  };

  const marketParams: MarketSearchRequest = {
    name: '',
    marketType: '',
    operatingDays: [],
    page: 1,
    // fetch many to compute active count client-side
    pageSize: 1000,
  };

  const sellersQuery = useSellersQuery(sellerParams);
  const marketsQuery = useMarketsQuery(marketParams);
  const userParams: UserSearchRequest = {
    name: '',
    email: '',
    role: '',
    status: '',
    page: 1,
    pageSize: 1000,
  };
  const usersQuery = useUsersQuery(userParams);

  const activeSellers = sellersQuery.data?.totalCount ?? 0;
  const totalMarkets = marketsQuery.data?.totalCount ?? marketsQuery.data?.items.length ?? 0;
  const activeMarkets = marketsQuery.data ? marketsQuery.data.items.filter((m) => m.isActive).length : 0;
  const activeUsers = Array.isArray(usersQuery.data)
    ? usersQuery.data.filter((u) => u.isActive).length
    : usersQuery.data?.items?.filter((u) => u.isActive).length ?? 0;

  return (
    <div className="w-full max-w-6xl mx-auto px-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-full flex items-center justify-center text-white bg-green-500">
            <PersonIcon className="text-white" fontSize="small" />
          </div>
          <div className="flex-1">
            <div className="text-sm text-gray-500">Ενεργοί Χρήστες</div>
            <div className="mt-2 text-2xl font-semibold text-gray-800">{usersQuery.isLoading ? '…' : activeUsers}</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-full flex items-center justify-center text-white bg-blue-500">
            <PlaceIcon className="text-white" fontSize="small" />
          </div>
          <div className="flex-1">
            <div className="text-sm text-gray-500">Ενεργοί Πωλητές</div>
            <div className="mt-2 text-2xl font-semibold text-gray-800">{marketsQuery.isLoading ? '…' : activeMarkets}</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-full flex items-center justify-center text-white bg-purple-500">
            <StorefrontIcon className="text-white" fontSize="small" />
          </div>
          <div className="flex-1">
            <div className="text-sm text-gray-500">Συνολικές Αγορές</div>
            <div className="mt-2 text-2xl font-semibold text-gray-800">{marketsQuery.isLoading ? '…' : totalMarkets}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
