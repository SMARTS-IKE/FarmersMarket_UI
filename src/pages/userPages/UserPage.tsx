import { useEffect, useMemo, useRef, useState, type SyntheticEvent } from 'react';
import { useBlocker, useNavigate, useParams } from '@tanstack/react-router';
import { setAuthNotification } from '../../lib/authNotifications';
import {
  useAssignUserRoleMutation,
  useReinitializeUserPasswordMutation,
  useRemoveUserRoleMutation,
  useUpdateUserMutation,
  useUserQuery,
} from '../../queries/userQueries';
import { useGlobalEnums } from '../../shared/components/GlobalEnums';
import CustomInputField from '../../shared/components/CustomInputField';
import { USER_ROLE_MAPPING_TITLES } from '../../shared/mappings/users.mapping';

const inputClass =
  'w-full px-4 py-3 text-[15px] rounded-lg border border-(--color-border) bg-(--color-bg) text-(--color-text-heading) placeholder:text-(--color-text-muted) outline-none transition focus:border-(--color-primary) focus:ring-3 focus:ring-(--color-primary-subtle) disabled:opacity-50 disabled:cursor-not-allowed';

const ROLE_OPTIONS = USER_ROLE_MAPPING_TITLES ? Object.values(USER_ROLE_MAPPING_TITLES) : [];
const ROLE_KEYS = USER_ROLE_MAPPING_TITLES ? Object.keys(USER_ROLE_MAPPING_TITLES) : [];

export default function UserPage() {
  const navigate = useNavigate();
  const params = useParams({ strict: false });
  const userId = typeof params.id === 'string' ? params.id : '';
  const { data: user, isLoading, isError, error } = useUserQuery(userId);
  const updateUserMutation = useUpdateUserMutation(userId);
  const assignRoleMutation = useAssignUserRoleMutation(userId);
  const removeRoleMutation = useRemoveUserRoleMutation(userId);
  const reinitializePasswordMutation = useReinitializeUserPasswordMutation(userId);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [status, setStatus] = useState<number>(0);
  const [initialFirstName, setInitialFirstName] = useState('');
  const [initialLastName, setInitialLastName] = useState('');
  const [initialStatus, setInitialStatus] = useState<number>(0);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [initialSelectedRoles, setInitialSelectedRoles] = useState<string[]>([]);
  const [isNavigationLocked, setIsNavigationLocked] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSnackbarOpen, setIsSnackbarOpen] = useState(false);
  const allowProgrammaticNavigationRef = useRef(false);

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
      await updateUserMutation.mutateAsync({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        status,
      });

      await Promise.all([
        ...rolesToAdd.map((role) => assignRoleMutation.mutateAsync({ role })),
        ...rolesToRemove.map((role) => removeRoleMutation.mutateAsync(role)),
      ]);

      setInitialFirstName(firstName);
      setInitialLastName(lastName);
      setInitialStatus(status);
      setInitialSelectedRoles(selectedRoles);
      setIsNavigationLocked(false);
      setAuthNotification({
        type: 'success',
        message: 'Οι αλλαγές χρήστη και ρόλων αποθηκεύτηκαν.',
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
    <div className="min-h-screen p-6 md:px-10 bg-transparent">
      <div className="mx-auto max-w-2xl">
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-(--color-text-heading) mb-2">Στοιχεία χρήστη</h2>
          <p className="text-sm text-(--color-text-muted)">Επεξεργασία στοιχείων χρήστη</p>
        </div>

        <form className="flex flex-col gap-4" onSubmit={(e) => { e.preventDefault(); handleSave(); }} noValidate>
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

          <div className="flex flex-col gap-1">
            <CustomInputField
              type="TEXT"
              label="Ηλεκτρονικό ταχυδρομείο"
              value={user.email || ''}
              disabled
              width="100%"
            />
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
                type="DROPDOWN"
                label="Κατάσταση"
                value={String(status)}
                dropdownItems={(() => {
                  const { UserStatus, UserStatusLabels } = useGlobalEnums();
                  const keys = Object.keys(UserStatus) as string[];
                  return keys
                    .filter((k) => isNaN(Number(k)))
                    .map((name) => {
                      const val = (UserStatus as any)[name] as number;
                      return { value: String(val), label: UserStatusLabels?.[val] ?? name };
                    });
                })()}
                onChange={(v) => setStatus(Number(v ?? 0))}
                width="100%"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={isSavingUser || isUpdatingRole || isReinitializingPassword}
              className="w-full py-3 px-4 text-[15px] font-semibold rounded-lg bg-(--color-text) text-white transition hover:brightness-90 active:brightness-75 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
            >
              {isSavingUser || isUpdatingRole ? 'Αποθήκευση...' : 'Αποθήκευση'}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              disabled={isSavingUser}
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