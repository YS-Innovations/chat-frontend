import { useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import type { Role } from "../types/types";
import { usePermissions } from "@/context/permissions";

import { togglePermission } from "../utils/invite-helpers";
import { sendInvite } from "../api/invite";



export function useInviteForm() {
  const { getAccessTokenSilently } = useAuth0();
  const { role: currentUserRole } = usePermissions();

  const [email, setEmail] = useState('');
  const [permissions, setPermissions] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [inviteStatus, setInviteStatus] = useState('');
  const [selectedRole, setSelectedRole] = useState<Role>('AGENT');

  const handleTogglePermission = (permission: string, checked: boolean) => {
    setPermissions(togglePermission(permissions, permission, checked));
  };

  const handleInvite = async () => {
    if (!email) {
      setError('Email is required');
      return;
    }

    if (selectedRole === 'AGENT') {
      const hasPermission = Object.values(permissions).some(Boolean);
      if (!hasPermission) {
        setError('At least one permission must be selected for Agents');
        return;
      }
    }

    try {
      setLoading(true);
      setError('');
      setInviteStatus('');

      const token = await getAccessTokenSilently();
      const response = await sendInvite({
        email,
        role: selectedRole,
        permissions: selectedRole === 'ADMIN' ? {} : permissions,
        token,
      });

      if (response.ok) {
        setEmail('');
        setPermissions({});
        setInviteStatus('Invitation sent successfully');
      } else {
        const data = await response.json();
        setError(data.message || 'Failed to send invitation');
      }
    } catch {
      setError('Failed to send invitation');
    } finally {
      setLoading(false);
    }
  };

  const showRoleSelector = currentUserRole === 'OWNER';
  const showPermissionsSection = !showRoleSelector || selectedRole === 'AGENT';

  return {
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
  };
}
