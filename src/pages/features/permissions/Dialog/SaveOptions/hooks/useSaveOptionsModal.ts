import { useState, useEffect, useMemo } from "react";
import type { SaveOptionsModalProps } from "../types/types";

type Props = Pick<
  SaveOptionsModalProps,
  "open" | "templates" | "permissions" | "onSaveAsTemplate" | "onClose"
>;

export function useSaveOptionsModal({
  open,
  templates,
  permissions,
  onSaveAsTemplate,
  onClose,
}: Props) {
  const [templateName, setTemplateName] = useState("");
  const [mode, setMode] = useState<"select" | "template">("select");
  const [nameError, setNameError] = useState("");
  const [duplicateTemplate, setDuplicateTemplate] = useState<any>(null);

  const matchingTemplate = useMemo(() => {
    if (!permissions) return null;
    const permString = JSON.stringify(permissions);
    return templates.find((t) => JSON.stringify(t.policy) === permString) || null;
  }, [templates, permissions]);

  useEffect(() => {
    if (mode === "template" && open) {
      const permString = JSON.stringify(permissions);
      const duplicate = templates.find((t) => JSON.stringify(t.policy) === permString) || null;
      setDuplicateTemplate(duplicate);
    } else {
      setDuplicateTemplate(null);
    }
  }, [mode, templates, permissions, open]);

  const handleSaveTemplate = () => {
    if (!templateName.trim()) {
      setNameError("Template name is required");
      return;
    }

    const nameExists = templates.some(
      (t) => t.policyName.toLowerCase() === templateName.toLowerCase()
    );

    if (nameExists) {
      setNameError("Template name already exists");
      return;
    }

    setNameError("");
    onSaveAsTemplate(templateName.trim());
    onClose();
  };

  useEffect(() => {
    if (!open) {
      setTemplateName("");
      setMode("select");
      setNameError("");
      setDuplicateTemplate(null);
    }
  }, [open]);

  return {
    templateName,
    mode,
    nameError,
    duplicateTemplate,
    matchingTemplate,
    handleSaveTemplate,
    setTemplateName,
    setMode,
    setNameError,
  };
}
