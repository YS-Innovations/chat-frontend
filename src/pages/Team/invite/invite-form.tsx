import { InviteFormUI } from "./InviteFormUI";
import { useInviteForm } from "../hooks/useInviteForm";

export function InviteForm() {
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
  } = useInviteForm();

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
    
    />
  );
}
