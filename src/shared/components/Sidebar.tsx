import { Link } from '@tanstack/react-router';
import IconButton from '@mui/material/IconButton';
import logo03 from '../../assets/logo-03.svg';
import { systemAdminTabs } from '../../lib/systemAdminTabs';
import { userTabs } from '../../lib/userTabs';
import { useAuthStore } from '../../store/authStore';
import icon1 from '../../assets/sidebar/icons_start.svg';
import icon2 from '../../assets/sidebar/icons_users.svg';
import icon3 from '../../assets/sidebar/icons_sellers.svg';
import icon4 from '../../assets/sidebar/icons_markets.svg';
import icon5 from '../../assets/sidebar/icons_reports.svg';
import icon6 from '../../assets/sidebar/icons_fees.svg';
import icon7 from '../../assets/sidebar/icons_requests.svg';
import userProfileIcon from '../../assets/icon-user account.svg';


const sidebarIcons = [icon1, icon2, icon3, icon4, icon5, icon6, icon7];
const userIcons = [icon1, userProfileIcon, icon4, icon7];

const MenuIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
    <path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const CloseIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
    <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

interface TabItem {
  to: string;
  label: string;
}

interface Props {
  collapsed: boolean;
  setCollapsed: (fn: (prev: boolean) => boolean) => void;
  activeTab: { to: string } | any;
  tabs?: TabItem[];
  icons?: string[];
}

export default function Sidebar({ collapsed, setCollapsed, activeTab, tabs = systemAdminTabs, icons = sidebarIcons }: Props) {
  const isAdmin = useAuthStore((s) => s.isAdmin());

  // If the sidebar was rendered with admin tabs but the current user is not an admin,
  // show the limited `userTabs` instead.
  const tabsToShow = (!isAdmin && tabs === systemAdminTabs) ? userTabs : tabs;

  const iconsToShow = tabsToShow === userTabs ? userIcons : icons;

  return (
    <aside className={`relative z-10 flex flex-col gap-4 bg-(--color-bg-subtle) p-3 transition-all ${collapsed ? 'w-20' : 'w-72'}`}>
      <div className={`flex items-center ${collapsed ? 'justify-center' : 'justify-end'}`}>
        <IconButton aria-label="toggle_menu" onClick={() => setCollapsed((s) => !s)} size="small">
          {collapsed ? <MenuIcon /> : <CloseIcon />}
        </IconButton>
      </div>

      <div className="mt-2 flex flex-1 flex-col gap-1">
        {tabsToShow.map((tab, i) => {
          const isActive = activeTab?.to === tab.to;
          const icon = iconsToShow?.[i] ?? icons?.[i];

          return (
            <Link
              key={tab.to}
              to={tab.to}
              title={tab.label}
              aria-label={tab.label}
              className={`flex items-center ${collapsed ? 'justify-center' : 'gap-3'} rounded px-3 py-2 text-sm transition font-medium ${isActive ? 'bg-(--color-text-muted) text-(--color-surface) border border-(--color-border) font-bold' : 'text-(--color-text) hover:bg-(--color-primary-subtle)'} `}
            >
              {icon && <img src={icon} alt="" className="h-5 w-5 shrink-0 rounded-sm object-contain" />}
              {!collapsed && <span className="truncate">{tab.label}</span>}
            </Link>
          );
        })}
      </div>

      {!collapsed && (
        <div className="mt-auto">
          <img src={logo03} alt="Farmers Market emblem" className="h-auto w-full object-contain" />
        </div>
      )}
    </aside>
  );
}
