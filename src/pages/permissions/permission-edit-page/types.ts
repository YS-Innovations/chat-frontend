export type PermissionValue = Record<string, boolean>;

export interface PermissionTemplate {
  id: string;
  policyName: string;
  permissions?: string[];
}

export interface PermissionGroup {
  id: string;
  label: string;
  permissions: {
    id: string;
    value: string;
    label: string;
  }[];
}

export interface PermissionEditProps {
  value: PermissionValue;
  onChange: (value: PermissionValue) => void;
  onSaveClick: () => void;
  onCancel: () => void;
  saving: boolean;
  templates: PermissionTemplate[];
  onTemplateClick: (id: string) => void;
}

export interface PermissionEditPageProps {
  userId?: string;
}