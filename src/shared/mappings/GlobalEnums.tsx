import { createContext, ReactNode, useContext, useEffect, useState } from 'react';

export enum SellerType {
  Producer = 0,
  Professional = 1,
}

export const SellerTypeLabels: Record<number, string> = {
  [SellerType.Producer]: 'Παραγωγός',
  [SellerType.Professional]: 'Επαγγελματίας Πωλητής',
};

export enum RequestStatus {
  Pending = 0,
  Approved = 3,
  Rejected = 4,
}

export const RequestStatusLabels: Record<number, string> = {
  [RequestStatus.Pending]: 'Εκκρεμεί',
  [RequestStatus.Approved]: 'Εγκρίθηκε',
  [RequestStatus.Rejected]: 'Απορρίφθηκε',
};

export enum UserStatus {
  active = 0,
  inactive = 1,
  pending = 2,
}

export const UserStatusLabels: Record<number, string> = {
  [UserStatus.active]: 'Ενεργός',
  [UserStatus.inactive]: 'Ανενεργός',
  [UserStatus.pending]: 'Υπό Εξέταση',
};

export enum UserRole {
  User_Access = 0,
  Admin_Access = 1,
}

export const UserRoleLabels: Record<number, string> = {
  [UserRole.User_Access]: 'Χρήστης',
  [UserRole.Admin_Access]: 'Διαχειριστής',
};

export type GlobalEnumsShape = {
  SellerType: typeof SellerType;
  SellerTypeLabels: Record<number, string>;
  RequestStatus: typeof RequestStatus;
  RequestStatusLabels: Record<number, string>;
  UserStatus: typeof UserStatus;
  UserStatusLabels: Record<number, string>;
  UserRole: typeof UserRole;
  UserRoleLabels: Record<number, string>;
  refresh?: () => Promise<void>;
};

export const GlobalEnumsContext = createContext<GlobalEnumsShape>({
  SellerType,
  SellerTypeLabels,
  RequestStatus,
  RequestStatusLabels,
  UserStatus,
  UserStatusLabels,
  UserRole,
  UserRoleLabels,
  refresh: async () => {},
});

export const GlobalEnumsProvider = ({ children }: { children: ReactNode }) => {
  const [sellerTypeLabels, setSellerTypeLabels] = useState(SellerTypeLabels);
  const [requestStatusLabels, setRequestStatusLabels] = useState(RequestStatusLabels);
  const [userStatusLabels, setUserStatusLabels] = useState(UserStatusLabels);
  const [userRoleLabels, setUserRoleLabels] = useState(UserRoleLabels);

  const fetchEnums = async () => {
    try {
      // Dynamically import `http` to avoid circular module initialization issues
      const { http } = await import('../../lib/http');

      // Replace `/enums` with the actual backend endpoint when available
      const res = await http.get<{
        sellerTypes?: Record<number, string>;
        requestStatuses?: Record<number, string>;
        userStatuses?: Record<number, string>;
        userRoles?: Record<number, string>;
      }>('/enums', { public: false });

      if (res?.sellerTypes) setSellerTypeLabels(res.sellerTypes as Record<number, string>);
      if (res?.requestStatuses) setRequestStatusLabels(res.requestStatuses as Record<number, string>);
      if (res?.userStatuses) setUserStatusLabels(res.userStatuses as Record<number, string>);
      if (res?.userRoles) setUserRoleLabels(res.userRoles as Record<number, string>);
    } catch (e) {
      // keep defaults if request fails
      // console.warn('Failed to fetch enums', e);
    }
  };

  useEffect(() => {
    fetchEnums();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <GlobalEnumsContext.Provider
      value={{
        SellerType,
        SellerTypeLabels: sellerTypeLabels,
        RequestStatus,
        RequestStatusLabels: requestStatusLabels,
        UserStatus,
        UserStatusLabels: userStatusLabels,
        UserRole,
        UserRoleLabels: userRoleLabels,
        refresh: fetchEnums,
      }}
    >
      {children}
    </GlobalEnumsContext.Provider>
  );
};

export const useGlobalEnums = () => useContext(GlobalEnumsContext);

export default GlobalEnumsProvider;
