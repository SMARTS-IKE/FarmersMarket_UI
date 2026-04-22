export interface SystemAdminTab {
  to:
    | '/admin'
    | '/admin/users'
    | '/admin/sellers'
    | '/admin/markets'
    | '/admin/reports'
    | '/admin/requests';
  label: string;
  title: string;
  description: string;
  hasList?: boolean;
}

export const systemAdminTabs: SystemAdminTab[] = [
  {
    to: '/admin',
    label: 'Αρχική',
    title: 'Αρχική Σελίδα',
    description: '',
  },
  {
    to: '/admin/users',
    label: 'Διαχείριση Χρηστών',
    title: 'Διαχείριση Χρηστών',
    description: '',
    hasList: true,
  },
  {
    to: '/admin/sellers',
    label: 'Μητρώο Πωλητών',
    title: 'Μητρώο Πωλητών',
    description: '',
    hasList: true,
  },
  {
    to: '/admin/markets',
    label: 'Διαχείριση Αγορών',
    title: 'Διαχείριση Αγορών',
    description: '',
    hasList: true,
  },
  {
    to: '/admin/reports',
    label: 'Διαχείριση Αναφορών',
    title: 'Διαχείριση Αναφορών',
    description: '',
  },
  {
    to: '/admin/requests',
    label: 'Διαχείριση Αιτήσεων',
    title: 'Διαχείριση Αιτήσεων',
    description: '',
  }
];

export function getSystemAdminTab(pathname: string) {
  const exactMatch = systemAdminTabs.find((tab) => pathname === tab.to);

  if (exactMatch) {
    return exactMatch;
  }

  return [...systemAdminTabs]
    .sort((left, right) => right.to.length - left.to.length)
    .find((tab) => pathname.startsWith(`${tab.to}/`)) ?? systemAdminTabs[0];
}