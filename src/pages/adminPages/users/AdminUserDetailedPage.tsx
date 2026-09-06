import { useEffect, useState } from 'react';
import { useNavigate, useParams } from '@tanstack/react-router';
import { setAuthNotification } from '../../../lib/authNotifications';
import type { RegisterCredentials } from '../../../models/auth';
import { useRegisterMutation } from '../../../queries/authQueries';
import { useAssignUserRoleMutation, useRemoveUserRoleMutation, useUpdateUserMutation, useUserQuery } from '../../../queries/userQueries';
import { useAllSellersQuery } from '../../../queries/sellerQueries';
import { USER_ROLE_MAPPING, USER_ROLE_MAPPING_TITLES } from '../../../shared/mappings/users.mapping';
import { SELLER_TYPE_LABELS } from '../../../components/sellers/sellers.utils';
import CustomInputField from '../../../shared/components/CustomInputField';
import { DEFAULT_PASSWORD } from '../../auth/RegisterPage';

const inputClass =
  'w-full px-4 py-3 text-[15px] rounded-lg border border-(--color-border) bg-(--color-bg) text-(--color-text-heading) placeholder:text-(--color-text-muted) outline-none transition focus:border-(--color-primary) focus:ring-3 focus:ring-(--color-primary-subtle)';

const ROLE_OPTIONS = USER_ROLE_MAPPING_TITLES ? Object.values(USER_ROLE_MAPPING_TITLES) : [];
const ROLE_KEYS = USER_ROLE_MAPPING_TITLES ? Object.keys(USER_ROLE_MAPPING_TITLES) : [];
const INITIAL_PASSWORD = DEFAULT_PASSWORD; // Default password for new users
const DEFAULT_ROLE = USER_ROLE_MAPPING.USER;

interface UserCreationForm extends RegisterCredentials {
  role: string;
}

interface AdminUserDetailedPageProps {
  isCreation?: boolean;
}

