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
    label: 'coversation Page',
    value: 'conversation',
    permissions: [
      { id: 'all', label: 'all Page Allow', value: 'all-list' },
      { id: 'mention-details', label: 'metion Details Page Allow', value: 'mention-details' },
      { id: 'unread-form', label: 'unread Page Allow', value: 'unread' },
      { id: 'read-view', label: 'read View Page Allow', value: 'read-view' },
    ],
  }
];