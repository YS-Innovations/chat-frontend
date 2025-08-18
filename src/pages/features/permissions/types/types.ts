export type Permission = {
  id: string;
  label: string;
  value: string;
};

export type PermissionGroup = {
  id: string;
  label: string;
  value: string;
  permissions: {
    id: string;
    value: string;
    label: string;
  }[];
};

export type PermissionValue = Record<string, boolean>;

export interface PermissionTemplate {
  id: string;
  policyName: string;
  permissions?: string[];
  policy: Record<string, boolean>;
  createdAt: string;
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
export const PERMISSION_GROUPS: PermissionGroup[] = [
  {
    id: 'inbox',
    label: 'Inbox Page',
    value: 'inbox-access',
    permissions: [{id: 'inbox',
    label: 'Inbox Page',
    value: 'inbox-access',}],
  },
  {
    id: 'Team',
    label: 'Team',
    value: 'team',
    permissions: [
      { id: 'member-list', label: 'Member List Page Allow', value: 'member-list' },
      { id: 'member-details', label: 'Member Details Page Allow', value: 'member-details' },
      { id: 'invite-form', label: 'Invite Form Page Allow', value: 'invite-form' },
      { id: 'permission-view', label: 'Permission View Page Allow', value: 'permission-view' },
      { id: 'permission-edit', label: 'Permission Edit Page Allow', value: 'permission-edit' },
      { id: 'user-delete', label: 'Delete User', value: 'user-delete' },
      { id: 'invite-pending-members-view', label: 'View-invite-pending-Members', value: 'inactive-members-view' },
      { id: 'resend-invitation', label: 'Resend Invitations', value: 'resend-invitation' },
      { id: 'permission_templates', label: 'View Permission Templates', value: 'permission-templates' },
    ],
  },
  {
    id: 'conversation',
    label: 'Conversation Page',
    value: 'conversation-access',
    permissions: [
      { id: 'all', label: 'All Page Allow', value: 'conversation-list' },
      { id: 'unread-form', label: 'Unread Page Allow', value: 'conversation-unread' },
      { id: 'read-view', label: 'Read View Page Allow', value: 'conversation-archived' },
    ],
  },
  {
    id: 'documentation',
    label: 'Documentation Access',
    value: 'documentation-access',
    permissions: [
      { id: 'intro', label: 'Docs Intro', value: 'docs-intro' },
      { id: 'get_started', label: 'Docs Get Started', value: 'docs-get-started' },
    ],
  },
  {
    id: 'settings',
    label: 'Settings',
    value: 'settings-access',
    permissions: [
      { id: 'general', label: 'General Settings', value: 'settings-general' },
      { id: 'billing', label: 'Billing Settings', value: 'settings-billing' },
      { id: 'onboarding', label: 'onboarding', value: 'onboarding' },
      { id: 'canned-responses', label: 'canned-responses', value: 'canned-responses' },
      { id: 'channel-settings', label: 'channel-settings', value: 'chennelsettings' },
    ],
  },

];
