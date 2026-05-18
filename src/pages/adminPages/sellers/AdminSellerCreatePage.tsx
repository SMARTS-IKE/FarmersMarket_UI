import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import CustomButton from "../../../shared/components/CustomButton";
import CustomInputField from "../../../shared/components/CustomInputField";
import { SELLER_TYPE_LABELS } from "../../../components/sellers/sellers.utils";
import type { SellerType } from "../../../models/seller";

export default function AdminSellerCreatePage() {
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [afm, setAfm] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [sellerType, setSellerType] = useState<SellerType | string>("1");
  const [licenseNumber, setLicenseNumber] = useState("");
  const [licenseIssuedAt, setLicenseIssuedAt] = useState("");
  const [licenseExpiresAt, setLicenseExpiresAt] = useState("");

  const handleCancel = () => {
    navigate({ to: "/admin/sellers" });
  };

  const handleSubmit = () => {
    // TODO: wire create seller mutation when backend endpoint is available
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
            label="Όνομα"
            value={firstName}
            onChange={(value) => setFirstName(String(value))}
            width="100%"
            validation={{ required: true, minLength: 2 }}
          />
          <CustomInputField
            type="TEXT"
            label="Επώνυμο"
            value={lastName}
            onChange={(value) => setLastName(String(value))}
            width="100%"
            validation={{ required: true, minLength: 2 }}
          />
          <CustomInputField
            type="DROPDOWN"
            label="Τύπος Πωλητή"
            value={String(sellerType)}
            onChange={(value) => setSellerType(String(value))}
            width="100%"
            dropdownItems={[
              { label: SELLER_TYPE_LABELS[1] ?? "Παραγωγός", value: "1" },
              { label: SELLER_TYPE_LABELS[2] ?? "Επαγγελματίας", value: "2" },
            ]}
            validation={{ required: true }}
          />
          <CustomInputField
            type="TEXT"
            label="ΑΦΜ"
            value={afm}
            onChange={(value) => setAfm(String(value))}
            width="100%"
            validation={{ required: true, minLength: 9 }}
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
            label="Email"
            value={email}
            onChange={(value) => setEmail(String(value))}
            width="100%"
          />
          <CustomInputField
            type="TEXT"
            label="Διεύθυνση"
            value={address}
            onChange={(value) => setAddress(String(value))}
            width="100%"
          />
        </div>

        <div className="mt-6 space-y-4">
          <div className="pt-6">
            <h3 className="mb-4 text-lg font-semibold text-(--color-text-heading)">Άδεια</h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <CustomInputField
                type="TEXT"
                label="Αριθμός"
                value={licenseNumber}
                onChange={(value) => setLicenseNumber(String(value))}
                width="100%"
              />
              <CustomInputField
                type="DATE"
                label="Ημερομηνία Έκδοσης"
                value={licenseIssuedAt}
                onChange={(value) => setLicenseIssuedAt(String(value))}
                width="100%"
              />
              <CustomInputField
                type="DATE"
                label="Ημερομηνία Λήξης"
                value={licenseExpiresAt}
                onChange={(value) => setLicenseExpiresAt(String(value))}
                width="100%"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-3 pt-4">
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