export default function AdminUserDetailedPage({ isCreation = false }: AdminUserDetailedPageProps) {
  const navigate = useNavigate();
  const params = useParams({ strict: false });
  const routeUserId = params['id'] ?? '';
  const isEditMode = !isCreation && Boolean(routeUserId && routeUserId !== 'new');
  const registerMutation = useRegisterMutation();
  const updateUserMutation = useUpdateUserMutation(isEditMode ? routeUserId : '');
  const removeUserRoleMutation = useRemoveUserRoleMutation(isEditMode ? routeUserId : '');
  const assignUserRoleMutation = useAssignUserRoleMutation(isEditMode ? routeUserId : '');
  const { data: userData } = useUserQuery(isEditMode ? routeUserId : '');
  const allSellersQuery = useAllSellersQuery({ name: '', afm: '', sellerType: '' });
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

  useEffect(() => {
    if (!isEditMode || !userData) return;

    const candidateSeller = Array.isArray(allSellersQuery.data?.items)
      ? allSellersQuery.data.items.find((seller: any) => {
          const userIdMatches = seller.userId != null && String(seller.userId) === String(userData.id);
          const afmMatches = !!seller.afm && !!(userData as any)?.afm && String(seller.afm) === String((userData as any).afm);
          const nameMatches = !!seller.firstName && !!seller.lastName && `${seller.firstName} ${seller.lastName}`.trim() === `${userData.firstName ?? ''} ${userData.lastName ?? ''}`.trim();
          return userIdMatches || afmMatches || nameMatches;
        })
      : null;

    setForm({
      firstName: userData.firstName ?? '',
      lastName: userData.lastName ?? '',
      email: userData.email ?? '',
      afm: candidateSeller?.afm ?? (userData as any)?.afm ?? '',
      phone: candidateSeller?.phone ?? '',
      address: candidateSeller?.address ?? '',
      sellerType: Number(candidateSeller?.sellerType ?? 0),
      role: userData.roles?.[0] ?? DEFAULT_ROLE,
    });
  }, [allSellersQuery.data, isEditMode, userData]);

  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const isAdminRole = form.role === USER_ROLE_MAPPING.ADMIN || form.role === 'Admin_Access';

  function validate(): boolean {
    const next: typeof errors = {};

    if (!form.firstName.trim()) next.firstName = 'Το όνομα είναι υποχρεωτικό';
    else if (form.firstName.trim().length < 2) next.firstName = 'Ελάχιστος αριθμός χαρακτήρων: 2.';

    if (!form.lastName.trim()) next.lastName = 'Το επώνυμο είναι υποχρεωτικό';
    else if (form.lastName.trim().length < 2) next.lastName = 'Ελάχιστος αριθμός χαρακτήρων: 2.';

    if (!isAdminRole) {
      if (!form.afm?.trim()) next.afm = 'Το ΑΦΜ είναι υποχρεωτικό';
      if (!form.phone?.trim()) next.phone = 'Το τηλέφωνο είναι υποχρεωτικό';
      if (!form.address?.trim()) next.address = 'Η διεύθυνση είναι υποχρεωτική';
    }

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
      if (isCreation) {
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
      } else {
        const previousRole = userData?.roles?.[0];
        const nextRole = form.role;

        if (previousRole && previousRole !== nextRole) {
          await removeUserRoleMutation.mutateAsync(previousRole);
          await assignUserRoleMutation.mutateAsync({ role: nextRole });
        }

        const status = Number((userData as any)?.status ?? 1);
        await updateUserMutation.mutateAsync({
          firstName: form.firstName.trim(),
          lastName: form.lastName.trim(),
          status,
        });

        setAuthNotification({
          type: 'success',
          message: 'Ο χρήστης ενημερώθηκε επιτυχώς.',
        });
      }

      navigate({ to: '/admin/users' });
    } catch (err) {
      const message = err instanceof Error ? err.message : (isCreation ? 'Η δημιουργία χρήστη απέτυχε' : 'Η ενημέρωση χρήστη απέτυχε');
      setErrors({ form: message });
      setAuthNotification({ type: 'error', message });
    }
  }

  return (
    <div className="min-h-screen p-6 md:px-10 bg-transparent">
      <div className="mx-auto max-w-2xl">
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-(--color-text-heading) mb-2">
            {isCreation ? 'Δημιουργία Χρήστη' : 'Ενημέρωση Χρήστη'}
          </h2>
          <p className="text-sm text-(--color-text-muted)">
            {isCreation ? 'Συμπληρώστε τα στοιχεία του νέου χρήστη' : 'Επεξεργαστείτε τα στοιχεία του υπάρχοντος χρήστη'}
          </p>
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
              <CustomInputField
                type="TEXT"
                label="Όνομα *"
                value={form.firstName}
                placeholder="Όνομα"
                onChange={(v) => { setForm((p) => ({ ...p, firstName: String(v ?? '') })); setErrors((s) => ({ ...s, firstName: undefined })); }}
                error={errors.firstName}
                width="100%"
              />
            </div>

            <div className="flex flex-col gap-1">
              <CustomInputField
                type="TEXT"
                label="Επώνυμο *"
                value={form.lastName}
                placeholder="Επώνυμο"
                onChange={(v) => { setForm((p) => ({ ...p, lastName: String(v ?? '') })); setErrors((s) => ({ ...s, lastName: undefined })); }}
                error={errors.lastName}
                width="100%"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <CustomInputField
              type="TEXT"
              label="Διεύθυνση email *"
              value={form.email}
              placeholder="you@example.com"
              onChange={(v) => { setForm((p) => ({ ...p, email: String(v ?? '') })); setErrors((s) => ({ ...s, email: undefined })); }}
              error={errors.email}
              width="100%"
            />
          </div>

          {!isAdminRole && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <CustomInputField
                    type="TEXT"
                    label="ΑΦΜ *"
                    value={form.afm}
                    placeholder="ΑΦΜ"
                    onChange={(v) => { setForm((p) => ({ ...p, afm: String(v ?? '') })); setErrors((s) => ({ ...s, afm: undefined })); }}
                    error={errors.afm}
                    width="100%"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <CustomInputField
                    type="TEXT"
                    label="Τηλέφωνο *"
                    value={form.phone}
                    placeholder="Τηλέφωνο"
                    onChange={(v) => { setForm((p) => ({ ...p, phone: String(v ?? '') })); setErrors((s) => ({ ...s, phone: undefined })); }}
                    error={errors.phone}
                    width="100%"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <CustomInputField
                  type="TEXT"
                  label="Διεύθυνση *"
                  value={form.address}
                  placeholder="Διεύθυνση"
                  onChange={(v) => { setForm((p) => ({ ...p, address: String(v ?? '') })); setErrors((s) => ({ ...s, address: undefined })); }}
                  error={errors.address}
                  width="100%"
                />
              </div>
            </>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <CustomInputField
                type="DROPDOWN"
                label="Τύπος Πωλητή"
                value={form.sellerType}
                dropdownItems={[{ value: '', label: '-- Επιλέξτε --' }, ...Object.entries(SELLER_TYPE_LABELS).map(([value, label]) => ({ value: Number(value), label }))]}
                onChange={(v) => { setForm((p) => ({ ...p, sellerType: Number(v) })); setErrors((s) => ({ ...s, sellerType: undefined })); }}
                width="100%"
              />
            </div>

            <div className="flex flex-col gap-1">
              <CustomInputField
                type="DROPDOWN"
                label="Ρόλος *"
                value={form.role}
                dropdownItems={[{ value: '', label: '-- Επιλέξτε --' }, ...ROLE_KEYS.map((roleKey, index) => ({ value: roleKey, label: ROLE_OPTIONS[index] }))]}
                onChange={(v) => handleRoleChange(String(v))}
                error={errors.role}
                width="100%"
              />
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