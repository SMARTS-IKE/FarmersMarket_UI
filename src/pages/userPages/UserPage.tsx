import { useEffect, useMemo, useRef, useState, type SyntheticEvent } from 'react';
import { Box, Snackbar, Alert } from '@mui/material';
import { useAuthStore } from '../../store/authStore';
import { useBlocker, useNavigate, useParams } from '@tanstack/react-router';
import { setAuthNotification } from '../../lib/authNotifications';
import {
  useAssignUserRoleMutation,
  useReinitializeUserPasswordMutation,
  useRemoveUserRoleMutation,
  useUpdateUserMutation,
  useUserQuery,
} from '../../queries/userQueries';
import { useGlobalEnums } from '../../shared/mappings/GlobalEnums';
import { useAllSellersQuery } from '../../queries/sellerQueries';
import { SELLER_TYPE_LABELS } from '../../components/sellers/sellers.utils';
import CustomInputField from '../../shared/components/CustomInputField';
import CustomButton from '../../shared/components/CustomButton';
import { USER_ROLE_MAPPING_TITLES, USER_ROLE_MAPPING } from '../../shared/mappings/users.mapping';
import { updateSeller } from '../../services/sellerService';

const ROLE_OPTIONS = USER_ROLE_MAPPING_TITLES ? Object.values(USER_ROLE_MAPPING_TITLES) : [];
const ROLE_KEYS = USER_ROLE_MAPPING_TITLES ? Object.keys(USER_ROLE_MAPPING_TITLES) : [];

