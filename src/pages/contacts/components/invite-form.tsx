import { useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, X } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { PERMISSION_GROUPS } from "@/pages/permissions/types";
import type { Role } from "../types";
import { usePermissions } from "@/context/PermissionsContext";

interface InviteFormProps {
  onClose: () => void;
  onInviteSuccess: () => void;
}

export function InviteForm({ onClose, onInviteSuccess }: InviteFormProps) {
  const { getAccessTokenSilently } = useAuth0();
  const [email, setEmail] = useState('');
  const [permissions, setPermissions] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [inviteStatus, setInviteStatus] = useState('');
  const [selectedRole, setSelectedRole] = useState<Role>('AGENT');
  const { role: currentUserRole } = usePermissions();

  const handleTogglePermission = (permissionValue: string, checked: boolean) => {
    let updated = { ...permissions, [permissionValue]: checked };

    // Enforce dependency: permission-edit implies permission-view
    if (permissionValue === 'permission-edit' && checked) {
      updated['permission-view'] = true;
    }

    setPermissions(updated);
  };

  const handleInvite = async () => {
    if (!email) {
      setError('Email is required');
      return;
    }

    if (selectedRole === 'AGENT') {
      const hasPermission = Object.values(permissions).some(value => value);
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
      const response = await fetch('http://localhost:3000/auth/invite', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          email,
          role: selectedRole,
          permissions: selectedRole === 'COADMIN' ? {} : permissions
        }),
      });

      if (response.ok) {
        setEmail('');
        setPermissions({});
        setInviteStatus('Invitation sent successfully');
        onInviteSuccess();
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to send invitation');
      }
    } catch (err) {
      setError('Failed to send invitation');
    } finally {
      setLoading(false);
    }
  };
  const showRoleSelector = currentUserRole === 'ADMIN';

  // Determine if permissions section should be shown
  const showPermissionsSection =
    !showRoleSelector || // Non-admin users always see permissions
    (showRoleSelector && selectedRole === 'AGENT');
  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center p-4 border-b">
        <h2 className="text-lg font-semibold">Invite New Member</h2>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex-1 p-6 overflow-auto">
        {inviteStatus ? (
          <Alert className="mb-4">
            <AlertDescription>{inviteStatus}</AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-6 py-4">
            <div>
              <p className="text-sm text-muted-foreground mb-2">
                Enter email address to send invitation
              </p>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="member@example.com"
              />
            </div>
            {showRoleSelector && (
              <div className="mb-4">
                <p className="text-sm text-muted-foreground mb-2">
                  Select role
                </p>
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value as Role)}
                  className="w-full p-2 border rounded"
                >
                  <option value="AGENT">Agent</option>
                  <option value="COADMIN">Co-Admin</option>
                </select>
              </div>
            )}
            {selectedRole === 'AGENT' && (
              <div className="border rounded-lg p-4">
                <h3 className="font-medium mb-4">Assign Permissions</h3>
                <div className="space-y-4">
                  {PERMISSION_GROUPS.map(group => (
                    <div key={group.id} className="border rounded-lg p-4">
                      <h4 className="font-medium mb-3">{group.label}</h4>
                      <div className="space-y-2">
                        {group.permissions.map(permission => {
                          // Disable permission-view if permission-edit is enabled
                          const isViewPermission = permission.value === 'permission-view';
                          const isDisabled = isViewPermission && permissions['permission-edit'];

                          return (
                            <div key={permission.id} className="flex items-center">
                              <Checkbox
                                checked={permissions[permission.value] || false}
                                onCheckedChange={(checked) =>
                                  handleTogglePermission(permission.value, !!checked)
                                }
                                className="mr-2"
                                disabled={isDisabled}
                              />
                              <label>{permission.label}</label>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {error && (
          <Alert variant="destructive" className="mt-4">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </div>

      <div className="p-4 border-t flex justify-end">
        {!inviteStatus && (
          <Button
            onClick={handleInvite}
            disabled={loading}
            className="w-full sm:w-auto"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : 'Send Invitation'}
          </Button>
        )}
      </div>
    </div>
  );
}