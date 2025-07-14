export interface Template {
  policyName: string;
  duplicateOfId?: string;
  duplicateOf?: { policyName: string };
  policy: Record<string, boolean>;
}

export interface TemplatePermissionsModalProps {
  template?: Template;
  open: boolean;
  onClose: () => void;
  onUse: (
    permissions: Record<string, boolean>,
    action: "apply" | "saveAsTemplate" | "updateTemplate",
    templateName?: string
  ) => void;
}
