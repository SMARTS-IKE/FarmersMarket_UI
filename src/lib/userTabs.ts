export interface UserTab {
  to:
    | '/users'
    | '/users/profile'
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
    to: '/users/profile',
    label: 'Το Προφίλ μου',
    title: 'Προφίλ Χρήστη',
    description: '',
  },
  {
    to: '/users/markets',
    label: 'Οι Αγορές Που Συμμετέχω',
    title: 'Οι Αγορές Που Συμμετέχω',
    description: '',
    hasList: true,
  },
  {
    to: '/users/requests',
    label: 'Οι Αιτήσεις μου',
    title: 'Οι Αιτήσεις μου',
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
