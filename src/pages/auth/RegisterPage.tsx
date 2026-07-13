import { useState } from 'react';
import { useNavigate, Link } from '@tanstack/react-router';
import { setAuthNotification } from '../../lib/authNotifications';
import type { RegisterCredentials } from '../../models/auth';
import { useRegisterMutation } from '../../queries/authQueries';
import { SELLER_TYPE_LABELS } from '../../components/sellers/sellers.utils';

const inputClass =
  'w-full px-4 py-3 text-[15px] rounded-lg border border-(--color-border) bg-(--color-bg) text-(--color-text-heading) placeholder:text-(--color-text-muted) outline-none transition focus:border-(--color-primary) focus:ring-3 focus:ring-(--color-primary-subtle)';

export const DEFAULT_PASSWORD = 'Aa111111!';

export default function RegisterPage() {
  const [form, setForm] = useState<RegisterCredentials>({
    firstName: '',
    lastName: '',
    email: '',
    afm: '',
    phone: '',
    address: '',
    sellerType: 0,
  });
  const [errors, setErrors] = useState<Partial<Record<keyof RegisterCredentials | 'form', string>>>({});
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate();
  const registerMutation = useRegisterMutation();

  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  

  function validate(): boolean {
    const next: typeof errors = {};

    if (!form.firstName.trim())  next.firstName     = 'Το όνομα είναι υποχρεωτικό';
    
    if (!form.lastName.trim())   next.lastName      = 'Το επώνυμο είναι υποχρεωτικό';

    if (!form.afm?.trim())       next.afm           = 'Το ΑΦΜ είναι υποχρεωτικό';
    else if (!/^\d{9}$/.test(form.afm.trim())) next.afm = 'Το ΑΦΜ πρέπει να αποτελείται από 9 ψηφία';

    if (!form.phone?.trim())     next.phone         = 'Το τηλέφωνο είναι υποχρεωτικό';
    else if (!/^\d{10}$/.test(form.phone.trim())) next.phone = 'Το τηλέφωνο πρέπει να αποτελείται από 10 ψηφία';

    if (!form.address?.trim())   next.address       = 'Η διεύθυνση είναι υποχρεωτική';
    
    if (!form.email.trim())      next.email         = 'Το email είναι υποχρεωτικό';
    else if (!EMAIL_RE.test(form.email)) next.email = 'Μη έγκυρη διεύθυνση email';

    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: name === 'sellerType' ? Number(value) : value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!validate()) return;

    try {
      const payload = { ...form, password: DEFAULT_PASSWORD, role: 'User_Access' };
      await registerMutation.mutateAsync(payload);

      const message = 'Η αίτηση εγγραφής υποβλήθηκε. Ο διαχειριστής θα εγκρίνει ή θα απορρίψει την αίτηση και θα σας στείλει τον κωδικό μέσω email.';
      setAuthNotification({ type: 'success', message });
      setSuccessMessage(message);

      // Give the user a moment to read the success message, then redirect to login
      setTimeout(() => {
        navigate({ to: '/auth/login' });
      }, 1400);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Η αίτηση εγγραφής απέτυχε';
      setErrors({ form: message });
      setAuthNotification({ type: 'error', message });
    }
  }

  return (
    <>
      <p className="text-sm text-(--color-text-muted) text-center mb-6 pb-2">
        Αίτηση Εγγραφής
      </p>

      <form className="flex flex-col gap-4" onSubmit={handleSubmit} noValidate>
        {errors.form && (
          <div
            className="bg-danger-subtle border border-(--color-danger-border) text-danger rounded-lg px-4 py-3 text-sm"
            role="alert"
          >
            {errors.form}
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1">
            <label htmlFor="firstName" className="text-sm font-semibold text-(--color-text-heading)">
              Όνομα *
            </label>
            <input
              id="firstName"
              name="firstName"
              type="text"
              autoComplete="given-name"
              value={form.firstName}
              onChange={handleChange}
              placeholder="Όνομα"
              className={`${inputClass} ${errors.firstName ? 'border-(--color-danger) focus:border-(--color-danger) focus:ring-(--color-danger-subtle)' : ''}`}
            />
            {errors.firstName && <p className="text-xs text-(--color-danger) mt-1">{errors.firstName}</p>}
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="lastName" className="text-sm font-semibold text-(--color-text-heading)">
              Επώνυμο *
            </label>
            <input
              id="lastName"
              name="lastName"
              type="text"
              autoComplete="family-name"
              value={form.lastName}
              onChange={handleChange}
              placeholder="Επώνυμο"
              className={`${inputClass} ${errors.lastName ? 'border-(--color-danger) focus:border-(--color-danger) focus:ring-(--color-danger-subtle)' : ''}`}
            />
            {errors.lastName && <p className="text-xs text-(--color-danger) mt-1">{errors.lastName}</p>}
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="email" className="text-sm font-semibold text-(--color-text-heading)">
            Διεύθυνση email *
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={form.email}
            onChange={handleChange}
            placeholder="you@example.com"
            className={`${inputClass} ${errors.email ? 'border-(--color-danger) focus:border-(--color-danger) focus:ring-(--color-danger-subtle)' : ''}`}
          />
          {errors.email && <p className="text-xs text-(--color-danger) mt-1">{errors.email}</p>}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1">
            <label htmlFor="afm" className="text-sm font-semibold text-(--color-text-heading)">
              ΑΦΜ *
            </label>
            <input
              id="afm"
              name="afm"
              type="text"
              value={form.afm}
              maxLength={9}
              inputMode="numeric"
              onChange={handleChange}
              placeholder="ΑΦΜ"
              className={`${inputClass} ${errors.afm ? 'border-(--color-danger) focus:border-(--color-danger) focus:ring-(--color-danger-subtle)' : ''}`}
            />
            {errors.afm && <p className="text-xs text-(--color-danger) mt-1">{errors.afm}</p>}
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="phone" className="text-sm font-semibold text-(--color-text-heading)">
              Τηλέφωνο *
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              value={form.phone}
              maxLength={10}
              inputMode="numeric"
              onChange={handleChange}
              placeholder="Τηλέφωνο"
              className={`${inputClass} ${errors.phone ? 'border-(--color-danger) focus:border-(--color-danger) focus:ring-(--color-danger-subtle)' : ''}`}
            />
            {errors.phone && <p className="text-xs text-(--color-danger) mt-1">{errors.phone}</p>}
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="address" className="text-sm font-semibold text-(--color-text-heading)">
            Διεύθυνση *
          </label>
          <input
            id="address"
            name="address"
           type="text"
            value={form.address}
            onChange={handleChange}
            placeholder="Διεύθυνση"
            className={`${inputClass} ${errors.address ? 'border-(--color-danger) focus:border-(--color-danger) focus:ring-(--color-danger-subtle)' : ''}`}
          />
          {errors.address && <p className="text-xs text-(--color-danger) mt-1">{errors.address}</p>}
        </div>

          <button
            type="submit"
            disabled={registerMutation.isPending}
            className="mt-2 w-full py-3 px-4 text-[15px] font-semibold rounded-lg bg-(--color-primary) text-(--color-primary-fg) transition hover:bg-(--color-primary-hover) active:bg-(--color-primary-active) disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
          >
            {registerMutation.isPending ? 'Υποβολή…' : 'Υποβολή Αίτησης'}
          </button>
      </form>

      <p className="text-center text-sm text-(--color-text-muted) mt-6">
        Έχετε ήδη λογαριασμό;{' '}
        <Link to="/auth/login" className="text-(--color-primary) hover:underline font-medium">
          Είσοδος
        </Link>
      </p>
    </>
  );
}

