// src/pages/contacts/components/RoleSwitcher.tsx
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useAuth0 } from "@auth0/auth0-react";
import { toast } from "sonner";
import type { Role } from "../types/types";

interface RoleSwitcherProps {
  memberId: string;
  initialRole: Role;
  canSwitch: boolean;
  onRoleUpdate: (newRole: Role) => void;
}

export function RoleSwitcher({
  memberId,
  initialRole,
  canSwitch,
  onRoleUpdate,
}: RoleSwitcherProps) {
  const { getAccessTokenSilently } = useAuth0();
  const [currentRole, setCurrentRole] = useState<Role>(initialRole);
  const [changingRole, setChangingRole] = useState(false);

  useEffect(() => {
    setCurrentRole(initialRole);
  }, [initialRole]);

  const handleChangeRole = async (newRole: Role) => {
    if (!memberId) return;

    setChangingRole(true);
    try {
      const token = await getAccessTokenSilently();
      const response = await fetch(
        `http://localhost:3000/auth/role/${memberId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ newRole }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to change role");
      }

      setCurrentRole(newRole);
      onRoleUpdate(newRole);

      toast.success("Role changed", {
        description: `User is now ${newRole === "ADMIN" ? "Admin" : "Agent"}`,
      });
    } catch (err) {
      console.error("Role change failed:", err);
      toast.error("Failed to change role", {
        description:
          err instanceof Error ? err.message : "An error occurred",
      });
    } finally {
      setChangingRole(false);
    }
  };

  if (!canSwitch) return null;

  return (
    <>
      {currentRole === "AGENT" && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleChangeRole("ADMIN")}
          disabled={changingRole}
        >
          {changingRole ? "Changing..." : "Change to Admin"}
        </Button>
      )}
      {currentRole === "ADMIN" && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleChangeRole("AGENT")}
          disabled={changingRole}
        >
          {changingRole ? "Changing..." : "Change to Agent"}
        </Button>
      )}
    </>
  );
}
