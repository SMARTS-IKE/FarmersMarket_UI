import { useState } from 'react';
import { useNavigate, Link } from '@tanstack/react-router';
import { login } from '../../services/authService';
import { useAuthStore } from '../../store/authStore';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const setAuth = useAuthStore((s) => s.setAuth);
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await login({ email, password });
      setAuth(data);
      navigate({ to: '/dashboard' });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <p className="text-sm text-(--color-text-muted) text-center mb-6">Είσοδος στο λογαριασμό σας</p>

      <form className="flex flex-col gap-4" onSubmit={handleSubmit} noValidate>
        {error && (
          <div
            className="bg-danger-subtle border border-(--color-danger-border) text-danger rounded-lg px-4 py-3 text-sm"
            role="alert"
          >
            {error}
          </div>
        )}

        <div className="flex flex-col gap-1">
          <label htmlFor="email" className="text-sm font-semibold text-(--color-text-heading)">
            Διεύθυνση email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full px-4 py-3 text-[15px] rounded-lg border border-(--color-border) bg-(--color-bg) text-(--color-text-heading) placeholder:text-(--color-text-muted) outline-none transition focus:border-(--color-primary) focus:ring-3 focus:ring-(--color-primary-subtle)"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="password" className="text-sm font-semibold text-(--color-text-heading)">
            Κωδικός πρόσβασης
          </label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full px-4 py-3 text-[15px] rounded-lg border border-(--color-border) bg-(--color-bg) text-(--color-text-heading) placeholder:text-(--color-text-muted) outline-none transition focus:border-(--color-primary) focus:ring-3 focus:ring-(--color-primary-subtle)"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="mt-2 w-full py-3 px-4 text-[15px] font-semibold rounded-lg bg-(--color-primary) text-(--color-primary-fg) transition hover:bg-(--color-primary-hover) active:bg-(--color-primary-active) disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
        >
          {loading ? 'Είσοδος…' : 'Είσοδος'}
        </button>
      </form>

      <p className="text-center text-sm text-(--color-text-muted) mt-6">
        Δεν έχετε λογαριασμό;{' '}
        <Link to="/auth/register" className="text-(--color-primary) hover:underline font-medium">
          Εγγραφή
        </Link>
      </p>
    </>
  );
}
