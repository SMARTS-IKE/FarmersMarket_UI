import React from 'react';
import UserMetricsBox from '../../components/UserMetricsBox';
import { useAuthStore } from '../../store/authStore';

export default function UserDashboardPage() {
  const currentUser = useAuthStore((s) => s.user);

  const nameFromAuth = `${(currentUser as any)?.firstName ?? ''} ${(currentUser as any)?.lastName ?? ''}`.trim();

  const displayName = ((currentUser as any)?.name ?? nameFromAuth) || 'Χρήστης';

  return (
    <div className="p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-semibold mb-4">Καλωσήρθες, {displayName}</h1>

        <UserMetricsBox />
      </div>
    </div>
  );
}
