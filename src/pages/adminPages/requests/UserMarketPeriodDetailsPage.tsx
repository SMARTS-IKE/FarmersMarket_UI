import { Alert, Box, Chip, Tab, Tabs } from "@mui/material";
import { useNavigate, useParams, useSearch } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import CustomButton from "../../../shared/components/CustomButton";
import CustomInputField from "../../../shared/components/CustomInputField";
import type { RequestFormField } from "../../../models/request";
import { useRequestFormsQuery } from "../../../queries/formsQueries";
import { useMarketPeriodDetailQuery } from "../../../queries/requestQueries";
import { TYPE_OF_FIELDS_TO_DESIGN_FIELD } from "../../../components/requests/request.utils";

const APPLICANT_FIELDS = [
  "Ονοματεπώνυμο",
  "ΑΦΜ",
  "Κατηγορία Άδειας",
  "Αριθμός Άδειας",
] as const;

const ATTACHMENT_KEYWORDS = ["έγγρα", "δικαιολογ", "επισυνα", "attachment", "document", "pdf"] as const;
const BOOLEAN_OPTIONS = [
  { label: "Ναι", value: "true" },
  { label: "Όχι", value: "false" },
];

export default function UserMarketPeriodDetailsPage() {
  const navigate = useNavigate();
  const params = useParams({ strict: false });
  const search = useSearch({ from: "/user-protected/users/requests/periods/$periodId" });
  const periodId = typeof params.periodId === "string" ? params.periodId : "";
  const [activeTab, setActiveTab] = useState(0);
  const [dynamicFieldValues, setDynamicFieldValues] = useState<Record<number, string | number | string[]>>({});
  const marketPeriodDetailQuery = useMarketPeriodDetailQuery(periodId);
  const { data: formsData } = useRequestFormsQuery();

  const isDocumentField = (field: RequestFormField) => {
    const label = field.label.toLowerCase();
    return ATTACHMENT_KEYWORDS.some((keyword) => label.includes(keyword));
  };

  const periodData = marketPeriodDetailQuery.data;
  const selectedFormId = search.formId ?? periodData?.formId ?? undefined;

  useEffect(() => {
    setDynamicFieldValues({});
  }, [selectedFormId]);

  const handleBack = () => {
    navigate({ to: "/users/requests" });
  };

  if (marketPeriodDetailQuery.isLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center text-(--color-text-muted)">
        Φόρτωση στοιχείων περιόδου...
      </div>
    );
  }

  if (marketPeriodDetailQuery.isError || !marketPeriodDetailQuery.data) {
    return (
      <div className="flex h-full w-full flex-col gap-4 text-left">
        <Alert severity="error">
          {marketPeriodDetailQuery.error?.message ?? "Δεν ήταν δυνατή η φόρτωση της περιόδου."}
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

  const period = marketPeriodDetailQuery.data;

  const selectedForm = (formsData?.items ?? []).find((form) => form.id === selectedFormId);
  const customFields = selectedForm?.fields ?? [];
  const attachmentFields = customFields.filter((field) => isDocumentField(field));
  const basicFormFields = customFields.filter((field) => !isDocumentField(field));

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
      <div
        key={field.id}
        className="flex items-center justify-between rounded-lg border border-(--color-border) bg-(--color-surface) px-4 py-3"
      >
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
          type="DROPDOWN"
          label={field.isRequired ? `${field.label} *` : field.label}
          value={value}
          dropdownItems={field.options.map((option) => ({ label: option, value: option }))}
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

    const inputType = fieldType === "TEXTAREA"
      ? "TEXTAREA"
      : fieldType === "NUMBER"
        ? "NUMBER"
        : fieldType === "DATE"
          ? "DATE"
          : "TEXT";

    return (
      <CustomInputField
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
    <div className="flex h-full w-full flex-col gap-6 text-left">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Αίτηση για την περίοδο: {period.title}</h2>
        <CustomButton
          title="Επιστροφή"
          backgroundColor="var(--color-text-muted)"
          width="fit-content"
          onClick={handleBack}
        />
      </div>

      <Box>
        <Tabs
          value={activeTab}
          onChange={(_, nextValue) => setActiveTab(nextValue)}
          variant="fullWidth"
          textColor="inherit"
          sx={{
            width: "100%",
            marginBottom: 3,
            borderBottom: "1px solid var(--color-border)",
            "& .MuiTab-root": {
              flex: 1,
              textTransform: "none",
              fontWeight: 600,
              color: "var(--color-text-muted)",
            },
            "& .MuiTab-root.Mui-selected": {
              color: "var(--color-dark)",
            },
            "& .MuiTabs-indicator": {
              backgroundColor: "var(--color-dark)",
            },
          }}
        >
          <Tab label="Στοιχεία Αιτούντος" />
          <Tab label="Βασικά Στοιχεία Αίτησης" />
          <Tab label="Επισυναπτόμενα Έγγραφα" />
        </Tabs>
      </Box>

      {activeTab === 0 && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {APPLICANT_FIELDS.map((field) => (
            <CustomInputField
              key={field}
              type="TEXT"
              label={field}
              value=""
              placeholder="Συμπληρώνεται από τον αιτούντα"
              width="100%"
              disabled
            />
          ))}
        </div>
      )}

      {activeTab === 1 && (
        <div className="flex flex-col gap-3">
          {basicFormFields.length > 0 ? (
            <div className="grid grid-cols-2 gap-3">
              {basicFormFields.map((field) => (
                <div  key={field.id}>
                  {renderDynamicFieldInput(field)}
                </div>
              ))}
            </div>
          ) : (
            <Alert severity="info">Δεν βρέθηκαν δυναμικά πεδία για τη συγκεκριμένη φόρμα.</Alert>
          )}
        </div>
      )}

      {activeTab === 2 && (
        <div className="flex flex-col gap-3">
          <h3 className="text-base font-semibold">Απαιτούμενα επισυναπτόμενα</h3>
          {attachmentFields.length > 0 ? (
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">{attachmentFields.map((field) => renderFieldChip(field))}</div>
          ) : (
            <Alert severity="info">Δεν βρέθηκαν πεδία επισυναπτόμενων εγγράφων για τη συγκεκριμένη φόρμα.</Alert>
          )}
        </div>
      )}
    </div>
  );
}