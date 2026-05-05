export interface UserTab {
  to:
    | '/users'
    | '/users/markets'
    | '/users/requests';
  label: string;
  title: string;
  description: string;
  hasList?: boolean;
}

export const userTabs: UserTab[] = [
  {
    to: '/users',
    label: 'Αρχική',
    title: 'Αρχική Σελίδα',
    description: '',
  },
  {
    to: '/users/markets',
    label: 'Αγορές',
    title: 'Αγορές',
    description: '',
    hasList: true,
  },
  {
    to: '/users/requests',
    label: 'Αιτήσεις',
    title: 'Αιτήσεις',
    description: '',
    hasList: true,
  },
];

export function getUserTab(pathname: string) {
  const exactMatch = userTabs.find((tab) => pathname === tab.to);

  if (exactMatch) {
    return exactMatch;
  }

  return [...userTabs]
    .sort((left, right) => right.to.length - left.to.length)
    .find((tab) => pathname.startsWith(`${tab.to}/`)) ?? userTabs[0];
}
