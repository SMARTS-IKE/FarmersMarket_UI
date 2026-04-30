import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Box } from "@mui/material";
import CustomButton from "../../../shared/components/CustomButton";

const STEPS = [
  {
    title: "Βήμα 1: Βασικά Στοιχεία",
    content: "Συμπληρώστε τον τίτλο, το είδος αίτησης και μια σύντομη περιγραφή.",
  },
  {
    title: "Βήμα 2: Κριτήρια",
    content: "Ορίστε τα πεδία που είναι υποχρεωτικά και τους κανόνες εγκυρότητας.",
  },
  {
    title: "Βήμα 3: Επιβεβαίωση",
    content: "Ελέγξτε την τελική μορφή της φόρμας πριν από την αποθήκευση.",
  },
];

export default function DesignRequestFormPage() {
  const navigate = useNavigate({ from: "/admin/requests/design-form" });
  const [selectedStep, setSelectedStep] = useState(0);

  const handleBack = () => {
    navigate({ to: "/admin/requests" });
  };

  return (
    <div className="flex h-full min-h-0 w-full flex-col gap-6 text-left">
      <div className="flex w-full items-center justify-between">
        <h2 className="text-2xl font-semibold text-(--color-dark)">
          Δημιουργία Φόρμας Αίτησης
        </h2>
        <CustomButton
          title="Επιστροφή"
          backgroundColor="var(--color-text-muted)"
          width="fit-content"
          onClick={handleBack}
        />
      </div>

      <Box
        className="flex-1 rounded-[10px] border border-(--color-border) bg-(--color-surface) p-5"
        sx={{ display: "flex", gap: 3, minHeight: 0 }}
      >
        <Box
          sx={{
            width: 280,
            minWidth: 280,
            display: "flex",
            flexDirection: "column",
            gap: 1.5,
            height: "100%",
          }}
        >
          {STEPS.map((step, index) => (
            <CustomButton
              key={step.title}
              title={step.title}
              onClick={() => setSelectedStep(index)}
              width="100%"
              backgroundColor={
                selectedStep === index
                  ? "var(--color-dark)"
                  : "var(--color-text-muted)"
              }
              sx={{ justifyContent: "flex-start", px: 1.5 }}
            />
          ))}
        </Box>

        <Box
          sx={{
            flex: 1,
            minHeight: 0,
            border: "1px solid var(--color-border)",
            borderRadius: "10px",
            p: 3,
            backgroundColor: "var(--color-light)",
          }}
        >
          <h3 className="text-xl font-semibold text-(--color-dark)">
            {STEPS[selectedStep].title}
          </h3>
          <p className="mt-3 text-sm text-(--color-text-muted)">
            {STEPS[selectedStep].content}
          </p>
        </Box>
      </Box>
    </div>
  );
}
