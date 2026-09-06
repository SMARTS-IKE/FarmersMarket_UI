import { useState } from 'react';
import { Link } from '@tanstack/react-router';
import { forgotPassword } from '../../services/authService';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    const trimmedEmail = email.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!trimmedEmail || !emailRegex.test(trimmedEmail)) {
      setError('Παρακαλώ εισάγετε έγκυρη διεύθυνση email.');
      return;
    }

    setLoading(true);

    try {
      await forgotPassword({ email: trimmedEmail });
      setSuccessMessage('Αν υπάρχει λογαριασμός με αυτό το email, θα λάβεις οδηγίες επαναφοράς.');
      setEmail('');
    } catch (err) {
      const message = err instanceof Error && err.message
        ? err.message
        : 'Η αποστολή του email επαναφοράς απέτυχε.';
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="relative mb-7">
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 rounded-full bg-[#f7f6f5] p-3 shadow-[0_4px_10px_rgba(60,50,40,0.15)]">
          <EmailOutlinedIcon sx={{ color: '#6d5a4a', fontSize: 28 }} />
        </div>
        <div className="pt-5 text-center">
          <h2 className="text-2xl font-semibold text-[#5a4a3d]">Ανάκτηση Κωδικού</h2>
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
              id="forgot-email"
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

        <button
          type="submit"
          disabled={loading}
          className="my-2 mx-auto w-3/4 rounded-xl bg-[#603813] px-4 py-1.5 text-[16px] font-semibold text-[#f7f1eb] transition hover:bg-[#2c1f14] disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
        >
          {loading ? 'Αποστολή…' : 'Αποστολή'}
        </button>
      </form>

      <p className="mt-3 text-center text-sm text-[#6f655c]">
        <Link to="/auth/login" className="font-semibold text-[#6f3f16] hover:underline">
          Επιστροφή στη σύνδεση
        </Link>
      </p>
    </div>
  );
}
