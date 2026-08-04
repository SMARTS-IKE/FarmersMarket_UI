import { Alert, Chip, Box, Tab, Tabs, Divider, IconButton, Button } from "@mui/material";
import { useNavigate, useParams } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { queryClient } from "../../lib/queryClient";
import CustomButton from "../../shared/components/CustomButton";
import LayoutTabsSlot from "../../shared/components/LayoutTabsSlot";
import CustomInputField from "../../shared/components/CustomInputField";
import type { RequestFormField } from "../../models/request";
import { useRequestFormByIdQuery } from "../../queries/formsQueries";
import { useMarketsQuery } from '../../queries/marketQueries';
import { useSellerQuery, useSellersQuery } from "../../queries/sellerQueries";
import { useAuthStore } from "../../store/authStore";
import { TYPE_OF_FIELDS_TO_DESIGN_FIELD } from "../../components/requests/request.utils";
import { useCreateRequestMutation } from "../../queries/requestQueries";
import { useGlobalEnums } from '../../shared/mappings/GlobalEnums';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';

const ATTACHMENT_KEYWORDS = ["έγγρα", "δικαιολογ", "επισυνα", "attachment", "document", "pdf"] as const;
const BOOLEAN_OPTIONS = [
  { label: "Ναι", value: "true" },
  { label: "Όχι", value: "false" },
];

