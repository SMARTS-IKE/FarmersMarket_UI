import { useEffect, useMemo, useRef, useState, type SyntheticEvent } from 'react';
import { useBlocker, useNavigate, useParams, useLocation } from '@tanstack/react-router';
import { useAuthStore } from '../../store/authStore';
import { setAuthNotification } from '../../lib/authNotifications';
import {
  useAssignUserRoleMutation,
  useReinitializeUserPasswordMutation,
  useRemoveUserRoleMutation,
  useUpdateUserMutation,
  useUserQuery,
} from '../../queries/userQueries';
import { useGlobalEnums } from '../../shared/mappings/GlobalEnums';
import { useSellerQuery, useAllSellersQuery } from '../../queries/sellerQueries';
import { updateSeller } from '../../services/sellerService';
import CustomInputField from '../../shared/components/CustomInputField';
import { USER_ROLE_MAPPING_TITLES } from '../../shared/mappings/users.mapping';

const inputClass =
  'w-full px-4 py-3 text-[15px] rounded-lg border border-(--color-border) bg-(--color-bg) text-(--color-text-heading) placeholder:text-(--color-text-muted) outline-none transition focus:border-(--color-primary) focus:ring-3 focus:ring-(--color-primary-subtle) disabled:opacity-50 disabled:cursor-not-allowed';

const ROLE_OPTIONS = USER_ROLE_MAPPING_TITLES ? Object.values(USER_ROLE_MAPPING_TITLES) : [];
const ROLE_KEYS = USER_ROLE_MAPPING_TITLES ? Object.keys(USER_ROLE_MAPPING_TITLES) : [];

