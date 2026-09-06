import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import CustomButton from "../../../shared/components/CustomButton";
import CustomInputField from "../../../shared/components/CustomInputField";
import { SELLER_TYPE_LABELS } from "../../../components/sellers/sellers.utils";
import type { SellerType } from "../../../models/seller";
import { useGlobalEnums } from "../../../shared/mappings/GlobalEnums";

export default function AdminSellerEditPage() {
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [afm, setAfm] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [sellerType, setSellerType] = useState<SellerType | string>("1");
  const [licenseNumber, setLicenseNumber] = useState("");
  const [licenseIssuedAt, setLicenseIssuedAt] = useState("");
  const [licenseExpiresAt, setLicenseExpiresAt] = useState("");
  const [email, setEmail] = useState("");
  const [userRole, setUserRole] = useState<string | number>("");
  const [userStatus, setUserStatus] = useState<number | string>(0);
  const [submitAttempted, setSubmitAttempted] = useState(false);

  const firstNameTrimmed = firstName.trim();
  const lastNameTrimmed = lastName.trim();
  const afmTrimmed = afm.trim();
  const sellerTypeValue = String(sellerType ?? "");

  const { UserRoleLabels, UserStatusLabels } = useGlobalEnums();
  const greekUserRoleLabels: Record<string, string> = {
    '0': 'Χρήστης',
    '1': 'Διαχειριστής',
  };

  const firstNameError = submitAttempted
    ? !firstNameTrimmed
      ? "Το πεδίο είναι υποχρεωτικό."
      : firstNameTrimmed.length < 2
        ? "Ελάχιστος αριθμός χαρακτήρων: 2."
        : ""
    : "";

  const lastNameError = submitAttempted
    ? !lastNameTrimmed
      ? "Το πεδίο είναι υποχρεωτικό."
      : lastNameTrimmed.length < 2
        ? "Ελάχιστος αριθμός χαρακτήρων: 2."
        : ""
    : "";

  const sellerTypeError = submitAttempted && !sellerTypeValue
    ? "Το πεδίο είναι υποχρεωτικό."
    : "";

  const afmError = submitAttempted
    ? !afmTrimmed
      ? "Το πεδίο είναι υποχρεωτικό."
      : afmTrimmed.length < 9
        ? "Ελάχιστος αριθμός χαρακτήρων: 9."
        : ""
    : "";

    const licenseNumberError = submitAttempted
    ? !licenseNumber
      ? "Το πεδίο είναι υποχρεωτικό."
      : ""
    : "";

  const licenseIssuedAtError = submitAttempted
    ? !licenseIssuedAt
      ? "Το πεδίο είναι υποχρεωτικό."
      : ""
    : "";

  const licenseExpiresAtError = submitAttempted
    ? !licenseExpiresAt
      ? "Το πεδίο είναι υποχρεωτικό."
      : ""
    : "";

  const handleCancel = () => {
    navigate({ to: "/admin/sellers" });
  };

  const handleSubmit = () => {
    setSubmitAttempted(true);

    const hasFirstNameError = !firstNameTrimmed || firstNameTrimmed.length < 2;
    const hasLastNameError = !lastNameTrimmed || lastNameTrimmed.length < 2;
    const hasSellerTypeError = !sellerTypeValue;
    const hasAfmError = !afmTrimmed || afmTrimmed.length < 9;
    const hasLicenseNumberError = !licenseNumber;
    const hasLicenseIssuedAtError = !licenseIssuedAt;
    const hasLicenseExpiresAtError = !licenseExpiresAt;

    if (hasFirstNameError || hasLastNameError || hasSellerTypeError || hasAfmError || hasLicenseNumberError || hasLicenseIssuedAtError || hasLicenseExpiresAtError) {
      return;
    }

    const payload = {
      user: {
        email: email || null,
        role: userRole || null,
        status: Number(userStatus) || 0,
      },
      seller: {
        phone: phone || null,
        address: address || null,
      },
      license: {
        fromDate: licenseIssuedAt,
        sellerType: Number(sellerType) || 0,
        isSeasonal: true,
        seasonalFromDate: licenseIssuedAt || null,
        seasonalToDate: licenseExpiresAt || null,
        licenseCategory: 0,
        licenseStatus: 0,
        licenseNumber: licenseNumber,
        licenseExpiry: licenseExpiresAt || null,
        notes: "",
      },
    };

    navigate({ to: "/admin/sellers" });
  };

  return (
    <div className="flex h-full w-full flex-col gap-6 text-left">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-semibold text-(--color-text-heading)">Δημιουργία Πωλητή</h2>
        <CustomButton
          title="Επιστροφή στη λίστα πωλητών"
          backgroundColor="var(--color-text-muted)"
          width="fit-content"
          onClick={handleCancel}
        />
      </div>

      <div className="rounded-lg bg-(--color-surface) p-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
            type="DROPDOWN"
            label="Τύπος Πωλητή *"
            value={String(sellerType)}
            onChange={(value) => setSellerType(String(value))}
            width="100%"
            dropdownItems={[{ label: '-- Επιλέξτε --', value: '' }, ...Object.entries(SELLER_TYPE_LABELS).map(([k, v]) => ({ label: v, value: String(k) }))]}
            error={sellerTypeError}
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
            label="Email"
            value={email}
            onChange={(value) => setEmail(String(value))}
            width="100%"
          />
          <CustomInputField
            type="TEXT"
            label="Τηλέφωνο"
            value={phone}
            onChange={(value) => setPhone(String(value))}
            width="100%"
          />
          <CustomInputField
            type="TEXT"
            label="Διεύθυνση"
            value={address}
            onChange={(value) => setAddress(String(value))}
            width="100%"
          />
          <CustomInputField
            type="DROPDOWN"
            label="Ρόλος χρήστη"
            value={String(userRole)}
            onChange={(value) => setUserRole(value)}
            width="100%"
            dropdownItems={Object.entries(UserRoleLabels).map(([k, v]) => ({
              label: greekUserRoleLabels[String(k)] ?? v,
              value: String(k),
            }))}
          />
          <CustomInputField
            type="DROPDOWN"
            label="Κατάσταση χρήστη"
            value={String(userStatus)}
            onChange={(value) => setUserStatus(value)}
            width="100%"
            dropdownItems={Object.entries(UserStatusLabels).map(([k, v]) => ({ label: v, value: String(k) }))}
          />
        </div>

        <div className="mt-6 space-y-4 flex flex-row">
          <div className="pt-6">
            <h3 className="mb-4 text-lg font-semibold text-(--color-text-heading)">Άδεια</h3>
            <div className="flex flex-row items-center">
              <CustomInputField
                type="TEXT"
                label="Αριθμός *"
                value={licenseNumber}
                onChange={(value) => setLicenseNumber(String(value))}
                width="100%"
                error={licenseNumberError}
              />
              <CustomInputField
                type="DATE"
                label="Ημερομηνία Έκδοσης *"
                value={licenseIssuedAt}
                onChange={(value) => setLicenseIssuedAt(String(value))}
                width="100%"
                error={licenseIssuedAtError}
              />
              <CustomInputField
                type="DATE"
                label="Ημερομηνία Λήξης *"
                value={licenseExpiresAt}
                onChange={(value) => setLicenseExpiresAt(String(value))}
                width="100%"
                error={licenseExpiresAtError}
              />
            </div>
          </div>

          <div className="flex flex-wrap justify-end gap-3 pt-4">
            <CustomButton
              title="Δημιουργία"
              onClick={handleSubmit}
              width="fit-content"
            />
            <CustomButton
              title="Ακύρωση"
              onClick={handleCancel}
              width="fit-content"
              backgroundColor="rgba(255,255,255,0.85)"
              sx={{
                color: "var(--color-text-muted)",
                border: "1px solid var(--color-text-muted)",
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
