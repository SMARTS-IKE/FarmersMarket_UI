import { useEffect, useState } from 'react';
import { useNavigate, Link } from '@tanstack/react-router';
import { login } from '../../services/authService';
import { consumeAuthNotification } from '../../lib/authNotifications';
import { useAuthStore } from '../../store/authStore';
import PersonIcon from '@mui/icons-material/Person';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [remember, setRemember] = useState(false);
  const setAuth = useAuthStore((s) => s.setAuth);
  const navigate = useNavigate();

  useEffect(() => {
    const notification = consumeAuthNotification();

    if (notification?.type === 'success') {
      setSuccessMessage(notification.message);
    }
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setLoading(true);

    try {
      const data = await login({ email, password });
      setAuth(data);

      const state = useAuthStore.getState();

      // If 'Remember Me' is checked, persist the auth state to localStorage
      if (remember) {
        try {
          // Store a simplified auth object for rehydration
          localStorage.setItem('auth', JSON.stringify({
            user: state.user,
            token: state.token,
            email: state.email,
            role: state.role,
          }));
        } catch (e) {
          // ignore storage errors
        }
      } else {
        try {
          localStorage.removeItem('auth');
        } catch (e) {
          // ignore
        }
      }

      const role = state.role;
      navigate({ to: role === 'User_Access' ? '/users' : '/admin' });
    } catch {
      setError('Λάθος στοιχεία εισόδου.\nΔοκιμάστε ξανά');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="relative mb-7">
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 rounded-full bg-[#f7f6f5] p-3 shadow-[0_4px_10px_rgba(60,50,40,0.15)]">
          <PersonIcon sx={{ color: '#6d5a4a', fontSize: 28 }} />
        </div>
        <div className="pt-5 text-center">
          <h2 className="text-2xl font-semibold text-[#5a4a3d]">Είσοδος Χρήστη</h2>
          <div className="mx-auto mt-2 h-px w-44 bg-[#8e7866]" />
        </div>
      </div>

      <form className="flex flex-col gap-4" onSubmit={handleSubmit} noValidate>
        {successMessage && (
          <div
            className="rounded-lg border border-emerald-300 bg-emerald-50 px-4 py-3 text-sm text-emerald-700"
            role="status"
          >
            {successMessage}
          </div>
        )}

        {error && (
          <div
            className="bg-danger-subtle border border-(--color-danger-border) text-danger rounded-lg px-4 py-3 text-center whitespace-pre-line text-sm"
            role="alert"
          >
            {error}
          </div>
        )}

        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 rounded-[10px] border border-[#9c9084] bg-[#ece9e6] px-3 py-2.5">
            <EmailOutlinedIcon sx={{ color: '#8f8479', fontSize: 20 }} />
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="w-full bg-transparent text-[15px] text-[#4f4338] placeholder:text-[#9f968f] outline-none"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 rounded-[10px] border border-[#9c9084] bg-[#ece9e6] px-3 py-2.5">
            <LockOutlinedIcon sx={{ color: '#8f8479', fontSize: 20 }} />
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Κωδικός"
              className="w-full bg-transparent text-[15px] text-[#4f4338] placeholder:text-[#9f968f] outline-none"
            />
          </div>
        </div>

        <div className="mt-1 flex items-center justify-between gap-3 text-[13px] text-[#6f6359]">
          <label className="inline-flex items-center gap-2">
            <input
              type="checkbox"
              className="h-4 w-4 border-[#8f8479] accent-[#7a4f1e]"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
            />
            Να με θυμάσαι
          </label>
          <a href="#" className="font-medium text-[#6f3f16] hover:underline">
            Ξέχασα τον κωδικό μου
          </a>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="my-2 mx-auto w-3/4 rounded-xl bg-[#8a5a22] px-4 py-1.5 text-[16px] font-semibold text-[#f7f1eb] transition hover:bg-[#7b4f1d] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? 'Είσοδος…' : 'Είσοδος'}
        </button>
      </form>

      <p className="mt-3 text-center text-sm text-[#6f655c]">
        Δεν έχετε λογαριασμό;{' '}
        <Link to="/auth/register" className="font-semibold text-[#6f3f16] hover:underline">
          Αίτηση Εγγραφής
        </Link>
      </p>
    </div>
  );
}
