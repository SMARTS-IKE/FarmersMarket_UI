import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import UserCircleIcon from '@mui/icons-material/AccountCircleOutlined';
import logo02 from '../../assets/LOGO_coloured.svg';

type Props = {
  onLogout: () => void;
  onAccountClick?: () => void;
};

export default function Header({ onLogout, onAccountClick }: Props) {
  
  function handleLogoutClick() {
    if (onLogout) onLogout();
  }
  return (
    <header className="relative z-20 border-b-4 border-[#ef4123] bg-[#C4B5A0] px-4 md:px-6">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-baseline gap-4 py-2">
          <img src={logo02} alt="Farmers Market logo" className="h-auto w-[120px] max-h-[52px] object-contain" />
          <p className="text-sm font-semibold text-(--color-text) whitespace-nowrap">Πλατφόρμα Διαχείρισης Λαϊκών Αγορών</p>
        </div>

        <div className="flex items-center justify-end pr-6">
          <Tooltip title="Διαχείριση λογαριασμού">
            <IconButton
              aria-label="account_circle"
              onClick={onAccountClick}
              sx={{
                width: 32,
                height: 32,
                color: '#3D2817',
                '&:hover': {
                  backgroundColor: 'rgba(61, 40, 23, 0.1)',
                },
              }}
            >
              <UserCircleIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Αποσύνδεση">
            <IconButton
              aria-label="logout"
              onClick={handleLogoutClick}
              sx={{
                width: 32,
                height: 32,
                color: '#3D2817',
                '&:hover': {
                  backgroundColor: 'rgba(61, 40, 23, 0.1)',
                },
              }}
            >
              <LogoutRoundedIcon />
            </IconButton>
          </Tooltip>
        </div>
      </div>
    </header>
  );
}
