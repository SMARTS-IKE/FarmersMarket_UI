import React from 'react';
import { useSellersQuery, useSellerMarketsQuery } from '../queries/sellerQueries';
import { useSellerRequestsQuery } from '../queries/requestQueries';
import { useAuthStore } from '../store/authStore';
import StorefrontIcon from '@mui/icons-material/Storefront';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';

export default function UserMetricsBox() {
  const currentUser = useAuthStore((s) => s.user);

  const sellersQuery = useSellersQuery({ name: '', afm: '', sellerType: '', page: 1, pageSize: 1000 });

  const matchedSeller = React.useMemo(() => {
    const all = sellersQuery.data?.items ?? [];
    if (!currentUser) return null;

    const matchByUserId = all.find((s: any) => s.userId != null && String(s.userId) === String(currentUser.id));
    const matchByAfm = all.find((s: any) => s.afm && (currentUser as any)?.afm && String(s.afm) === String((currentUser as any).afm));
    const authName = ((currentUser as any)?.name ?? `${(currentUser as any)?.firstName ?? ''} ${(currentUser as any)?.lastName ?? ''}`).trim();
    const matchByName = all.find((s: any) => {
      const sName = `${s.firstName ?? ''} ${s.lastName ?? ''}`.trim();
      return sName && authName && sName === authName;
    });

    return matchByUserId || matchByAfm || matchByName || null;
  }, [sellersQuery.data, currentUser]);

  const sellerId = matchedSeller ? String((matchedSeller as any).id) : '';

  const sellerMarketsQuery = useSellerMarketsQuery(sellerId);
  const sellerRequestsQuery = useSellerRequestsQuery({ sellerId: sellerId ? Number(sellerId) : undefined, page: 1, pageSize: 1000 } as any);

  const participatingMarkets = sellerMarketsQuery.data?.items?.length ?? 0;
  const activeRequests = Array.isArray(sellerRequestsQuery.data) ? sellerRequestsQuery.data.length : sellerRequestsQuery.data?.length ?? 0;

  return (
    <div className="w-full max-w-6xl mx-auto px-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white rounded-lg shadow p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-full flex items-center justify-center text-white bg-blue-500">
            <StorefrontIcon className="text-white" fontSize="small" />
          </div>
          <div className="flex-1">
            <div className="text-sm text-gray-500">Αγορές που συμμετέχω</div>
            <div className="mt-2 text-2xl font-semibold text-gray-800">{sellersQuery.isLoading || sellerMarketsQuery.isLoading ? '…' : participatingMarkets}</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-full flex items-center justify-center text-white bg-green-500">
            <ReceiptLongIcon className="text-white" fontSize="small" />
          </div>
          <div className="flex-1">
            <div className="text-sm text-gray-500">Οι Ενεργές Αιτήσεις μου</div>
            <div className="mt-2 text-2xl font-semibold text-gray-800">{sellerRequestsQuery.isLoading ? '…' : activeRequests}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
