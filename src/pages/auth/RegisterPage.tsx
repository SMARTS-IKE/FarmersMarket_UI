import { useState } from 'react';
import { useNavigate, Link } from '@tanstack/react-router';
import { setAuthNotification } from '../../lib/authNotifications';
import type { RegisterCredentials } from '../../models/auth';
import { useRegisterMutation } from '../../queries/authQueries';

const ROLES = [
  { value: 'farmer', label: 'Παραγωγός' },
  { value: 'buyer', label: 'Αγοραστής' },
  { value: 'SystemAdmin', label: 'Διαχειριστής' },
];

const inputClass =
  'w-full px-4 py-3 text-[15px] rounded-lg border border-(--color-border) bg-(--color-bg) text-(--color-text-heading) placeholder:text-(--color-text-muted) outline-none transition focus:border-(--color-primary) focus:ring-3 focus:ring-(--color-primary-subtle)';

export default function RegisterPage() {
  const [form, setForm] = useState<RegisterCredentials>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: '',
  });
  const [repeatPassword, setRepeatPassword] = useState('');
  const [errors, setErrors] = useState<Partial<Record<keyof RegisterCredentials | 'repeatPassword' | 'form', string>>>({});
  const navigate = useNavigate();
  const registerMutation = useRegisterMutation();

  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  function validate(): boolean {
    const next: typeof errors = {};

    if (!form.firstName.trim())  next.firstName     = 'Το όνομα είναι υποχρεωτικό';
    
    if (!form.lastName.trim())   next.lastName      = 'Το επώνυμο είναι υποχρεωτικό';
    
    if (!form.email.trim())      next.email         = 'Το email είναι υποχρεωτικό';
    else if (!EMAIL_RE.test(form.email)) next.email = 'Μη έγκυρη διεύθυνση email';
    
    if (!form.password)          next.password      = 'Ο κωδικός είναι υποχρεωτικός';
    
    if (!repeatPassword)         next.repeatPassword = 'Επαναλάβετε τον κωδικό';
    else if (form.password && form.password !== repeatPassword)
                                 next.repeatPassword = 'Οι κωδικοί δεν ταιριάζουν';

    if (!form.role)              next.role          = 'Επιλέξτε ρόλο';

    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!validate()) return;

    try {
      await registerMutation.mutateAsync(form);
      setAuthNotification({
        type: 'success',
        message: 'Η εγγραφή ολοκληρώθηκε επιτυχώς. Μπορείτε τώρα να συνδεθείτε.',
      });
      navigate({ to: '/auth/login' });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Η εγγραφή απέτυχε';
      setErrors({ form: message });
      setAuthNotification({ type: 'error', message });
    }
  }

  return (
    <>
      <p className="text-sm text-(--color-text-muted) text-center mb-6">
        Δημιουργία νέου λογαριασμού
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
              Όνομα
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
              Επώνυμο
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
            Διεύθυνση email
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

        <div className="flex flex-row gap-1">
            <div>
              <label htmlFor="password" className="text-sm font-semibold text-(--color-text-heading)">
                Κωδικός πρόσβασης
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                value={form.password}
                onChange={handleChange}
                placeholder="••••••••"
                className={`${inputClass} ${errors.password ? 'border-(--color-danger) focus:border-(--color-danger) focus:ring-(--color-danger-subtle)' : ''}`}
              />
                {errors.password && <p className="text-xs text-(--color-danger) mt-1">{errors.password}</p>}
            </div>
          

            <div>
              <label htmlFor="repeatPassword" className="text-sm font-semibold text-(--color-text-heading)">
                Επανάληψη κωδικού
              </label>
              <input
                id="repeatPassword"
                type="password"
                autoComplete="new-password"
                required
                value={repeatPassword}
                onChange={(e) => {
                  setRepeatPassword(e.target.value);
                  setErrors((prev) => ({ ...prev, repeatPassword: undefined }));
                }}
                placeholder="••••••••"
                className={`${inputClass} ${errors.repeatPassword ? 'border-(--color-danger) focus:border-(--color-danger) focus:ring-(--color-danger-subtle)' : ''}`}
              />
              {errors.repeatPassword && (
                <p className="text-xs text-(--color-danger) mt-1">{errors.repeatPassword}</p>
              )}
            </div>
        </div>

        

        <div className="flex flex-col gap-1">
          <label htmlFor="role" className="text-sm font-semibold text-(--color-text-heading)">
            Ρόλος
          </label>
          <select
            id="role"
            name="role"
            required
            value={form.role}
            onChange={handleChange}
            className={`${inputClass} ${errors.role ? 'border-(--color-danger) focus:border-(--color-danger) focus:ring-(--color-danger-subtle)' : ''}`}
          >
            <option value="" disabled>Επιλέξτε ρόλο…</option>
            {ROLES.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>
          {errors.role && <p className="text-xs text-(--color-danger) mt-1">{errors.role}</p>}
        </div>

        <button
          type="submit"
          disabled={registerMutation.isPending}
          className="mt-2 w-full py-3 px-4 text-[15px] font-semibold rounded-lg bg-(--color-primary) text-(--color-primary-fg) transition hover:bg-(--color-primary-hover) active:bg-(--color-primary-active) disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
        >
          {registerMutation.isPending ? 'Εγγραφή…' : 'Εγγραφή'}
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