export default function UserPage() {
  const navigate = useNavigate();
  const params = useParams({ strict: false });
  const connectedRole = useAuthStore((s) => s.role);
  const connectedIsUserRole = ((connectedRole ?? '').trim().toLowerCase() === (USER_ROLE_MAPPING.USER ?? '').trim().toLowerCase());
  const { UserStatus, UserStatusLabels } = useGlobalEnums();
  const connectedUser = useAuthStore((s) => s.user);
  const paramId = typeof params.id === 'string' ? params.id : '';
  const effectiveUserId = paramId || (connectedUser?.id ? String(connectedUser.id) : '');

  const { data: user, isLoading, isError, error } = useUserQuery(effectiveUserId);
  const { data: sellersResp } = useAllSellersQuery({ name: '', afm: '', sellerType: '', isActive: undefined, pageSize: 1000 });

  const [matchedSeller, setMatchedSeller] = useState<any | null>(null);

  const updateUserMutation = useUpdateUserMutation(effectiveUserId);
  const assignRoleMutation = useAssignUserRoleMutation(effectiveUserId);
  const removeRoleMutation = useRemoveUserRoleMutation(effectiveUserId);
  const reinitializePasswordMutation = useReinitializeUserPasswordMutation(effectiveUserId);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [status, setStatus] = useState<number>(0);
  const [initialFirstName, setInitialFirstName] = useState('');
  const [initialLastName, setInitialLastName] = useState('');
  const [initialStatus, setInitialStatus] = useState<number>(0);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [initialSelectedRoles, setInitialSelectedRoles] = useState<string[]>([]);
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [initialPhone, setInitialPhone] = useState('');
  const [initialAddress, setInitialAddress] = useState('');
  const [isNavigationLocked, setIsNavigationLocked] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSnackbarOpen, setIsSnackbarOpen] = useState(false);
  const allowProgrammaticNavigationRef = useRef(false);
  const [navigationNotice, setNavigationNotice] = useState('');
  const [notificationSeverity, setNotificationSeverity] = useState<'success' | 'warning'>('warning');

  useEffect(() => {
    if (!user) return;
    const nextFirstName = user.firstName ?? '';
    const nextLastName = user.lastName ?? '';
    const nextStatus = typeof user.status === 'number' ? Number(user.status) : 0;
    const nextRoles = user.roles ?? [];
    setFirstName(nextFirstName);
    setLastName(nextLastName);
    setStatus(nextStatus);
    setSelectedRoles(nextRoles);
    setInitialFirstName(nextFirstName);
    setInitialLastName(nextLastName);
    setInitialStatus(nextStatus);
    setInitialSelectedRoles(nextRoles);
    setIsNavigationLocked(false);
    allowProgrammaticNavigationRef.current = false;
    setErrors({});
  }, [user]);

  useEffect(() => {
    if (!sellersResp || !user) {
      setMatchedSeller(null);
      return;
    }

    const all = sellersResp.items ?? [];
    const authName = ((user as any)?.name ?? `${(user as any)?.firstName ?? ''} ${(user as any)?.lastName ?? ''}`).trim();

    const found = all.find((s: any) => {
      if (s.userId && String(s.userId) === String(user.id)) return true;
      if (user.afm && s.afm && String(s.afm) === String(user.afm)) return true;
      const sName = `${s.firstName ?? ''} ${s.lastName ?? ''}`.trim();
      if (sName && authName && sName === authName) return true;
      return false;
    }) ?? null;

    setMatchedSeller(found);
  }, [sellersResp, user]);

  useEffect(() => {
    if (!matchedSeller) {
      setPhone('');
      setAddress('');
      setInitialPhone('');
      setInitialAddress('');
      return;
    }

    setPhone((matchedSeller as any)?.phone ?? '');
    setAddress((matchedSeller as any)?.address ?? '');
    setInitialPhone((matchedSeller as any)?.phone ?? '');
    setInitialAddress((matchedSeller as any)?.address ?? '');
  }, [matchedSeller]);

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
    status !== initialStatus ||
    phone !== initialPhone ||
    address !== initialAddress;
  const hasPendingChanges = hasUserChanges || hasRoleChanges;

  const showNotification = (message: string, severity: 'success' | 'warning' | 'error' = 'warning') => {
    setErrors((prev) => ({ ...prev, form: message }));
    setNavigationNotice(message);
    setNotificationSeverity(severity === 'error' ? 'warning' : severity);
    setIsSnackbarOpen(true);
  };

  useEffect(() => {
    if (hasPendingChanges) setIsNavigationLocked(true);
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

  // Single merged view — no tab switching needed.

  async function handleSave() {
    if (!hasPendingChanges) return;
    setErrors({});

    // First: update user and role changes. If this fails, abort and notify.
    try {
      await updateUserMutation.mutateAsync({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        status,
      });

      await Promise.all([
        ...rolesToAdd.map((role) => assignRoleMutation.mutateAsync({ role })),
        ...rolesToRemove.map((role) => removeRoleMutation.mutateAsync(role)),
      ]);
    } catch (userErr) {
      showNotification('Κάποιο σφάλμα κατά την αποθήκευση των στοιχείων χρήστη. Προσπαθήστε ξανά αργότερα.', 'error');
      return;
    }

    // Second: if there's a matched seller, update seller phone/address. If this fails, notify and abort.
    if (matchedSeller && (matchedSeller as any).id) {
      try {
        const currentLicense = (matchedSeller as any).currentLicense ?? null;
        const licensePayload = currentLicense
          ? (currentLicense.isSeasonal
              ? {
                  fromDate: currentLicense.seasonalFromDate ?? currentLicense.fromDate ?? null,
                  sellerType: Number(currentLicense.sellerType) || 0,
                  isSeasonal: true,
                  seasonalFromDate: currentLicense.seasonalFromDate ?? null,
                  seasonalToDate: currentLicense.seasonalToDate ?? null,
                  licenseCategory: currentLicense.licenseCategory ?? 0,
                  licenseStatus: currentLicense.licenseStatus ?? 1,
                  licenseNumber: currentLicense.licenseNumber ?? '',
                  licenseExpiry: currentLicense.licenseExpiry ?? null,
                  notes: currentLicense.notes ?? null,
                }
              : {
                  fromDate: currentLicense.fromDate ?? null,
                  sellerType: Number(currentLicense.sellerType) || 0,
                  isSeasonal: false,
                  seasonalFromDate: null,
                  seasonalToDate: null,
                  licenseCategory: currentLicense.licenseCategory ?? 0,
                  licenseStatus: currentLicense.licenseStatus ?? 1,
                  licenseNumber: currentLicense.licenseNumber ?? '',
                  licenseExpiry: currentLicense.licenseExpiry ?? null,
                  notes: currentLicense.notes ?? null,
                })
          : {
              fromDate: null,
              sellerType: Number((matchedSeller as any).sellerType) || 0,
              isSeasonal: false,
              seasonalFromDate: null,
              seasonalToDate: null,
              licenseCategory: 0,
              licenseStatus: 1,
              licenseNumber: '',
              licenseExpiry: null,
              notes: null,
            };

        await updateSeller(String((matchedSeller as any).id), {
          seller: {
            phone: phone || null,
            address: address || null,
          },
          license: licensePayload,
        });
      } catch (sellerErr) {
        showNotification('Συνέβη κάποιο σφάλμα κατά την αποθήκευση των αλλαγών. Προσπαθήστε ξανά αργότερα.', 'error');
        return;
      }
    }

    // If we reached here, both updates (where applicable) succeeded
    setInitialFirstName(firstName);
    setInitialLastName(lastName);
    setInitialStatus(status);
    setInitialSelectedRoles(selectedRoles);
    setInitialPhone(phone);
    setInitialAddress(address);
    setIsNavigationLocked(false);
    setAuthNotification({ type: 'success', message: 'Οι αλλαγές αποθηκεύτηκαν.' });
    allowProgrammaticNavigationRef.current = true;
    const redirectTarget = connectedIsUserRole ? '/users' : '/admin/users';
    navigate({ to: redirectTarget });
  }

  function handleCancel() {
    setFirstName(initialFirstName);
    setLastName(initialLastName);
    setStatus(initialStatus);
    setSelectedRoles(initialSelectedRoles);
    setPhone(initialPhone);
    setAddress(initialAddress);
    setErrors({});
    setIsNavigationLocked(false);
    allowProgrammaticNavigationRef.current = true;
    const redirectTarget = connectedIsUserRole ? '/users' : '/admin/users';
    navigate({ to: redirectTarget });
  }

  function handleRoleToggle(role: string) {
    setErrors({});
    setSelectedRoles((current) => (current.includes(role) ? [] : [role]));
  }

  const handleSnackbarClose = (_event?: Event | SyntheticEvent, reason?: string) => {
    if (reason === 'clickaway') return;
    setIsSnackbarOpen(false);
  };

  if (!effectiveUserId) {
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

  if (isLoading) {
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

  if (isError || !user) {
    return (
      <div className="min-h-screen p-6 md:px-10 bg-transparent">
        <div className="mx-auto max-w-2xl">
          <div className="rounded-lg border border-(--color-danger-border) bg-danger-subtle p-6">
            <h1 className="text-2xl font-semibold text-(--color-text-heading) mb-2">Στοιχεία χρήστη</h1>
            <p className="text-sm text-(--color-danger)">{error?.message ?? 'Η φόρτωση των στοιχείων χρήστη απέτυχε.'}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full w-full flex-col gap-6 text-left overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-col gap-1">
          <h2 className="font-semibold text-(--color-text-heading)">Το Προφίλ μου</h2>
          <h3 className="text-lg text-(--color-text-heading)">{user ? (user.name ?? `${user.firstName ?? ''} ${user.lastName ?? ''}`) : ''}</h3>
        </div>
      </div>

      <Box className="w-full self-start">
        {/* Single merged view: user form followed by seller details */}
      </Box>

      <div className="flex-1 overflow-y-auto pr-2 max-h-[calc(100svh-300px)]">
        <div className="flex flex-col gap-6 pt-2">
          <div className="flex flex-col gap-4">
            {/* {errors.form && (
              <div className="bg-danger-subtle border border-(--color-danger-border) text-danger rounded-lg px-4 py-3 text-sm" role="alert">
                {errors.form}
              </div>
            )} */}

            <div className="grid grid-cols-2 gap-3">
              <CustomInputField 
                type="TEXT" 
                label="Όνομα"
                value={firstName}
                placeholder="Όνομα"
                onChange={(v) => setFirstName(String(v ?? ''))}
                width="100%" />
              <CustomInputField 
                type="TEXT" 
                label="Επώνυμο" 
                value={lastName} 
                placeholder="Επώνυμο" 
                onChange={(v) => setLastName(String(v ?? ''))} 
                width="100%" />

            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                 <CustomInputField
                  type="TEXT"
                  label="Τύπος Πωλητή"
                  value={SELLER_TYPE_LABELS?.[(matchedSeller as any)?.sellerType] ?? String((matchedSeller as any)?.sellerType ?? '')}
                  disabled
                  width="100%"
                />
              <CustomInputField 
                type="TEXT" 
                label="ΑΦΜ" 
                value={(matchedSeller as any)?.afm ?? ''} 
                disabled 
                width="100%" 
              />
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

              <CustomInputField 
                type="TEXT" 
                label="Email" 
                value={user.email || ''} 
                disabled 
                width="100%" 
              />

              <CustomInputField 
                type="TEXT" 
                label="Τηλέφωνο" 
                value={phone} 
                onChange={(v) => setPhone(String(v ?? ''))}
                width="100%" 
              />

            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

              <CustomInputField 
                type="TEXT" 
                label="Διεύθυνση" 
                value={address} 
                onChange={(v) => setAddress(String(v ?? ''))}
                width="100%" 
              />

              <CustomInputField
                type="TEXT"
                label="Ρόλος Χρήστη"
                value={selectedRoles[0] ? (USER_ROLE_MAPPING_TITLES?.[selectedRoles[0]] ?? selectedRoles[0]) : ''}
                onChange={(v) => {
                  const input = String(v ?? '');
                  // If user typed a known Greek label, map it back to the role key
                  const matchingKey = Object.keys(USER_ROLE_MAPPING_TITLES || {}).find((k) => USER_ROLE_MAPPING_TITLES[k] === input);
                  if (matchingKey) {
                    setSelectedRoles([matchingKey]);
                  } else {
                    setSelectedRoles(input ? [input] : []);
                  }
                }}
                disabled
                width="100%"
              />
            </div>

            

            <div className="grid grid-cols-2 gap-3">
              <CustomInputField
                type="TEXT"
                label="Κατάσταση"
                value={UserStatusLabels?.[Number(status)] ?? String(status)}
                disabled
                width="100%"
              />
            </div>

            {/* action buttons moved to bottom; shown only when there are unsaved changes */}
          </div>

          {matchedSeller && (
            <div className="flex flex-col gap-4 mt-2">
             
              <div>
                <h3 className="text-lg font-semibold text-(--color-text-heading)">Άδεια</h3>
                <div className="flex flex-row items-start gap-4 justify-center mt-2">
                  <CustomInputField type="TEXT" label="Αριθμός" value={matchedSeller.currentLicense?.licenseNumber ?? ''} disabled width="100%" />
                  <CustomInputField type="DATE" label="Από" value={matchedSeller.currentLicense?.fromDate ?? ''} disabled width="100%" />
                  <CustomInputField type="DATE" label="Έως" value={matchedSeller.currentLicense?.licenseExpiry ?? matchedSeller.currentLicense?.expiresAt ?? ''} disabled width="100%" />
                </div>
              </div>
            </div>
          )}
          {hasPendingChanges && (
            <div className="flex justify-end gap-4 mt-6">
                <CustomButton
                    title="Ακύρωση"
                    backgroundColor="transparent"
                    onClick={handleCancel}
                    width="fit-content"
                    disabled={isSavingUser}
                    sx={{
                      px: 3,
                      minHeight: 32,
                      color: "var(--color-dark)",
                      border: "1px solid var(--color-text-muted)",
                      "&:hover": {
                        backgroundColor: "transparent",
                        borderColor: "var(--color-text-muted)",
                        filter: "none",
                      },
                    }}
                  />
                  <CustomButton
                    title="Αποθήκευση"
                    onClick={handleSave}
                    width="fit-content"
                    sx={{ px: 4, minHeight: 32 }}
                    disabled={isSavingUser || isUpdatingRole || isReinitializingPassword}
                  />
            </div>
          )}
        </div>
      </div>

      <Snackbar open={isSnackbarOpen && Boolean(navigationNotice)} autoHideDuration={4500} onClose={handleSnackbarClose} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert onClose={handleSnackbarClose} severity={notificationSeverity} variant="filled" sx={{ width: '100%' }}>
          {navigationNotice}
        </Alert>
      </Snackbar>
    </div>
  );
}
