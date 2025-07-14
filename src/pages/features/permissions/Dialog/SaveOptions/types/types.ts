export interface SaveOptionsModalProps {
  open: boolean;
  onClose: () => void;
  onSaveForUser: () => void;
  onSaveAsTemplate: (templateName: string) => void;
  templates: Array<{ id: string; policyName: string; policy: any }>;
  permissions: Record<string, boolean>;
  onViewTemplate: (id: string) => void;
}
