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

export enum LicenseCategory {
  Professional = 0,
  Producer = 1,
  Unknown = 2,
}

export const DefaultLicenseCategoryLabels: Record<number, string> = {
  [LicenseCategory.Professional]: 'Επαγγελματική',
  [LicenseCategory.Producer]: 'Παραγωγική',
  [LicenseCategory.Unknown]: 'Άγνωστη',
};

export enum LicenseStatus {
  Active = 0,
  Expired = 1,
  Suspended = 2,
  Revoked = 3,
}

export const DefaultLicenseStatusLabels: Record<number, string> = {
  [LicenseStatus.Active]: 'Ενεργή',
  [LicenseStatus.Expired]: 'Ληγμένη',
  [LicenseStatus.Suspended]: 'Ανασταλμένη',
  [LicenseStatus.Revoked]: 'Ανακληθείσα',
};

export enum ChargeStatus {
  Pending = 0,
  Confirmed = 1,
  Cancelled = 2,
  Exported = 3,
  Paid = 4,
  Waived = 5,
}

export const DefaultChargeStatusLabels: Record<number, string> = {
  [ChargeStatus.Pending]: 'Εκκρεμής',
  [ChargeStatus.Confirmed]: 'Επιβεβαιωμένη',
  [ChargeStatus.Cancelled]: 'Ακυρωμένη',
  [ChargeStatus.Exported]: 'Εξαχθείσα',
  [ChargeStatus.Paid]: 'Πληρωμένη',
  [ChargeStatus.Waived]: 'Απαλλαγμένη',
};

export enum UserStatus {
  Active = 0,
  Inactive = 1,
  Pending = 2,
}

export const UserStatusLabels: Record<number, string> = {
  [UserStatus.Inactive]: 'Ανενεργός',
  [UserStatus.Active]: 'Ενεργός',
  [UserStatus.Pending]: 'Υπό Εξέταση',
};

export enum UserRole {
  User_Access = 0,
  Admin_Access = 1,
}

export const UserRoleLabels: Record<number, string> = {
  [UserRole.User_Access]: 'Χρήστης',
  [UserRole.Admin_Access]: 'Διαχειριστής',
};

export enum CheckInMethod {
  Manual = 1,
  Automatic = 2,
  Other = 3,
}

export enum ExportFormat {
  CSV = 0,
  XLSX = 1,
  PDF = 2,
}

export const DefaultExportFormatLabels: Record<number, string> = {
  [ExportFormat.CSV]: 'CSV',
  [ExportFormat.XLSX]: 'XLSX',
  [ExportFormat.PDF]: 'PDF',
};

export const CheckInMethodLabels: Record<number, string> = {
  [CheckInMethod.Manual]: 'Χειροκίνητο',
  [CheckInMethod.Automatic]: 'Αυτόματο',
  [CheckInMethod.Other]: 'Άλλο',
};

export type GlobalEnumsShape = {
  SellerType: typeof SellerType;
  SellerTypeLabels: Record<number, string>;
  LicenseCategory: typeof LicenseCategory;
  LicenseCategoryLabels: Record<number, string>;
  LicenseStatus: typeof LicenseStatus;
  LicenseStatusLabels: Record<number, string>;
  ChargeStatus: typeof ChargeStatus;
  ChargeStatusLabels: Record<number, string>;
  RequestStatus: typeof RequestStatus;
  RequestStatusLabels: Record<number, string>;
  UserStatus: typeof UserStatus;
  UserStatusLabels: Record<number, string>;
  UserRole: typeof UserRole;
  UserRoleLabels: Record<number, string>;
  CheckInMethod: typeof CheckInMethod;
  CheckInMethodLabels: Record<number, string>;
  ExportFormat: typeof ExportFormat;
  ExportFormatLabels: Record<number, string>;
  refresh?: () => Promise<void>;
};

export const GlobalEnumsContext = createContext<GlobalEnumsShape>({
  SellerType,
  SellerTypeLabels,
  LicenseCategory,
  LicenseCategoryLabels: DefaultLicenseCategoryLabels,
  LicenseStatus,
  LicenseStatusLabels: DefaultLicenseStatusLabels,
  ChargeStatus,
  ChargeStatusLabels: DefaultChargeStatusLabels,
  RequestStatus,
  RequestStatusLabels,
  UserStatus,
  UserStatusLabels,
  UserRole,
  UserRoleLabels,
  CheckInMethod,
  CheckInMethodLabels,
  refresh: async () => { },
  ExportFormat: undefined,
  ExportFormatLabels: undefined
});

export const GlobalEnumsProvider = ({ children }: { children: ReactNode }) => {
  const [sellerTypeLabels, setSellerTypeLabels] = useState(SellerTypeLabels);
  const [licenseCategoryLabels, setLicenseCategoryLabels] = useState<Record<number, string>>(DefaultLicenseCategoryLabels);
  const [licenseStatusLabels, setLicenseStatusLabels] = useState<Record<number, string>>(DefaultLicenseStatusLabels);
  const [chargeStatusLabels, setChargeStatusLabels] = useState<Record<number, string>>(DefaultChargeStatusLabels);
  const [requestStatusLabels, setRequestStatusLabels] = useState(RequestStatusLabels);
  const [userStatusLabels, setUserStatusLabels] = useState(UserStatusLabels);
  const [userRoleLabels, setUserRoleLabels] = useState(UserRoleLabels);
  const [exportFormatLabels, setExportFormatLabels] = useState<Record<number, string>>(DefaultExportFormatLabels);

  const fetchEnums = async () => {
    try {
      // Dynamically import `http` to avoid circular module initialization issues
      const { http } = await import('../../lib/http');

      // Replace `/enums` with the actual backend endpoint when available
      const res = await http.get<any>('/enums', { public: false });

      if (res?.sellerTypes) setSellerTypeLabels(res.sellerTypes as Record<number, string>);
      if (res?.licenseCategories) setLicenseCategoryLabels(res.licenseCategories as Record<number, string>);
      if (res?.licenseStatuses) setLicenseStatusLabels(res.licenseStatuses as Record<number, string>);
      if (res?.requestStatuses) setRequestStatusLabels(res.requestStatuses as Record<number, string>);
      if (res?.chargeStatuses) setChargeStatusLabels(res.chargeStatuses as Record<number, string>);
      if (res?.userStatuses) setUserStatusLabels(res.userStatuses as Record<number, string>);
      if (res?.userRoles) setUserRoleLabels(res.userRoles as Record<number, string>);
      if (res?.exportFormats) setExportFormatLabels(res.exportFormats as Record<number, string>);
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
        LicenseCategory,
        LicenseCategoryLabels: licenseCategoryLabels,
        LicenseStatus,
        LicenseStatusLabels: licenseStatusLabels,
        ChargeStatus,
        ChargeStatusLabels: chargeStatusLabels,
        RequestStatus,
        RequestStatusLabels: requestStatusLabels,
        UserStatus,
        UserStatusLabels: userStatusLabels,
        UserRole,
        UserRoleLabels: userRoleLabels,
        CheckInMethod,
        CheckInMethodLabels,
        ExportFormat,
        ExportFormatLabels: exportFormatLabels,
        refresh: fetchEnums,
      }}
    >
      {children}
    </GlobalEnumsContext.Provider>
  );
};

export const useGlobalEnums = () => useContext(GlobalEnumsContext);

export default GlobalEnumsProvider;
