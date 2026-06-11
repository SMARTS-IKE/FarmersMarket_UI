import { useEffect, useMemo, useState, type SyntheticEvent } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Alert, Snackbar } from '@mui/material';
import CustomButton from '../../../shared/components/CustomButton';
import CustomInputField from '../../../shared/components/CustomInputField';
import { setAuthNotification } from '../../../lib/authNotifications';
import { useRegisterMutation } from '../../../queries/authQueries';
import { USER_ROLE_MAPPING, USER_ROLE_MAPPING_TITLES } from '../../../shared/mappings/users.mapping';
import { SELLER_TYPE_LABELS } from '../../../components/sellers/sellers.utils';

const ROLE_OPTIONS = USER_ROLE_MAPPING_TITLES ? Object.values(USER_ROLE_MAPPING_TITLES) : [];
const ROLE_KEYS = USER_ROLE_MAPPING_TITLES ? Object.keys(USER_ROLE_MAPPING_TITLES) : [];
const INITIAL_PASSWORD = 'Aa111111!';
const DEFAULT_ROLE = USER_ROLE_MAPPING.USER;

export default function UserCreation() {
  const navigate = useNavigate();
  const registerMutation = useRegisterMutation();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [afm, setAfm] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [sellerType, setSellerType] = useState<number>(0);
  const [password] = useState(INITIAL_PASSWORD);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([DEFAULT_ROLE]);
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [isNavigationLocked, setIsNavigationLocked] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [notificationSeverity, setNotificationSeverity] = useState<'success' | 'warning' | 'error'>('warning');
  const [isSnackbarOpen, setIsSnackbarOpen] = useState(false);

  const hasPendingChanges = useMemo(
    () =>
      firstName.trim().length > 0 ||
      lastName.trim().length > 0 ||
      email.trim().length > 0 ||
      afm.trim().length > 0 ||
      phone.trim().length > 0 ||
      address.trim().length > 0 ||
      sellerType !== 0 ||
      selectedRoles.length !== 1 ||
      selectedRoles[0] !== DEFAULT_ROLE,
    [email, firstName, lastName, afm, phone, address, sellerType, selectedRoles]
  );

  const firstNameTrimmed = firstName.trim();
  const lastNameTrimmed = lastName.trim();
  const emailTrimmed = email.trim();
  const afmTrimmed = afm.trim();
  const phoneTrimmed = phone.trim();
  const addressTrimmed = address.trim();

  const emailError = submitAttempted && !emailTrimmed ? 'Το πεδίο είναι υποχρεωτικό.' : '';
  const firstNameError = submitAttempted
    ? !firstNameTrimmed
      ? 'Το πεδίο είναι υποχρεωτικό.'
      : firstNameTrimmed.length < 2
        ? 'Ελάχιστος αριθμός χαρακτήρων: 2.'
        : ''
    : '';
  const lastNameError = submitAttempted
    ? !lastNameTrimmed
      ? 'Το πεδίο είναι υποχρεωτικό.'
      : lastNameTrimmed.length < 2
        ? 'Ελάχιστος αριθμός χαρακτήρων: 2.'
        : ''
    : '';
  const afmError = submitAttempted && !afmTrimmed ? 'Το πεδίο είναι υποχρεωτικό.' : '';
  const phoneError = submitAttempted && !phoneTrimmed ? 'Το πεδίο είναι υποχρεωτικό.' : '';
  const addressError = submitAttempted && !addressTrimmed ? 'Το πεδίο είναι υποχρεωτικό.' : '';
  const roleError = submitAttempted && selectedRoles.length === 0 ? 'Το πεδίο είναι υποχρεωτικό.' : '';

  useEffect(() => {
    setIsNavigationLocked(hasPendingChanges);
  }, [hasPendingChanges]);

  const showNotification = (message: string, severity: 'success' | 'warning' | 'error' = 'warning') => {
    setNotificationMessage(message);
    setNotificationSeverity(severity);
    setIsSnackbarOpen(true);
  };

  function handleRoleToggle(role: string) {
    setNotificationMessage('');
    setIsSnackbarOpen(false);

    setSelectedRoles((current) =>
      current.includes(role)
        ? []
        : [role]
    );
  }

  const handleBackToList = () => {
    if (isNavigationLocked) {
      showNotification('Έχετε μη αποθηκευμένες αλλαγές. Αποθηκεύστε ή ακυρώστε για να συνεχίσετε.', 'warning');
      return;
    }

    navigate({ to: '/admin/users' });
  };

  const handleCancel = () => {
    setFirstName('');
    setLastName('');
    setEmail('');
    setAfm('');
    setPhone('');
    setAddress('');
    setSellerType(0);
    setSelectedRoles([DEFAULT_ROLE]);
    setSubmitAttempted(false);
    setNotificationMessage('');
    setIsSnackbarOpen(false);
    setIsNavigationLocked(false);
  };

  async function handleCreate() {
    setSubmitAttempted(true);

    if (!firstNameTrimmed || firstNameTrimmed.length < 2 || !lastNameTrimmed || lastNameTrimmed.length < 2 || !emailTrimmed || !password || !afmTrimmed || !phoneTrimmed || !addressTrimmed) {
      showNotification('Συμπληρώστε όλα τα υποχρεωτικά πεδία.', 'warning');
      return;
    }

    if (selectedRoles.length === 0) {
      showNotification('Επιλέξτε τουλάχιστον έναν ρόλο.', 'warning');
      return;
    }

    try {
      const [primaryRole] = selectedRoles;
      await registerMutation.mutateAsync({
        firstName: firstNameTrimmed,
        lastName: lastNameTrimmed,
        email: emailTrimmed,
        afm: afmTrimmed,
        phone: phoneTrimmed,
        address: addressTrimmed,
        sellerType,
        password,
        role: primaryRole,
      });

      setAuthNotification({
        type: 'success',
        message: 'Ο χρήστης δημιουργήθηκε επιτυχώς.',
      });
      setIsNavigationLocked(false);
      navigate({ to: '/admin/users' });
    } catch (mutationError) {
      showNotification(mutationError instanceof Error ? mutationError.message : 'Η δημιουργία χρήστη απέτυχε.', 'error');
    }
  }

  const handleSnackbarClose = (_event?: Event | SyntheticEvent, reason?: string) => {
    if (reason === 'clickaway') return;
    setIsSnackbarOpen(false);
  };

  return (
    <div className="min-h-full p-6 text-left text-(--color-text-heading) md:px-10">
      <div className="mx-auto flex max-w-6xl flex-col gap-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-semibold text-(--color-text-heading)">Δημιουργία Χρήστη</h2>
          <div className="flex flex-wrap items-center gap-3">
            <CustomButton
              title="Επιστροφή στη λίστα χρηστών"
              backgroundColor="var(--color-text-muted)"
              width="fit-content"
              onClick={handleBackToList}
            />
          </div>
        </div>

        <section className="grid w-full content-start gap-4">
          <div className="grid w-full gap-8 mb-2 md:grid-cols-2">
            <CustomInputField
              type="TEXT"
              label="Ηλεκτρονικό ταχυδρομείο *"
              value={email}
              onChange={(value) => setEmail(String(value))}
              width="100%"
              error={emailError}
            />
            <CustomInputField
              type="TEXT"
              label="Αρχικός κωδικός *"
              value={password}
              disabled
              width="100%"
            />
            <CustomInputField
              type="TEXT"
              label="Όνομα *"
              value={firstName}
              onChange={(value) => setFirstName(String(value))}
              width="100%"
              error={firstNameError}
            />
            <CustomInputField
              type="TEXT"
              label="Επώνυμο *"
              value={lastName}
              onChange={(value) => setLastName(String(value))}
              width="100%"
              error={lastNameError}
            />
            <CustomInputField
              type="TEXT"
              label="ΑΦΜ *"
              value={afm}
              onChange={(value) => setAfm(String(value))}
              width="100%"
              error={afmError}
            />
            <CustomInputField
              type="TEXT"
              label="Τηλέφωνο *"
              value={phone}
              onChange={(value) => setPhone(String(value))}
              width="100%"
              error={phoneError}
            />
            <CustomInputField
              type="TEXT"
              label="Διεύθυνση *"
              value={address}
              onChange={(value) => setAddress(String(value))}
              width="100%"
              error={addressError}
            />
            <CustomInputField
              type="DROPDOWN"
              label="Τύπος Πωλητή"
              value={sellerType}
              onChange={(value) => setSellerType(Number(value))}
              width="100%"
              dropdownItems={Object.entries(SELLER_TYPE_LABELS).map(([value, label]) => ({
                label,
                value: Number(value),
              }))}
            />
          </div>

          <div className="grid justify-items-start">
            <div className="grid content-start gap-4 w-full max-w-sm">
              <div className="w-full text-left text-sm font-medium text-(--color-text-heading)">Ρόλος *</div>
              <div className="grid grid-cols-2 gap-4">
                {[
                  ...ROLE_KEYS.map((role, index) => ({ label: role, active: selectedRoles.includes(role), index })),
                ].map((role) => (
                  <CustomButton
                    key={role.label}
                    title={ROLE_OPTIONS[role.index] || ''}
                    width="100%"
                    onClick={() => handleRoleToggle(role.label)}
                    disabled={registerMutation.isPending}
                    backgroundColor={role.active ? 'var(--color-dark)' : 'rgba(255,255,255,0.85)'}
                    sx={{
                      minHeight: 44,
                      height: '100%',
                      borderRadius: '0.75rem',
                      border: role.active ? '1px solid transparent' : '1px solid var(--color-text-muted)',
                      color: role.active ? '#ffffff' : 'var(--color-text)',
                      boxShadow: '0 1px 2px rgba(60,40,10,0.08)',
                      fontSize: '0.875rem',
                      lineHeight: 1.2,
                      whiteSpace: 'normal',
                      paddingInline: '0.75rem',
                      '&:hover': {
                        backgroundColor: role.active ? 'var(--color-text)' : 'rgba(255,255,255,0.85)',
                        filter: 'none',
                      },
                    }}
                  />
                ))}
              </div>
              {roleError && (
                <div className="text-xs text-(--color-danger)">{roleError}</div>
              )}
            </div>
          </div>
        </section>

        <div className="flex flex-wrap justify-end gap-3">
        
            <CustomButton
              title="Ακύρωση"
              backgroundColor="transparent"
              onClick={handleCancel}
              disabled={registerMutation.isPending}
              width={120}
              sx={{
                color: 'var(--color-dark)',
                border: '1px solid var(--color-text-muted)',
                '&:hover': {
                  backgroundColor: 'transparent',
                  borderColor: 'var(--color-text-muted)',
                  filter: 'none',
                },
              }}
            />
         

          <CustomButton
            title={registerMutation.isPending ? 'Αποθήκευση...' : 'Αποθήκευση'}
            onClick={handleCreate}
            disabled={registerMutation.isPending}
            width={140}
          />
        </div>
      </div>

      <Snackbar
        open={isSnackbarOpen && Boolean(notificationMessage)}
        autoHideDuration={4500}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleSnackbarClose} severity={notificationSeverity} variant="filled" sx={{ width: '100%' }}>
          {notificationMessage}
        </Alert>
      </Snackbar>
    </div>
  );
}