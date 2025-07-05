import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useSaveOptionsModal } from "./hooks/useSaveOptionsModal";
import type { SaveOptionsModalProps } from "./types/types";
import { SaveOptionsSelect } from "./components/SaveOptionsSelect";
import { SaveOptionsTemplate } from "./components/SaveOptionsTemplate";

export function SaveOptionsModal({
  open,
  onClose,
  onSaveForUser,
  onSaveAsTemplate,
  templates,
  permissions,
  onViewTemplate,
}: SaveOptionsModalProps) {
  const {
    templateName,
    mode,
    nameError,
    duplicateTemplate,
    matchingTemplate,
    handleSaveTemplate,
    setTemplateName,
    setMode,
    setNameError,
  } = useSaveOptionsModal({
    open,
    templates,
    permissions,
    onSaveAsTemplate,
    onClose,
  });

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        {mode === "select" ? (
          <SaveOptionsSelect
            onSaveForUser={onSaveForUser}
            onSaveAsTemplateMode={() => setMode("template")}
            onClose={onClose}
            matchingTemplate={matchingTemplate}
            onViewTemplate={onViewTemplate}
          />
        ) : (
          <SaveOptionsTemplate
            templateName={templateName}
            setTemplateName={(name) => {
              setTemplateName(name);
              if (nameError) setNameError("");
            }}
            nameError={nameError}
            duplicateTemplate={duplicateTemplate}
            onBack={() => setMode("select")}
            onSaveTemplate={handleSaveTemplate}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
