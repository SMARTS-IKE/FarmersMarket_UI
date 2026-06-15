import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { setAuthNotification } from '../../../lib/authNotifications';
import type { RegisterCredentials } from '../../../models/auth';
import { useRegisterMutation } from '../../../queries/authQueries';
import { USER_ROLE_MAPPING, USER_ROLE_MAPPING_TITLES } from '../../../shared/mappings/users.mapping';
import { SELLER_TYPE_LABELS } from '../../../components/sellers/sellers.utils';

const inputClass =
  'w-full px-4 py-3 text-[15px] rounded-lg border border-(--color-border) bg-(--color-bg) text-(--color-text-heading) placeholder:text-(--color-text-muted) outline-none transition focus:border-(--color-primary) focus:ring-3 focus:ring-(--color-primary-subtle)';

const ROLE_OPTIONS = USER_ROLE_MAPPING_TITLES ? Object.values(USER_ROLE_MAPPING_TITLES) : [];
const ROLE_KEYS = USER_ROLE_MAPPING_TITLES ? Object.keys(USER_ROLE_MAPPING_TITLES) : [];
const INITIAL_PASSWORD = 'Aa111111!';
const DEFAULT_ROLE = USER_ROLE_MAPPING.USER;

interface UserCreationForm extends RegisterCredentials {
  role: string;
}

export default function UserCreation() {
  const navigate = useNavigate();
  const registerMutation = useRegisterMutation();
  const [form, setForm] = useState<UserCreationForm>({
    firstName: '',
    lastName: '',
    email: '',
    afm: '',
    phone: '',
    address: '',
    sellerType: 0,
    role: DEFAULT_ROLE,
  });
  const [errors, setErrors] = useState<Partial<Record<keyof UserCreationForm | 'form', string>>>({});

  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  function validate(): boolean {
    const next: typeof errors = {};

    if (!form.firstName.trim()) next.firstName = 'Το όνομα είναι υποχρεωτικό';
    else if (form.firstName.trim().length < 2) next.firstName = 'Ελάχιστος αριθμός χαρακτήρων: 2.';

    if (!form.lastName.trim()) next.lastName = 'Το επώνυμο είναι υποχρεωτικό';
    else if (form.lastName.trim().length < 2) next.lastName = 'Ελάχιστος αριθμός χαρακτήρων: 2.';

    if (!form.afm?.trim()) next.afm = 'Το ΑΦΜ είναι υποχρεωτικό';

    if (!form.phone?.trim()) next.phone = 'Το τηλέφωνο είναι υποχρεωτικό';

    if (!form.address?.trim()) next.address = 'Η διεύθυνση είναι υποχρεωτική';

    if (!form.email.trim()) next.email = 'Το email είναι υποχρεωτικό';
    else if (!EMAIL_RE.test(form.email)) next.email = 'Μη έγκυρη διεύθυνση email';

    if (!form.role) next.role = 'Ο ρόλος είναι υποχρεωτικός';

    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = e.target;
    setForm((prev) => ({ 
      ...prev, 
      [name]: name === 'sellerType' ? Number(value) : value 
    }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  }

  function handleRoleChange(role: string) {
    setForm((prev) => ({ ...prev, role }));
    setErrors((prev) => ({ ...prev, role: undefined }));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!validate()) return;

    try {
      await registerMutation.mutateAsync({
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim(),
        afm: form.afm?.trim() || '',
        phone: form.phone?.trim() || '',
        address: form.address?.trim() || '',
        sellerType: form.sellerType,
        password: INITIAL_PASSWORD,
        role: form.role,
      });

      setAuthNotification({
        type: 'success',
        message: 'Ο χρήστης δημιουργήθηκε επιτυχώς.',
      });
      navigate({ to: '/admin/users' });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Η δημιουργία χρήστη απέτυχε';
      setErrors({ form: message });
      setAuthNotification({ type: 'error', message });
    }
  }

  return (
    <div className="min-h-screen p-6 md:px-10 bg-transparent">
      <div className="mx-auto max-w-2xl">
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-(--color-text-heading) mb-2">Δημιουργία Χρήστη</h2>
          <p className="text-sm text-(--color-text-muted)">Συμπληρώστε τα στοιχεία του νέου χρήστη</p>
        </div>

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

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label htmlFor="sellerType" className="text-sm font-semibold text-(--color-text-heading)">
                Τύπος Πωλητή
              </label>
              <select
                id="sellerType"
                name="sellerType"
                value={form.sellerType}
                onChange={handleChange}
                className={inputClass}
              >
                <option value={0}>-- Επιλέξτε --</option>
                {Object.entries(SELLER_TYPE_LABELS).map(([value, label]) => (
                  <option key={value} value={Number(value)}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label htmlFor="role" className="text-sm font-semibold text-(--color-text-heading)">
                Ρόλος *
              </label>
              <select
                id="role"
                name="role"
                value={form.role}
                onChange={(e) => handleRoleChange(e.target.value)}
                className={`${inputClass} ${errors.role ? 'border-(--color-danger) focus:border-(--color-danger) focus:ring-(--color-danger-subtle)' : ''}`}
              >
                <option value="">-- Επιλέξτε --</option>
                {ROLE_KEYS.map((roleKey, index) => (
                  <option key={roleKey} value={roleKey}>
                    {ROLE_OPTIONS[index]}
                  </option>
                ))}
              </select>
              {errors.role && <p className="text-xs text-(--color-danger) mt-1">{errors.role}</p>}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={registerMutation.isPending}
              className="w-full py-3 px-4 text-[15px] font-semibold rounded-lg bg-(--color-text) text-white transition hover:brightness-90 active:brightness-75 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
            >
              {registerMutation.isPending ? 'Αποθήκευση...' : 'Αποθήκευση'}
            </button>
            <button
              type="button"
              onClick={() => navigate({ to: '/admin/users' })}
              disabled={registerMutation.isPending}
              className="w-full py-3 px-4 text-[15px] font-semibold rounded-lg bg-transparent border border-(--color-text-muted) text-(--color-text-heading) transition hover:bg-(--color-bg-hover) disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
            >
              Ακύρωση
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}