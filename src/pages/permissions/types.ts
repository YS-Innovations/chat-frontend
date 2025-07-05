export type Permission = {
  id: string;
  label: string;
  value: string;
};

export type PermissionGroup = {
  id: string;
  label: string;
  value: string;
  permissions: Permission[];
};

export const PERMISSION_GROUPS: PermissionGroup[] = [
  {
    id: 'contact',
    label: 'Contact Page',
    value: 'contact',
    permissions: [
      { id: 'member-list', label: 'Member List Page Allow', value: 'member-list' },
      { id: 'member-details', label: 'Member Details Page Allow', value: 'member-details' },
      { id: 'invite-form', label: 'Invite Form Page Allow', value: 'invite-form' },
      { id: 'permission-view', label: 'Permission View Page Allow', value: 'permission-view' },
      { id: 'permission-edit', label: 'Permission Edit Page Allow', value: 'permission-edit' },
      { id: 'user-delete', label: 'Delete User', value: 'user-delete' },
      { id: 'inactive-members-view', label: 'View Inactive Members', value: 'inactive-members-view' },
      { id: 'resend-invitation', label: 'Resend Invitations', value: 'resend-invitation' },
    ],
  },
   {
    id: 'conversation',
    label: 'Conversation Page',
    value: 'conversation',
    permissions: [
      { id: 'all', label: 'All Page Allow', value: 'all-list' },
      { id: 'mention-details', label: 'Mention Details Page Allow', value: 'mention-details' },
      { id: 'unread-form', label: 'Unread Page Allow', value: 'unread' },
      { id: 'read-view', label: 'Read View Page Allow', value: 'read-view' },
    ],
  }
];

// Component props
export interface PermissionEditProps {
  value: Record<string, boolean>;
  onChange: (permissions: Record<string, boolean>) => void;
  onSaveClick: () => void;
  onCancel: () => void;
  saving: boolean;
  templates: any[];
  onTemplateClick: (templateId: string) => void;
}

export interface PermissionViewProps {
  selectedPermissions: Record<string, boolean>;
  onEdit: () => void;
  canEdit: boolean;
}

export interface SaveOptionsModalProps {
  open: boolean;
  onClose: () => void;
  onSaveForUser: () => void;
  onSaveAsTemplate: (templateName: string) => void;
  templates: any[];
  permissions: Record<string, boolean>;
  onViewTemplate: (templateId: string) => void;
}

export interface TemplatePermissionsModalProps {
  template: any;
  open: boolean;
  onClose: () => void;
  onUse: (permissions: Record<string, boolean>, action: 'apply' | 'saveAsTemplate', templateName?: string) => void;
}