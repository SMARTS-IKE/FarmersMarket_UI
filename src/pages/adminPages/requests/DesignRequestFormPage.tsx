import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "@tanstack/react-router";
import { Alert, Box } from "@mui/material";
import CustomButton from "../../../shared/components/CustomButton";
import CreateFieldModal from "../../../components/requests/CreateFieldModal";
import SelectReadyFieldModal from "../../../components/requests/SelectReadyFieldModal";
import { useCreateRequestFormMutation, useRequestFormsQuery } from "../../../queries/formsQueries";
import {
  ADD_NEW_FIELD_OPTION_VALUE,
  FIELD_TYPE_OPTIONS,
  READY_TO_USE_FIELDS,
  STEPS,
  TYPE_OF_FIELDS_TO_DESIGN_FIELD,
} from "../../../components/requests/request.utils";
import StepBasicInfo from "../../../components/requests/designRequestSteps/StepBasicInfo";
import StepDynamicFields from "../../../components/requests/designRequestSteps/StepDynamicFields";
import StepRequiredDocuments from "../../../components/requests/designRequestSteps/StepRequiredDocuments";
import StepConfirmation from "../../../components/requests/designRequestSteps/StepConfirmation";
import type { CreateRequestFormRequest, DesignRequestDraft, DesignRequestFieldType } from "../../../models/request";

const INITIAL_DRAFT: DesignRequestDraft = {
  title: "",
  description: "",
  dynamicFields: [],
  requiredDocuments: [],
};

