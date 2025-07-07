import { InviteFormUI } from "./InviteFormUI";
import { useInviteForm } from "../hooks/useInviteForm";

interface InviteFormProps {
  onClose: () => void;
  onInviteSuccess: () => void;
}

export function InviteForm({ onClose, onInviteSuccess }: InviteFormProps) {
  const {
    email,
    setEmail,
    permissions,
    handleTogglePermission,
    loading,
    error,
    inviteStatus,
    selectedRole,
    setSelectedRole,
    handleInvite,
    showRoleSelector,
    showPermissionsSection,
  } = useInviteForm({ onInviteSuccess });

  return (
    <InviteFormUI
      email={email}
      setEmail={setEmail}
      permissions={permissions}
      handleTogglePermission={handleTogglePermission}
      loading={loading}
      error={error}
      inviteStatus={inviteStatus}
      selectedRole={selectedRole}
      setSelectedRole={setSelectedRole}
      handleInvite={handleInvite}
      showRoleSelector={showRoleSelector}
      showPermissionsSection={showPermissionsSection}
      onClose={onClose}
    />
  );
}
