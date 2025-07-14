import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, X } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import type { Role } from "../types/types";
import { PERMISSION_GROUPS } from "@/pages/features/permissions/types/types";

interface InviteFormUIProps {
  email: string;
  setEmail: (value: string) => void;
  permissions: Record<string, boolean>;
  handleTogglePermission: (permissionValue: string, checked: boolean) => void;
  loading: boolean;
  error: string;
  inviteStatus: string;
  selectedRole: Role;
  setSelectedRole: (role: Role) => void;
  handleInvite: () => void;
  showRoleSelector: boolean;
  showPermissionsSection: boolean;
  onClose: () => void;
}

export function InviteFormUI({
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
  onClose,
}: InviteFormUIProps) {
  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center p-4 border-b">
        <h2 className="text-lg font-semibold">Invite New Member</h2>
        <Button variant="ghost" size="icon" onClick={onClose}>
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
                <p className="text-sm text-muted-foreground mb-2">Select role</p>
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value as Role)}
                  className="w-full p-2 border rounded"
                >
                  <option value="AGENT">Agent</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>
            )}
            {showPermissionsSection && selectedRole === 'AGENT' && (
              <div className="border rounded-lg p-4">
                <h3 className="font-medium mb-4">Assign Permissions</h3>
                <div className="space-y-4">
                  {PERMISSION_GROUPS.map((group) => (
                    <div key={group.id} className="border rounded-lg p-4">
                      <h4 className="font-medium mb-3">{group.label}</h4>
                      <div className="space-y-2">
                        {group.permissions.map((permission) => {
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
          <Button onClick={handleInvite} disabled={loading} className="w-full sm:w-auto">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              "Send Invitation"
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
