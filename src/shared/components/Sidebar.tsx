import { Link } from '@tanstack/react-router';
import IconButton from '@mui/material/IconButton';
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import logo03 from '../../assets/logo-03.svg';
import { systemAdminTabs } from '../../lib/systemAdminTabs';
import icon1 from '../../assets/sidebar/1_icon_arxiki.jpg';
import icon2 from '../../assets/sidebar/2_icon_diaxeirisi _xristwn.svg';
import icon3 from '../../assets/sidebar/3_icon_mitrwo pwlitwn.jpg';
import icon4 from '../../assets/sidebar/4_icon_diaxeirisi agorwn.jpg';
import icon5 from '../../assets/sidebar/5_icon_diaxeirisi anaforwn.jpg';
import icon6 from '../../assets/sidebar/6_icon_teli-plirwmes.jpg';
import icon7 from '../../assets/sidebar/7_icon_diaxeirisi aitisewn.jpg';


const sidebarIcons = [icon1, icon2, icon3, icon4, icon5, icon6, icon7];

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
  return (
    <aside className={`relative z-10 flex flex-col gap-4 bg-(--color-bg-subtle) p-3 transition-all ${collapsed ? 'w-20' : 'w-72'}`}>
      <div className={`flex items-center ${collapsed ? 'justify-center' : 'justify-end'}`}>
        <IconButton aria-label="toggle_menu" onClick={() => setCollapsed((s) => !s)} size="small">
          {collapsed ? <MenuRoundedIcon /> : <CloseRoundedIcon />}
        </IconButton>
      </div>

      <div className="mt-2 flex flex-1 flex-col gap-1">
        {tabs.map((tab, i) => {
          const isActive = activeTab?.to === tab.to;
          const icon = icons?.[i];

          return (
            <Link
              key={tab.to}
              to={tab.to}
              title={tab.label}
              aria-label={tab.label}
              className={`flex items-center ${collapsed ? 'justify-center' : 'gap-3'} rounded px-3 py-2 text-sm transition font-medium ${isActive ? 'bg-(--color-text-muted) text-(--color-surface) border border-(--color-border) font-bold' : 'text-(--color-text) hover:bg-(--color-primary-subtle)'} `}
            >
              {icon && <img src={icon} alt="" className="h-5 w-5 flex-shrink-0 rounded-sm object-contain" />}
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
