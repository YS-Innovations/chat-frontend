import { useState, useCallback } from "react";
import { toast } from "sonner";
import type { Role } from "../types";
import { useAuth0 } from "@auth0/auth0-react";

export function useRoleChange(memberId: string, onRoleUpdate: (newRole: Role) => void) {
  const [changingRole, setChangingRole] = useState(false);
  const { getAccessTokenSilently } = useAuth0();

  const handleChangeRole = useCallback(async (newRole: Role) => {
    setChangingRole(true);
    try {
      const token = await getAccessTokenSilently();
      const response = await fetch(
        `http://localhost:3000/auth/role/${memberId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ newRole }),
        }
      );
      if (!response.ok) throw new Error('Failed to change role');
      onRoleUpdate(newRole);
      toast.success(`User is now ${newRole === 'COADMIN' ? 'Co-Admin' : 'Agent'}`);
    } catch (err) {
      console.error('Role change failed:', err);
      toast.error(err instanceof Error ? err.message : 'Failed to change role');
    } finally {
      setChangingRole(false);
    }
  }, [memberId, getAccessTokenSilently, onRoleUpdate]);

  return { handleChangeRole, changingRole };
}