export default function DesignRequestFormPage() {
  const params = useParams({ strict: false });
  const requestFormId = typeof params.requestFormId === "string" ? Number(params.requestFormId) : undefined;
  const isEditMode = Number.isFinite(requestFormId);
  const navigate = useNavigate();
  const { data: requestFormsData } = useRequestFormsQuery();
  const createRequestFormMutation = useCreateRequestFormMutation();
  const [selectedStep, setSelectedStep] = useState(0);
  const [draft, setDraft] = useState<DesignRequestDraft>(INITIAL_DRAFT);
  const [nextFieldId, setNextFieldId] = useState(1);
  const [nextDocumentId, setNextDocumentId] = useState(1);
  const [isEditDraftInitialized, setIsEditDraftInitialized] = useState(false);
  const [isSelectFieldModalOpen, setIsSelectFieldModalOpen] = useState(false);
  const [isCreateFieldModalOpen, setIsCreateFieldModalOpen] = useState(false);
  const [selectedReadyFieldId, setSelectedReadyFieldId] = useState("");
  const [newFieldDraft, setNewFieldDraft] = useState({
    title: "",
    type: "TEXT" as DesignRequestFieldType,
    availableValues: "",
    weight: 1,
    isRequired: false,
  });
  const [submitError, setSubmitError] = useState<string>("");

  const DESIGN_FIELD_TO_TYPE_OF_FIELDS: Record<DesignRequestFieldType, number> = {
    TEXT: 1,
    NUMBER: 2,
    DATE: 3,
    TEXTAREA: 4,
    DROPDOWN: 5,
    BOOLEAN: 6,
  };

  useEffect(() => {
    if (!isEditMode || isEditDraftInitialized || !requestFormsData) return;

    const requestForm = requestFormsData.items.find((item) => item.id === requestFormId);
    if (!requestForm) return;

    const mappedDynamicFields = requestForm.fields.map((field) => ({
      id: field.id,
      title: field.label,
      type: TYPE_OF_FIELDS_TO_DESIGN_FIELD[field.typeOfFields] ?? "TEXT",
      availableValues: field.options ?? [],
      weight: field.weight,
      isRequired: field.isRequired,
    }));

    const nextMappedFieldId =
      mappedDynamicFields.length > 0
        ? Math.max(...mappedDynamicFields.map((field) => field.id)) + 1
        : 1;

    setDraft((prev) => ({
      ...prev,
      title: requestForm.title,
      description: requestForm.description,
      dynamicFields: mappedDynamicFields.length > 0 ? mappedDynamicFields : prev.dynamicFields,
    }));
    setNextFieldId(nextMappedFieldId);
    setIsEditDraftInitialized(true);
  }, [isEditMode, isEditDraftInitialized, requestFormId, requestFormsData]);

  const handleBack = () => {
    navigate({ to: "/admin/requests" });
  };

  const addDynamicField = (field: {
    title: string;
    type: DesignRequestFieldType;
    availableValues: string;
    weight: number;
    isRequired: boolean;
  }) => {
    const availableValues = field.type === "DROPDOWN"
      ? field.availableValues
          .split(",")
          .map((value) => value.trim())
          .filter((value) => value !== "")
      : [];

    setDraft((prev) => ({
      ...prev,
      dynamicFields: [
        ...prev.dynamicFields,
        {
          id: nextFieldId,
          title: field.title.trim(),
          type: field.type,
          availableValues,
          weight: field.weight,
          isRequired: field.isRequired,
        },
      ],
    }));
    setNextFieldId((prev) => prev + 1);
  };

  const openAddFieldModal = () => {
    setSelectedReadyFieldId("");
    setIsSelectFieldModalOpen(true);
  };

  const closeSelectFieldModal = () => {
    setIsSelectFieldModalOpen(false);
  };

  const openCreateFieldModal = () => {
    setIsSelectFieldModalOpen(false);
    setNewFieldDraft({
      title: "",
      type: "TEXT",
      availableValues: "",
      weight: 1,
      isRequired: false,
    });
    setIsCreateFieldModalOpen(true);
  };

  const closeCreateFieldModal = () => {
    setIsCreateFieldModalOpen(false);
  };

  const createFieldFromModal = () => {
    addDynamicField(newFieldDraft);
    setIsCreateFieldModalOpen(false);
  };

  const addReadyFieldFromModal = () => {
    const selectedTemplate = READY_TO_USE_FIELDS.find((field) => field.id === selectedReadyFieldId);
    if (!selectedTemplate) return;

    addDynamicField({
      title: selectedTemplate.title,
      type: selectedTemplate.type,
      availableValues: selectedTemplate.availableValues,
      weight: selectedTemplate.weight,
      isRequired: selectedTemplate.isRequired,
    });

    setIsSelectFieldModalOpen(false);
    setSelectedReadyFieldId("");
  };

  const handleReadyFieldSelection = (value: string | number | string[]) => {
    const selectedValue = String(value);
    if (selectedValue === ADD_NEW_FIELD_OPTION_VALUE) {
      openCreateFieldModal();
      return;
    }

    setSelectedReadyFieldId(selectedValue);
  };

  const readyFieldDropdownItems = useMemo(
    () => [
      { label: "+Προσθήκη νέου", value: ADD_NEW_FIELD_OPTION_VALUE },
      ...READY_TO_USE_FIELDS.map((field) => ({ label: field.title, value: field.id })),
    ],
    []
  );

  const removeDynamicField = (id: number) => {
    setDraft((prev) => ({
      ...prev,
      dynamicFields: prev.dynamicFields.filter((field) => field.id !== id),
    }));
  };

  const updateDynamicFieldWeight = (id: number, weight: number) => {
    setDraft((prev) => ({
      ...prev,
      dynamicFields: prev.dynamicFields.map((field) =>
        field.id === id ? { ...field, weight } : field
      ),
    }));
  };

  const updateDynamicFieldRequired = (id: number, isRequired: boolean) => {
    setDraft((prev) => ({
      ...prev,
      dynamicFields: prev.dynamicFields.map((field) =>
        field.id === id ? { ...field, isRequired } : field
      ),
    }));
  };

  const addRequiredDocument = () => {
    setDraft((prev) => ({
      ...prev,
      requiredDocuments: [
        ...prev.requiredDocuments,
        { id: nextDocumentId, title: "", isRequired: true },
      ],
    }));
    setNextDocumentId((prev) => prev + 1);
  };

  const removeRequiredDocument = (id: number) => {
    setDraft((prev) => ({
      ...prev,
      requiredDocuments: prev.requiredDocuments.filter((doc) => doc.id !== id),
    }));
  };

  const updateRequiredDocumentTitle = (id: number, title: string) => {
    setDraft((prev) => ({
      ...prev,
      requiredDocuments: prev.requiredDocuments.map((doc) =>
        doc.id === id ? { ...doc, title } : doc
      ),
    }));
  };

  const updateRequiredDocumentRequired = (id: number, isRequired: boolean) => {
    setDraft((prev) => ({
      ...prev,
      requiredDocuments: prev.requiredDocuments.map((doc) =>
        doc.id === id ? { ...doc, isRequired } : doc
      ),
    }));
  };

  const canGoNext = useMemo(() => {
    if (selectedStep === 0) {
      return draft.title.trim() !== "";
    }
    if (selectedStep === 1) {
      const hasSelectedDynamicField = draft.dynamicFields.some((field) => field.title.trim() !== "");
      return (
        hasSelectedDynamicField &&
        draft.dynamicFields.every(
          (field) =>
            field.title.trim() !== "" &&
            field.weight > 0 &&
            (field.type !== "DROPDOWN" || field.availableValues.length > 0)
        )
      );
    }
    if (selectedStep === 2) {
      return draft.requiredDocuments.length > 0 && draft.requiredDocuments.every((doc) => doc.title.trim() !== "");
    }
    return true;
  }, [draft, selectedStep]);

  const stepCompletion = useMemo(() => {
    const basicInfoCompleted = draft.title.trim() !== "";
    const hasSelectedDynamicField = draft.dynamicFields.some((field) => field.title.trim() !== "");
    const dynamicFieldsCompleted =
      hasSelectedDynamicField &&
      draft.dynamicFields.every(
        (field) =>
          field.title.trim() !== "" &&
          field.weight > 0 &&
          (field.type !== "DROPDOWN" || field.availableValues.length > 0)
      );
    const requiredDocumentsCompleted =
      draft.requiredDocuments.length > 0 &&
      draft.requiredDocuments.every((doc) => doc.title.trim() !== "");

    return [
      basicInfoCompleted,
      dynamicFieldsCompleted,
      requiredDocumentsCompleted,
      basicInfoCompleted && dynamicFieldsCompleted && requiredDocumentsCompleted,
    ];
  }, [draft]);

  const maxReachableStep = useMemo(() => {
    if (!stepCompletion[0]) return 0;
    if (!stepCompletion[1]) return 1;
    if (!stepCompletion[2]) return 2;
    return 3;
  }, [stepCompletion]);

  const canCreateField = useMemo(() => {
    const titleValid = newFieldDraft.title.trim() !== "";
    const weightValid = newFieldDraft.weight > 0;
    const valuesValid =
      newFieldDraft.type !== "DROPDOWN" ||
      newFieldDraft.availableValues
        .split(",")
        .map((value) => value.trim())
        .filter((value) => value !== "").length > 0;

    return titleValid && weightValid && valuesValid;
  }, [newFieldDraft]);

  const moveToNextStep = () => {
    setSelectedStep((prev) => Math.min(prev + 1, STEPS.length - 1));
  };

  const moveToPreviousStep = () => {
    setSelectedStep((prev) => Math.max(prev - 1, 0));
  };

  const submitDesignRequest = async () => {
    setSubmitError("");

    const payload: CreateRequestFormRequest = {
      title: draft.title.trim(),
      description: draft.description.trim(),
      fields: draft.dynamicFields.map((field, index) => ({
        label: field.title.trim(),
        typeOfFields: DESIGN_FIELD_TO_TYPE_OF_FIELDS[field.type],
        isRequired: field.isRequired,
        weight: field.weight,
        order: index,
        options: field.type === "DROPDOWN" ? field.availableValues : [],
      })),
    };

    try {
      await createRequestFormMutation.mutateAsync(payload);
      navigate({ to: "/admin/requests" });
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Η υποβολή της φόρμας απέτυχε.");
    }
  };

  const renderStepContent = () => {
    if (selectedStep === 0) {
      return (
        <StepBasicInfo
          title={draft.title}
          description={draft.description}
          onTitleChange={(value) => setDraft((prev) => ({ ...prev, title: value }))}
          onDescriptionChange={(value) => setDraft((prev) => ({ ...prev, description: value }))}
        />
      );
    }

    if (selectedStep === 1) {
      return (
        <StepDynamicFields
          dynamicFields={draft.dynamicFields}
          onOpenAddFieldModal={openAddFieldModal}
          onRemoveDynamicField={removeDynamicField}
          onUpdateDynamicFieldWeight={updateDynamicFieldWeight}
          onUpdateDynamicFieldRequired={updateDynamicFieldRequired}
        />
      );
    }

    if (selectedStep === 2) {
      return (
        <StepRequiredDocuments
          requiredDocuments={draft.requiredDocuments}
          onAddRequiredDocument={addRequiredDocument}
          onRemoveRequiredDocument={removeRequiredDocument}
          onUpdateRequiredDocumentTitle={updateRequiredDocumentTitle}
          onUpdateRequiredDocumentRequired={updateRequiredDocumentRequired}
        />
      );
    }

    return (
      <StepConfirmation
        draft={draft}
        fieldTypeOptions={FIELD_TYPE_OPTIONS}
        onEdit={() => setSelectedStep(0)}
        onSubmit={submitDesignRequest}
        isSubmitting={createRequestFormMutation.isPending}
      />
    );
  };

  return (
    <div className="flex h-full min-h-0 w-full flex-col gap-6 text-left">
      <div className="flex w-full items-center justify-between">
        <h2 className="text-2xl font-semibold text-(--color-dark)">
          {isEditMode ? "Επεξεργασία Φόρμας Αίτησης" : "Δημιουργία Φόρμας Αίτησης"}
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
              disabled={index > maxReachableStep}
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
           
            borderRadius: "10px",
            p: 3,
            backgroundColor: "var(--color-white)",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {submitError ? (
            <Alert severity="error" sx={{ mb: 2 }}>
              {submitError}
            </Alert>
          ) : null}

          <h3 className="text-xl font-semibold text-(--color-dark)">
            {STEPS[selectedStep].title}
          </h3>
          <p className="mt-3 text-sm text-(--color-text-muted)">
            {STEPS[selectedStep].content}
          </p>

          {renderStepContent()}

          {selectedStep < STEPS.length - 1 && (
            <div className="mt-auto flex flex-wrap justify-end gap-3 pt-6">
              <CustomButton
                title="Προηγούμενο"
                backgroundColor="var(--color-text-muted)"
                width="fit-content"
                disabled={selectedStep === 0}
                onClick={moveToPreviousStep}
              />
              <CustomButton
                title="Επόμενο"
                width="fit-content"
                disabled={!canGoNext}
                onClick={moveToNextStep}
              />
            </div>
          )}
        </Box>
      </Box>

      <SelectReadyFieldModal
        open={isSelectFieldModalOpen}
        selectedReadyFieldId={selectedReadyFieldId}
        dropdownItems={readyFieldDropdownItems}
        onClose={closeSelectFieldModal}
        onSelectionChange={handleReadyFieldSelection}
        onAdd={addReadyFieldFromModal}
      />

      <CreateFieldModal
        open={isCreateFieldModalOpen}
        fieldTypeOptions={FIELD_TYPE_OPTIONS}
        newFieldDraft={newFieldDraft}
        canCreateField={canCreateField}
        onClose={closeCreateFieldModal}
        onCreate={createFieldFromModal}
        onFieldDraftChange={setNewFieldDraft}
      />
    </div>
  );
}