export default function UserRequestCreationDetailsPage() {
  const navigate = useNavigate();
  const params = useParams({ strict: false });
  const formId = typeof params.formId === "string" ? params.formId : "";

  const [activeTab, setActiveTab] = useState(0);
  const [dynamicFieldValues, setDynamicFieldValues] = useState<Record<number, string | number | string[]>>({});
  const [selectedMarkets, setSelectedMarkets] = useState<string[]>([]);
  const [attachmentFiles, setAttachmentFiles] = useState<Record<number, File | null>>({});

  const requestFormDetailQuery = useRequestFormByIdQuery(formId);
  const authUser = useAuthStore((s) => s.user);
  // Query sellers list and try to resolve a seller record for the current user
  const sellersQuery = useSellersQuery({ name: "", afm: "", sellerType: 0 as any, page: 1, pageSize: 50 });
  const sellerQuery = useSellerQuery(authUser?.id ? String(authUser.id) : "");

  const matchedSeller = (() => {
    // prefer explicit seller fetched by id
    if (sellerQuery.data) return sellerQuery.data as any;
    const list = (sellersQuery.data?.items ?? []) as any[];
    if (!authUser) return null;

    // try match by userId, then afm, then name
    const byUser = list.find((s) => s.userId != null && String(s.userId) === String(authUser.id));
    if (byUser) return byUser;

    const byAfm = list.find((s) => s.afm && authUser?.afm && String(s.afm) === String((authUser as any).afm));
    if (byAfm) return byAfm;

    const authName = (authUser?.name ?? `${(authUser as any)?.firstName ?? ''} ${(authUser as any)?.lastName ?? ''}`).trim();
    const byName = list.find((s) => {
      const sName = `${s.firstName ?? ''} ${s.lastName ?? ''}`.trim();
      return sName && authName && sName === authName;
    });
    if (byName) return byName;

    return null;
  })();
  const createRequestMutation = useCreateRequestMutation();

  const renderCounter = useRef(0);
  renderCounter.current += 1;


  useEffect(() => {
    setDynamicFieldValues({});
  }, [formId]);

  const { SellerTypeLabels } = useGlobalEnums();

  const resolvedApplicantName =
    (authUser?.name as string) ||
    (authUser ? `${authUser.firstName ?? ""} ${authUser.lastName ?? ""}`.trim() : "") ||
    (matchedSeller ? `${(matchedSeller as any).firstName} ${(matchedSeller as any).lastName}`.trim() : "");

  const resolvedApplicantAfm = (matchedSeller as any)?.afm ?? (authUser as any)?.afm ?? "";
  const sellerTypeNum = Number((matchedSeller as any)?.sellerType ?? (authUser as any)?.sellerType ?? 0);
  const resolvedLicenseCategory = SellerTypeLabels[sellerTypeNum] ?? String(sellerTypeNum ?? "");
  const resolvedLicenseNumber = (matchedSeller as any)?.licenses?.[0]?.number ?? (authUser as any)?.licenseNumber ?? "";

  const [applicantInfo, setApplicantInfo] = useState({
    name: "",
    afm: "",
    licenseCategory: "",
    licenseNumber: "",
  });
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    setApplicantInfo({
      name: resolvedApplicantName,
      afm: String(resolvedApplicantAfm ?? ""),
      licenseCategory: String(resolvedLicenseCategory ?? ""),
      licenseNumber: String(resolvedLicenseNumber ?? ""),
    });
  }, [resolvedApplicantName, resolvedApplicantAfm, resolvedLicenseCategory, resolvedLicenseNumber]);

  const license = (matchedSeller as any)?.licenses?.[0];
  const licenseIssuedAt = license?.issuedAt ? new Date(license.issuedAt).toLocaleDateString("el-GR") : "";
  const licenseExpiresAt = license?.expiresAt ? new Date(license.expiresAt).toLocaleDateString("el-GR") : "";

  const isDocumentField = (field: RequestFormField) => {
    const label = field.label.toLowerCase();
    return ATTACHMENT_KEYWORDS.some((keyword) => label.includes(keyword));
  };

  const handleBack = () => {
    navigate({ to: "/users/requests" });
  };

  // load markets for selection
  const marketsQuery = useMarketsQuery({ name: "", marketType: "", operatingDays: [], page: 1, pageSize: 200 });
  const marketOptions = (marketsQuery.data?.items ?? []).map((m) => ({ label: m.name, value: String(m.id) }));

  if (requestFormDetailQuery.isLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center text-(--color-text-muted)">
        Φόρτωση φόρμας αίτησης...
      </div>
    );
  }

  if (requestFormDetailQuery.isError || !requestFormDetailQuery.data) {
    return (
      <div className="flex h-full w-full flex-col gap-4 text-left">
        <Alert severity="error">
          {requestFormDetailQuery.error?.message ?? "Δεν ήταν δυνατή η φόρτωση της φόρμας."}
        </Alert>
        <div>
          <CustomButton
            title="Επιστροφή"
            backgroundColor="var(--color-text-muted)"
            width="fit-content"
            onClick={handleBack}
          />
        </div>
      </div>
    );
  }

  const selectedForm = requestFormDetailQuery.data;
  const customFields = selectedForm?.fields ?? [];
  // Support forms that include an `other` or `documentRequirements` array in the response (e.g. required documents)
  const otherRaw = (selectedForm as any)?.other ?? (selectedForm as any)?.documentRequirements ?? [];
  const documentRequirements: any[] = Array.isArray(otherRaw)
    ? otherRaw.map((o: any) => ({ id: Number(o.id), label: o.label ?? o.title ?? String(o.id), isRequired: Boolean(o.isRequired), order: Number(o.order ?? 0) }))
    : [];

  // Attachment fields detected from dynamic fields (by keyword)
  const attachmentFields: any[] = customFields.filter((f) => isDocumentField(f));
  const basicFormFields = customFields.filter((f) => !isDocumentField(f));

  // Load available markets for the multiselect

  const renderFieldChip = (field: RequestFormField) => {
    const typeLabelMap: Record<number, string> = {
      1: "Κείμενο",
      2: "Αριθμός",
      3: "Ημερομηνία",
      4: "Μεγάλο κείμενο",
      5: "Dropdown",
      6: "Ναι / Όχι",
    };

    return (
      <div key={field.id} className="flex items-center justify-between rounded-lg border border-(--color-border) bg-(--color-surface) px-4 py-3">
        <div className="flex flex-col gap-1">
          <span className="font-medium text-(--color-dark)">{field.label}</span>
          <span className="text-sm text-(--color-text-muted)">{typeLabelMap[field.typeOfFields] ?? "Άγνωστο"}</span>
        </div>
        {field.isRequired && <Chip size="small" label="Υποχρεωτικό" />}
      </div>
    );
  };

  const renderDynamicFieldInput = (field: RequestFormField) => {
    const fieldType = TYPE_OF_FIELDS_TO_DESIGN_FIELD[field.typeOfFields] ?? "TEXT";
    const value = dynamicFieldValues[field.id] ?? "";

    if (fieldType === "BOOLEAN") {
      return (
        <CustomInputField
          key={field.id}
          type="DROPDOWN"
          label={field.isRequired ? `${field.label} *` : field.label}
          value={value}
          dropdownItems={BOOLEAN_OPTIONS}
          onChange={(nextValue) =>
            setDynamicFieldValues((prev) => ({
              ...prev,
              [field.id]: nextValue,
            }))
          }
          width="100%"
        />
      );
    }

    if (fieldType === "DROPDOWN") {
      return (
        <CustomInputField
          key={field.id}
          type="DROPDOWN"
          label={field.isRequired ? `${field.label} *` : field.label}
          value={value}
          dropdownItems={field.options.map((o) => ({ label: o, value: o }))}
          onChange={(nextValue) =>
            setDynamicFieldValues((prev) => ({
              ...prev,
              [field.id]: nextValue,
            }))
          }
          width="100%"
        />
      );
    }

    const inputType = fieldType === "TEXTAREA" ? "TEXTAREA" : fieldType === "NUMBER" ? "NUMBER" : fieldType === "DATE" ? "DATE" : "TEXT";

    return (
      <CustomInputField
        key={field.id}
        type={inputType}
        label={field.isRequired ? `${field.label} *` : field.label}
        value={value}
        onChange={(nextValue) =>
          setDynamicFieldValues((prev) => ({
            ...prev,
            [field.id]: nextValue,
          }))
        }
        width="100%"
      />
    );
  };

  return (
    <div className="w-full p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-semibold text-(--color-text-heading)">Αίτηση: {selectedForm.title}</h2>
          <div className="flex items-center gap-3">
            <CustomButton title="Επιστροφή" backgroundColor="var(--color-text-muted)" width="fit-content" onClick={handleBack} />
          </div>
        </div>

        <LayoutTabsSlot>
          <Box className="flex h-full">
            <div className="max-w-6xl mx-auto w-full">
              <Tabs
                value={activeTab}
                onChange={(_: any, nextValue: number) => setActiveTab(nextValue)}
                variant="fullWidth"
                textColor="inherit"
                sx={{ width: "100%" }}
              >
                <Tab label="Στοιχεία Αιτούντος" />
                <Tab label="Βασικά Στοιχεία Αίτησης" />
                <Tab label="Επισυναπτόμενα Έγγραφα" />
              </Tabs>
            </div>
          </Box>
        </LayoutTabsSlot>

        <div className="flex-1">
          {activeTab === 0 && (
            <div className="space-y-4 rounded-lg">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="flex flex-col gap-1">
                  <CustomInputField
                    type="TEXT"
                    label="Ονοματεπώνυμο"
                    value={applicantInfo.name}
                    onChange={(nextValue) => setApplicantInfo((p) => ({ ...p, name: String(nextValue) }))}
                    disabled
                    width="100%"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <CustomInputField
                    type="TEXT"
                    label="ΑΦΜ"
                    value={applicantInfo.afm}
                    onChange={(nextValue) => setApplicantInfo((p) => ({ ...p, afm: String(nextValue) }))}
                    disabled
                    width="100%"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <CustomInputField
                    type="TEXT"
                    label="Κατηγορία Άδειας"
                    value={applicantInfo.licenseCategory}
                    onChange={(nextValue) => setApplicantInfo((p) => ({ ...p, licenseCategory: String(nextValue) }))}
                    disabled
                    width="100%"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <CustomInputField
                    type="TEXT"
                    label="Αριθμός Άδειας"
                    value={applicantInfo.licenseNumber}
                    onChange={(nextValue) => setApplicantInfo((p) => ({ ...p, licenseNumber: String(nextValue) }))}
                    disabled
                    width="100%"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <CustomInputField
                    type="TEXT"
                    label="Ημερομηνία Έκδοσης"
                    value={licenseIssuedAt}
                    disabled
                    width="100%"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <CustomInputField
                    type="TEXT"
                    label="Ημερομηνία Λήξης"
                    value={licenseExpiresAt}
                    disabled
                    width="100%"
                  />
                </div>
              </div>
              <div className="pt-4 flex flex-col gap-5">
                <Divider />
                <CustomInputField
                  type="MULTI_SELECT"
                  label="Επιλέξτε Αγορές"
                  value={selectedMarkets}
                  dropdownItems={marketOptions}
                  onChange={(v) => setSelectedMarkets(Array.isArray(v) ? v as string[] : [String(v)])}
                  width="100%"
                />
              </div>
            </div>
          )}

          {activeTab === 1 && (
            <div className="space-y-4 rounded-lg">
              {basicFormFields.length > 0 ? (
                <div className="grid grid-cols-2 gap-3">
                  {basicFormFields.map((field) => (
                    <div key={field.id}>{renderDynamicFieldInput(field)}</div>
                  ))}
                </div>
              ) : (
                <Alert severity="info">Δεν βρέθηκαν δυναμικά πεδία για τη συγκεκριμένη φόρμα.</Alert>
              )}
            </div>
          )}

          {activeTab === 2 && (
            <div className="space-y-4 rounded-lg">
              <h3 className="text-base font-semibold">Απαιτούμενα επισυναπτόμενα</h3>
              {attachmentFields.length + documentRequirements.length > 0 ? (
                <div className="flex flex-col gap-3">
                  {attachmentFields.map((f) => (
                    <div
                      key={`att-${f.id}`}
                      className="w-full flex flex-col gap-2 p-3 border rounded-lg"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium" >{f.label}</div>
                          <div className="text-sm" style={f.isRequired ? { color: '#ef4123' } : undefined}>{f.isRequired ? 'Υποχρεωτικό *' : 'Προαιρετικό'}</div>
                        </div>
                        <div>
                          <label htmlFor={`file-input-att-${f.id}`} className="inline-block cursor-pointer">
                            <Button
                              variant="outlined"
                              component="span"
                              sx={{
                                color: '#5a3f2b',
                                borderColor: '#5a3f2b',
                                textTransform: 'capitalize',
                                fontWeight: 600,
                                '&:hover': { borderColor: '#5a3f2b', backgroundColor: 'rgba(90,63,43,0.04)' },
                              }}
                            >
                              {'Επιλογή Αρχείου'}
                            </Button>
                          </label>
                          <input
                            id={`file-input-att-${f.id}`}
                            type="file"
                            accept="*/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files && e.target.files.length > 0 ? e.target.files[0] : null;
                              setAttachmentFiles((p) => ({ ...p, [f.id]: file }));
                            }}
                          />
                        </div>
                      </div>
                      <div className="flex justify-end items-center gap-2">
                        <span className="text-sm text-(--color-text-muted)">{attachmentFiles[f.id]?.name ?? 'Δεν έχει επιλεγεί αρχείο'}</span>
                        {attachmentFiles[f.id] && (
                          <div className="flex items-center gap-2">
                            <CheckIcon sx={{ color: '#28a745', fontSize: 16 }} />
                            <IconButton
                              aria-label="Διαγραφή αρχείου"
                              title="Διαγραφή αρχείου"
                              onClick={() => {
                                setAttachmentFiles((p) => ({ ...p, [f.id]: null }));
                                const el = document.getElementById(`file-input-att-${f.id}`) as HTMLInputElement | null;
                                if (el) el.value = '';
                              }}
                              sx={{ bgcolor: '#ef4123', border: '1px solid #ef4123', width: 24, height: 24 }}
                            >
                              <CloseIcon sx={{ color: '#ffffff', fontSize: 12 }} />
                            </IconButton>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}

                  {documentRequirements.map((d) => (
                    <div
                      key={`doc-${d.id}`}
                      className="w-full flex flex-col gap-2 p-3 border rounded-lg"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">{d.label}</div>
                          <div className="text-sm" style={d.isRequired ? { color: '#ef4123' } : undefined}>{d.isRequired ? 'Υποχρεωτικό *' : 'Προαιρετικό'}</div>
                        </div>
                        <div>
                          <label htmlFor={`file-input-doc-${d.id}`} className="inline-block cursor-pointer">
                            <Button
                              variant="outlined"
                              component="span"
                              sx={{
                                color: '#5a3f2b',
                                borderColor: '#5a3f2b',
                                textTransform: 'capitalize',
                                fontWeight: 600,
                                '&:hover': { borderColor: '#5a3f2b', backgroundColor: 'rgba(90,63,43,0.04)' },
                              }}
                            >
                              {'Επιλογή Αρχείου'}
                            </Button>
                          </label>
                          <input
                            id={`file-input-doc-${d.id}`}
                            type="file"
                            accept="*/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files && e.target.files.length > 0 ? e.target.files[0] : null;
                              setAttachmentFiles((p) => ({ ...p, [d.id]: file }));
                            }}
                          />
                        </div>
                      </div>
                      <div className="flex justify-end items-center gap-2">
                        <span className="text-sm text-(--color-text-muted)">{attachmentFiles[d.id]?.name ?? 'Δεν έχει επιλεγεί αρχείο'}</span>
                        {attachmentFiles[d.id] && (
                          <div className="flex items-center gap-2">
                            <CheckIcon sx={{ color: '#28a745', fontSize: 16 }} />
                            <IconButton
                              aria-label="Διαγραφή αρχείου"
                              title="Διαγραφή αρχείου"
                              onClick={() => {
                                setAttachmentFiles((p) => ({ ...p, [d.id]: null }));
                                const el = document.getElementById(`file-input-doc-${d.id}`) as HTMLInputElement | null;
                                if (el) el.value = '';
                              }}
                              sx={{ bgcolor: '#ef4123', border: '1px solid #ef4123', width: 24, height: 24 }}
                            >
                              <CloseIcon sx={{ color: '#ffffff', fontSize: 12 }} />
                            </IconButton>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <Alert severity="info">Δεν βρέθηκαν πεδία επισυναπτόμενων εγγράφων για τη συγκεκριμένη φόρμα.</Alert>
              )}
            </div>
          )}

          

          {activeTab === 2 && (
            <div className="mt-6 flex justify-end">
                {validationError && (
                  <div className="mr-4">
                    <Alert severity="error">{validationError}</Alert>
                  </div>
                )}
                <CustomButton
                title={createRequestMutation.status === 'pending' ? "Υποβολή..." : "Υποβολή Αίτησης"}
                backgroundColor="var(--color-primary)"
                onClick={() => {
                  setValidationError(null);

                  // Validate required dynamic fields
                  const missingDynamicFields: string[] = [];
                  for (const f of basicFormFields) {
                    if (f.isRequired) {
                      const val = dynamicFieldValues[f.id];
                      const empty = val === undefined || val === null || (typeof val === 'string' && val.trim() === '') || (Array.isArray(val) && val.length === 0);
                      if (empty) missingDynamicFields.push(f.label || `Πεδίο ${f.id}`);
                    }
                  }

                  // Validate required attachments / document requirements
                  const missingAttachments: string[] = [];
                  for (const d of [...attachmentFields, ...documentRequirements]) {
                    if (d.isRequired) {
                      const file = attachmentFiles[d.id];
                      if (!file) missingAttachments.push(d.label || `Έγγραφο ${d.id}`);
                    }
                  }

                  if (missingDynamicFields.length > 0 || missingAttachments.length > 0) {
                    const parts: string[] = [];
                    if (missingDynamicFields.length > 0) parts.push(`Συμπληρώστε υποχρεωτικά πεδία: ${missingDynamicFields.join(', ')}`);
                    if (missingAttachments.length > 0) parts.push(`Επιλέξτε τα απαιτούμενα αρχεία: ${missingAttachments.join(', ')}`);
                    setValidationError(parts.join(' — '));
                    // switch to appropriate tab for user convenience
                    if (missingDynamicFields.length > 0) setActiveTab(1);
                    else if (missingAttachments.length > 0) setActiveTab(2);
                    return;
                  }

                  const fieldValues = Object.keys(dynamicFieldValues).map((k) => ({
                    fieldId: Number(k),
                    value: Array.isArray(dynamicFieldValues[Number(k)]) ? (dynamicFieldValues[Number(k)] as string[]).join(',') : String(dynamicFieldValues[Number(k)] ?? ''),
                  }));

                  // Build multipart FormData following the API expectations
                  const formData = new FormData();
                  const sellerId = (matchedSeller as any)?.id ? Number((matchedSeller as any).id) : undefined;
                  if (sellerId != null) formData.append('SellerId', String(sellerId));

                  // MarketIds: append one field per selected market
                  for (const m of selectedMarkets) {
                    formData.append('MarketIds', String(Number(m)));
                  }

                  // AllowAutoScoring - include default true
                  formData.append('AllowAutoScoring', 'true');

                  formData.append('FormId', String(Number(formId)));
                  formData.append('Notes', String(''));

                  // FieldValues: append multiple fields named 'FieldValues' containing JSON strings
                  for (const fv of fieldValues) {
                    formData.append('FieldValues', JSON.stringify({ fieldId: fv.fieldId, value: fv.value }));
                  }

                  // Documents & Files: append per-attachment field if a file was selected
                  for (const f of [...attachmentFields, ...documentRequirements]) {
                    const file = attachmentFiles[f.id];
                    if (file) {
                      formData.append('Documents', JSON.stringify({ fileName: file.name }));
                      formData.append('Files', file, file.name);
                    }
                  }

                  createRequestMutation.mutate(formData as any, {
                    onSuccess: async () => {
                      // Invalidate and refetch all requests queries to avoid returning cached results
                      await queryClient.invalidateQueries({ queryKey: ['requests'], refetchActive: true, refetchInactive: true });
                      navigate({ to: "/users/requests" });
                    },
                  });
                }}
                width="fit-content"
                disabled={createRequestMutation.status === 'pending'}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