export default function UserPage() {
  const navigate = useNavigate();
  const params = useParams({ strict: false });
  const location = useLocation();
  const rawId = params['id'] ?? params['userId'] ?? params['userId'] ?? '';
  let userId = rawId !== undefined && rawId !== null ? String(rawId) : '';

  // Fallback: derive id from pathname (e.g. /admin/users/123) when params are not populated
  if (!userId) {
    // Prefer authenticated user's id when available (self-profile)
    try {
      const authStateUser = useAuthStore.getState().user;
      if (authStateUser && authStateUser.userId) {
        userId = String(authStateUser.userId);
      }
    } catch (e) {
      // ignore
    }
    try {
      const path = String((location && (location as any).pathname) || '');
      const parts = path.split('/').filter(Boolean);
      const last = parts[parts.length - 1] ?? '';
      // Avoid treating reserved path segments like 'new' or 'profile' as an actual user id
      if (last && last !== 'new' && last !== 'profile') userId = last;
    } catch (e) {
      // ignore and keep userId as empty
    }
  }
  // Determine sellerId from the loaded user or the authenticated session (if present)
  const authUser = useAuthStore.getState().user;

  // Determine if we're in user-facing mode: authenticated user viewing their own profile
  const isUserMode = !!authUser && !!authUser.sellerId && (String(userId) === String(authUser.userId ?? authUser.id ?? '') || !params['id'] && !params['userId']);
  const userQueryId = isUserMode ? '' : userId;
  const { data: user, isLoading, isError, error } = useUserQuery(userQueryId);
  const updateUserMutation = useUpdateUserMutation(userId);
  const assignRoleMutation = useAssignUserRoleMutation(userId);
  const removeRoleMutation = useRemoveUserRoleMutation(userId);
  const reinitializePasswordMutation = useReinitializeUserPasswordMutation(userId);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [status, setStatus] = useState<number>(0);
  const [initialFirstName, setInitialFirstName] = useState('');
  const [initialLastName, setInitialLastName] = useState('');
  const [initialPhone, setInitialPhone] = useState('');
  const [initialAddress, setInitialAddress] = useState('');
  const [initialStatus, setInitialStatus] = useState<number>(0);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [initialSelectedRoles, setInitialSelectedRoles] = useState<string[]>([]);
  const [isNavigationLocked, setIsNavigationLocked] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSnackbarOpen, setIsSnackbarOpen] = useState(false);
  const allowProgrammaticNavigationRef = useRef(false);

  const { UserStatus, UserStatusLabels, SellerTypeLabels } = useGlobalEnums();

  // Determine sellerId from the loaded user or the authenticated session (if present)
  const explicitSellerId = (user as any)?.sellerId ?? authUser?.sellerId ?? '';
  const [resolvedSellerId, setResolvedSellerId] = useState<string>('');

  // Fetch all sellers only when we need to attempt resolution
  const allSellersQuery = useAllSellersQuery({ name: '', afm: '', sellerType: '' });

  // Try to resolve seller id from the list if no explicit sellerId is available
  useEffect(() => {
    if (explicitSellerId) {
      setResolvedSellerId(String(explicitSellerId));
      return;
    }

    const current = user ?? authUser ?? null;
    if (!current) return;

    const sellersResp = allSellersQuery.data;
    if (!sellersResp || !Array.isArray(sellersResp.items)) return;

    const allSellers = sellersResp.items;

    const matchByUserId = allSellers.find((s: any) => s.userId != null && String(s.userId) === String((current as any).userId ?? (current as any).id ?? ''));
    const matchByAfm = allSellers.find((s: any) => s.afm && (current as any)?.afm && String(s.afm) === String((current as any).afm));
    const authName = ((current as any)?.name ?? `${(current as any)?.firstName ?? ''} ${(current as any)?.lastName ?? ''}`).trim();
    const matchByName = allSellers.find((s: any) => {
      const sName = `${s.firstName ?? ''} ${s.lastName ?? ''}`.trim();
      return sName && authName && sName === authName;
    });

    const matchedSeller = matchByUserId || matchByAfm || matchByName || null;
    if (matchedSeller && matchedSeller.id) {
      setResolvedSellerId(String(matchedSeller.id));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [explicitSellerId, user, authUser, allSellersQuery.data]);

  const sellerId = String(resolvedSellerId || (user as any)?.sellerId || authUser?.sellerId || '');
  const { data: seller, isLoading: isSellerLoading } = useSellerQuery(sellerId);

  useEffect(() => {
    if (!user) return;
    const nextFirstName = user.firstName ?? '';
    const nextLastName = user.lastName ?? '';
    const nextStatus = typeof user.status === 'number' ? Number(user.status) : 0;
    const nextRoles = user.roles ?? [];
    const nextPhone = seller?.phone ?? '';
    const nextAddress = seller?.address ?? '';
    setFirstName(nextFirstName);
    setLastName(nextLastName);
    setPhone(nextPhone);
    setAddress(nextAddress);
    setStatus(nextStatus);
    setSelectedRoles(nextRoles);
    setInitialFirstName(nextFirstName);
    setInitialLastName(nextLastName);
    setInitialPhone(nextPhone);
    setInitialAddress(nextAddress);
    setInitialStatus(nextStatus);
    setInitialSelectedRoles(nextRoles);
    setIsNavigationLocked(false);
    allowProgrammaticNavigationRef.current = false;
    setErrors({});
  }, [user, seller]);

  const isSavingUser = updateUserMutation.isPending;
  const isUpdatingRole = assignRoleMutation.isPending || removeRoleMutation.isPending;
  const isReinitializingPassword = reinitializePasswordMutation.isPending;
  const rolesToAdd = selectedRoles.filter((role) => !initialSelectedRoles.includes(role));
  const rolesToRemove = initialSelectedRoles.filter((role) => !selectedRoles.includes(role));
  const hasRoleChanges = useMemo(() => {
    if (selectedRoles.length !== initialSelectedRoles.length) return true;
    const selectedRolesSet = new Set(selectedRoles);
    return initialSelectedRoles.some((role) => !selectedRolesSet.has(role));
  }, [initialSelectedRoles, selectedRoles]);

  const hasUserChanges =
    firstName !== initialFirstName ||
    lastName !== initialLastName ||
    phone !== initialPhone ||
    address !== initialAddress ||
    status !== initialStatus;
  const hasPendingChanges = hasUserChanges || hasRoleChanges;
  const currentRoleKey = selectedRoles[0] ?? initialSelectedRoles[0] ?? '';
  const currentRoleTitle = currentRoleKey
    ? USER_ROLE_MAPPING_TITLES[currentRoleKey as keyof typeof USER_ROLE_MAPPING_TITLES] ?? currentRoleKey
    : '—';

  const showNotification = (message: string, severity: 'success' | 'warning' | 'error' = 'warning') => {
    setErrors({ form: message });
  };

  useEffect(() => {
    if (hasPendingChanges) {
      setIsNavigationLocked(true);
    }
  }, [hasPendingChanges]);

  useBlocker({
    shouldBlockFn: () => {
      if (allowProgrammaticNavigationRef.current) return false;
      if (!isNavigationLocked) return false;
      showNotification('Έχετε μη αποθηκευμένες αλλαγές. Αποθηκεύστε ή ακυρώστε για να συνεχίσετε.', 'warning');
      return true;
    },
    enableBeforeUnload: isNavigationLocked,
  });

  async function handleSave() {
    if (!hasPendingChanges) return;

    setErrors({});

    try {
      const sellerUpdateId = String((user as any)?.sellerId ?? authUser?.sellerId ?? seller?.id ?? resolvedSellerId ?? '');

      await updateUserMutation.mutateAsync({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        status,
      });

      if (sellerUpdateId) {
        await updateSeller(sellerUpdateId, {
          seller: {
            phone: phone.trim(),
            address: address.trim(),
          },
          license: {
            fromDate: seller?.currentLicense?.fromDate ?? '',
            sellerType: Number(seller?.sellerType ?? seller?.currentLicense?.sellerType ?? 0),
            isSeasonal: Boolean(seller?.currentLicense?.isSeasonal),
            seasonalFromDate: seller?.currentLicense?.seasonalFromDate ?? '',
            seasonalToDate: seller?.currentLicense?.seasonalToDate ?? '',
            licenseCategory: Number(seller?.currentLicense?.licenseCategory ?? 0),
            licenseStatus: Number(seller?.currentLicense?.licenseStatus ?? 0),
            licenseNumber: seller?.currentLicense?.licenseNumber ?? '',
            licenseExpiry: seller?.currentLicense?.licenseExpiry ?? seller?.currentLicense?.toDate ?? '',
            notes: seller?.currentLicense?.notes ?? '',
          },
        });
      }

      setInitialFirstName(firstName);
      setInitialLastName(lastName);
      setInitialPhone(phone);
      setInitialAddress(address);
      setInitialStatus(status);
      setInitialSelectedRoles(selectedRoles);
      setIsNavigationLocked(false);
      setAuthNotification({
        type: 'success',
        message: 'Οι αλλαγές αποθηκεύτηκαν.',
      });
      allowProgrammaticNavigationRef.current = true;
      navigate({ to: '/admin/users' });
    } catch (mutationError) {
      showNotification(mutationError instanceof Error ? mutationError.message : 'Η αποθήκευση απέτυχε.', 'error');
    }
  }

  function handleCancel() {
    setFirstName(initialFirstName);
    setLastName(initialLastName);
    setPhone(initialPhone);
    setAddress(initialAddress);
    setStatus(initialStatus);
    setSelectedRoles(initialSelectedRoles);
    setErrors({});
    setIsNavigationLocked(false);
    allowProgrammaticNavigationRef.current = true;
    navigate({ to: '/admin/users' });
  }

  function handleRoleToggle(role: string) {
    setErrors({});
    setSelectedRoles((current) =>
      current.includes(role) ? [] : [role]
    );
  }

  const handleBackToList = () => {
    if (isNavigationLocked) {
      showNotification('Έχετε μη αποθηκευμένες αλλαγές. Αποθηκεύστε ή ακυρώστε για να συνεχίσετε.', 'warning');
      return;
    }

    navigate({ to: "/admin/users" });
  };

  const handleReinitializePassword = async () => {
    setErrors({});

    try {
      await reinitializePasswordMutation.mutateAsync();
      setAuthNotification({
        type: 'success',
        message: 'Ο κωδικός του χρήστη επαναρχικοποιήθηκε επιτυχώς.',
      });
    } catch (mutationError) {
      showNotification(
        mutationError instanceof Error
          ? mutationError.message
          : 'Η επαναρχικοποίηση κωδικού απέτυχε.',
        'error'
      );
    }
  };

  const handleSnackbarClose = (_event?: Event | SyntheticEvent, reason?: string) => {
    if (reason === 'clickaway') return;
    setIsSnackbarOpen(false);
  };

  if (!userId) {
    return (
      <div className="min-h-screen p-6 md:px-10 bg-transparent">
        <div className="mx-auto max-w-2xl">
          <div className="rounded-lg border border-(--color-border) bg-(--color-surface) p-6">
            <h1 className="text-2xl font-semibold text-(--color-text-heading) mb-2">Στοιχεία χρήστη</h1>
            <p className="text-sm text-(--color-text-muted)">Δεν βρέθηκε έγκυρο αναγνωριστικό χρήστη.</p>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading || isSellerLoading) {
    return (
      <div className="min-h-screen p-6 md:px-10 bg-transparent">
        <div className="mx-auto max-w-2xl">
          <div className="rounded-lg border border-(--color-border) bg-(--color-surface) p-6">
            <h1 className="text-2xl font-semibold text-(--color-text-heading) mb-2">Στοιχεία χρήστη</h1>
            <p className="text-sm text-(--color-text-muted)">Φόρτωση στοιχείων χρήστη...</p>
          </div>
        </div>
      </div>
    );
  }

  // If we're in user mode, show seller details instead of the editable user form
  if (isUserMode) {
    if (isSellerLoading) {
      return (
        <div className="min-h-screen p-6 md:px-10 bg-transparent">
          <div className="mx-auto max-w-2xl">
            <div className="rounded-lg border border-(--color-border) bg-(--color-surface) p-6">
              <h1 className="text-2xl font-semibold text-(--color-text-heading) mb-2">Στοιχεία Πωλητή</h1>
              <p className="text-sm text-(--color-text-muted)">Φόρτωση στοιχείων πωλητή...</p>
            </div>
          </div>
        </div>
      );
    }

    if (!seller) {
      return (
        <div className="min-h-screen p-6 md:px-10 bg-transparent">
          <div className="mx-auto max-w-2xl">
            <div className="rounded-lg border border-(--color-danger-border) bg-danger-subtle p-6">
              <h1 className="text-2xl font-semibold text-(--color-text-heading) mb-2">Στοιχεία Πωλητή</h1>
              <p className="text-sm text-(--color-danger)">Δεν βρέθηκαν στοιχεία πωλητή.</p>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen p-4 md:px-8 bg-transparent">
        <div className="mx-auto max-w-5xl ">
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-(--color-text-heading) mb-2">Στοιχεία Πωλητή</h2>
            <p className="text-sm text-(--color-text-muted)">Προβολή στοιχείων πωλητή</p>
          </div>

          <div style={{maxHeight: '70vh', overflowY: 'auto'}}>
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-3 mt-2">
                <div className="flex flex-col gap-1">
                  <CustomInputField type="TEXT" label="Όνομα" value={seller.firstName ?? ''} width="100%" />
                </div>
                <div className="flex flex-col gap-1">
                  <CustomInputField type="TEXT" label="Επώνυμο" value={seller.lastName ?? ''} width="100%" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <CustomInputField type="TEXT" label="Τύπος Πωλητή" value={SellerTypeLabels[Number(seller?.sellerType ?? '')] ?? String(seller?.sellerType ?? '')} disabled width="100%" />
                </div>
                <div className="flex flex-col gap-1">
                  <CustomInputField type="TEXT" label="ΑΦΜ" value={seller?.afm ?? ''} disabled width="100%" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <CustomInputField type="TEXT" label="Email" value={seller?.email ?? ''} disabled width="100%" />
                </div>
                <div className="flex flex-col gap-1">
                  <CustomInputField type="TEXT" label="Τηλέφωνο" value={seller?.phone ?? ''} disabled width="100%" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <CustomInputField type="TEXT" label="Διεύθυνση" value={seller?.address ?? ''} disabled width="100%" />
                </div>
                <div className="flex flex-col gap-1">
                  <CustomInputField type="TEXT" label="Ρόλος χρήστη" value={currentRoleTitle} disabled width="100%" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isError || !user) {
    return (
      <div className="min-h-screen p-6 md:px-10 bg-transparent">
        <div className="mx-auto max-w-2xl">
          <div className="rounded-lg border border-(--color-danger-border) bg-danger-subtle p-6">
            <h1 className="text-2xl font-semibold text-(--color-text-heading) mb-2">Στοιχεία χρήστη</h1>
            <p className="text-sm text-(--color-danger)">{error?.message ?? 'Η φόρτωση των στοιχείων χρήστη απέτυχε.'}</p>
            {/* Show HTTP status and details when available to aid debugging */}
            { (error as any)?.status && (
              <p className="text-xs text-(--color-danger) mt-2">HTTP {(error as any).status}</p>
            ) }
            { (error as any)?.body && typeof (error as any).body === 'object' && (
              <pre className="text-xs text-(--color-danger) mt-2 whitespace-pre-wrap">{JSON.stringify((error as any).body, null, 2)}</pre>
            ) }
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:px-6 bg-transparent ove">
      <div className="mx-auto max-w-5xl" >
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-(--color-text-heading) mb-2">Στοιχεία χρήστη</h2>
          <p className="text-sm text-(--color-text-muted)">Επεξεργασία στοιχείων χρήστη</p>
        </div>

        <div style={{maxHeight: '70vh', overflowY: 'auto', overflowX: 'hidden'}}>
          <form className="flex flex-col gap-4" onSubmit={(e) => { e.preventDefault(); handleSave(); }} noValidate>
            {errors.form && (
              <div
                className="bg-danger-subtle border border-(--color-danger-border) text-danger rounded-lg px-4 py-3 text-sm"
                role="alert"
              >
                {errors.form}
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 mt-2">
              {/* Top rows: user + seller fields laid out in two columns to match design */}
              <div className="flex flex-col gap-1">
                <CustomInputField
                  type="TEXT"
                  label="Όνομα"
                  value={firstName}
                  placeholder="Όνομα"
                  onChange={(v) => setFirstName(String(v ?? ''))}
                  width="100%"
                />
              </div>

              <div className="flex flex-col gap-1">
                <CustomInputField
                  type="TEXT"
                  label="Επώνυμο"
                  value={lastName}
                  placeholder="Επώνυμο"
                  onChange={(v) => setLastName(String(v ?? ''))}
                  width="100%"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <CustomInputField type="TEXT" label="Τύπος Πωλητή" value={
                  SellerTypeLabels[
                    Number((seller?.sellerType !== undefined && seller?.sellerType !== '') ? seller?.sellerType : (seller?.currentLicense?.sellerType ?? ''))
                  ] ?? String((seller?.sellerType !== undefined && seller?.sellerType !== '') ? seller?.sellerType : (seller?.currentLicense?.sellerType ?? ''))
                } width="100%" />
              </div>

              <div className="flex flex-col gap-1">
                <CustomInputField type="TEXT" label="ΑΦΜ" value={seller?.afm ?? ''} width="100%" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <CustomInputField type="TEXT" label="Email" value={seller?.email ?? user.email ?? ''} width="100%" />
              </div>

              <div className="flex flex-col gap-1">
                <CustomInputField
                  type="TEXT"
                  label="Τηλέφωνο"
                  value={phone}
                  placeholder="Τηλέφωνο"
                  onChange={(v) => setPhone(String(v ?? ''))}
                  width="100%"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <CustomInputField
                  type="TEXT"
                  label="Διεύθυνση"
                  value={address}
                  placeholder="Διεύθυνση"
                  onChange={(v) => setAddress(String(v ?? ''))}
                  width="100%"
                />
              </div>

              <div className="flex flex-col gap-1">
                <CustomInputField
                  type="DROPDOWN"
                  label="Ρόλος χρήστη"
                  value={selectedRoles[0] || ''}
                  dropdownItems={ROLE_KEYS.map((roleKey, index) => ({ value: roleKey, label: ROLE_OPTIONS[index] }))}
                  onChange={(v) => handleRoleToggle(String(v ?? ''))}
                  width="100%"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <CustomInputField
                  type="DROPDOWN"
                  label="Κατάσταση χρήστη"
                  value={String(status)}
                  dropdownItems={Object.keys(UserStatus || {})
                    .filter((k) => isNaN(Number(k)))
                    .map((name) => {
                      const val = (UserStatus as any)[name] as number;
                      return { value: String(val), label: UserStatusLabels?.[val] ?? name };
                    })}
                  onChange={(v) => setStatus(Number(v ?? 0))}
                  width="100%"
                />
              </div>

              <div className="flex flex-col gap-1">
                {/* Empty placeholder column for visual balance */}
              </div>
            </div>

            {/* License block */}
            <div className="mt-6">
              <h3 className="text-xl font-semibold text-(--color-text-heading) mb-3">
                Άδεια
                <div className="flex items-center gap-2 mt-3">
                  <input type="checkbox" checked={!!seller?.currentLicense?.isSeasonal} />
                  <label className="text-sm">Περιορισμένης διάρκειας</label>
                </div>
              </h3>

              <div className="grid grid-cols-3 gap-3 items-end">
                <CustomInputField type="TEXT" label="Αριθμός" value={seller?.currentLicense?.licenseNumber ?? ''} width="100%" />
                <CustomInputField type="DATE" label="Από" value={seller?.currentLicense?.fromDate ?? ''} width="100%" />
                <CustomInputField type="DATE" label="Έως" value={seller?.currentLicense?.toDate ?? seller?.currentLicense?.licenseExpiry ?? ''} width="100%" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <CustomInputField
                  type="DROPDOWN"
                  label="Ρόλος"
                  value={selectedRoles[0] || ''}
                  dropdownItems={ROLE_KEYS.map((roleKey, index) => ({ value: roleKey, label: ROLE_OPTIONS[index] }))}
                  onChange={(v) => handleRoleToggle(String(v ?? ''))}
                  width="100%"
                />
              </div>

              <div className="flex flex-col gap-1">
                <CustomInputField
                  type="TEXT"
                  label="Κατάσταση"
                  value={UserStatusLabels?.[status] ?? String(status)}
                  width="100%"
                  disabled
                />
              </div>
            </div>

            
             <div className="flex gap-3 mb-4 w-full justify-end">
              <button
                type="submit"
                disabled={isSavingUser || isUpdatingRole || isReinitializingPassword}
                className="w-50 py-3 px-4 text-[15px] font-semibold rounded-lg bg-(--color-text) text-white transition hover:brightness-90 active:brightness-75 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
              >
                {isSavingUser || isUpdatingRole ? 'Αποθήκευση...' : 'Αποθήκευση'}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                disabled={isSavingUser}
                className="w-50 py-3 px-4 text-[15px] font-semibold rounded-lg bg-transparent border border-(--color-text-muted) text-(--color-text-heading) transition hover:bg-(--color-bg-hover) disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
              >
                Ακύρωση
              </button>
            </div>
          </form>
        </div>
        
      </div>
    </div>
  );
}