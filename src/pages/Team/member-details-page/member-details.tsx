// src/pages/contacts/components/member-details.tsx
"use client";

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { getInitials } from "@/lib/utils";
import { Mail, X, Pencil, Check, Clock } from "lucide-react";
import type { Member, PermissionHistory, Role, UserLoginHistory } from "../types/types";
import { usePermissions } from "@/context/permissions";
import { useAuth0 } from "@auth0/auth0-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { LoginHistory } from "../login-history/login-history";
import { PermissionHistorys } from "../permission-history/permission-history";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PermissionEdit } from "@/pages/features/permissions/Layout";
import { PERMISSION_GROUPS } from "@/pages/features/permissions/types/types";
import { TemplatePermissionsModal } from "@/pages/features/permissions/Dialog/PolicyPermissions";
import { SaveOptionsModal } from "@/pages/features/permissions/Dialog/SaveOptions";
import { updateTemplate } from "@/pages/features/permissions/Api/api";

interface MemberDetailsProps {
  member: Member;
  onClose: () => void;
  permissions: Record<string, boolean>;
  onUpdatePermissions: (
    permissions: Record<string, boolean>,
    saveAsTemplate?: boolean,
    templateName?: string
  ) => Promise<void>;
  loading?: boolean;
  onRoleUpdate: (newRole: Role) => void;
}

export function MemberDetails({
  member,
  onClose,
  permissions,
  onUpdatePermissions,
  loading = false,
  onRoleUpdate,
}: MemberDetailsProps) {
  const [isEditingPermissions, setIsEditingPermissions] = useState(false);
  const [tempPermissions, setTempPermissions] = useState<Record<string, boolean>>(permissions);
  const { hasPermission, role } = usePermissions();
  const [deleting, setDeleting] = useState(false);
  const { getAccessTokenSilently } = useAuth0();
  const [showSaveOptions, setShowSaveOptions] = useState(false);
  const [templates, setTemplates] = useState<any[]>([]);
  const [templatesLoading, setTemplatesLoading] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<any | null>(null);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [changingRole, setChangingRole] = useState(false);
  const [activeTab, setActiveTab] = useState('permissions');
  const [loginHistory, setLoginHistory] = useState<UserLoginHistory[]>([]);
  const [permissionHistory, setPermissionHistory] = useState<PermissionHistory[]>([]);
  const [showPermissionHistoryModal, setShowPermissionHistoryModal] = useState(false);

  const hasChanges = useMemo(() => {
    return JSON.stringify(tempPermissions) !== JSON.stringify(permissions);
  }, [tempPermissions, permissions]);

  useEffect(() => {
    if (!member) return;

    const fetchHistories = async () => {
      try {
        const token = await getAccessTokenSilently();

        // Fetch login history
        const loginRes = await fetch(
          `http://localhost:3000/auth/user/${member.id}/login-history`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const loginData = await loginRes.json();
        setLoginHistory(loginData);

        // Fetch permission history
        const permRes = await fetch(
          `http://localhost:3000/auth/permissions/${member.id}/history`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const permData = await permRes.json();
        setPermissionHistory(permData);
      } catch (error) {
        console.error('Error fetching histories:', error);
      }
    };

    fetchHistories();
  }, [member, getAccessTokenSilently]);


  const canDelete = role === 'ADMIN' ||
    (hasPermission('user-delete') && member.role === 'AGENT');

  const handleDelete = async (e: React.MouseEvent, memberId: string) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this user?')) return;

    try {
      setDeleting(true);
      const token = await getAccessTokenSilently();
      await fetch(`http://localhost:3000/auth/members/${memberId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      onClose();
    } catch (error) {
      console.error('Delete failed:', error);
      toast("Delete failed", {
        description: "Could not delete user",
      });
    } finally {
      setDeleting(false);
    }
  };

  useEffect(() => {
    setTempPermissions(permissions);
    setIsEditingPermissions(false);
  }, [member.id, permissions]);

  const savePermissions = async (
    perms: Record<string, boolean>,
    saveAsTemplate?: boolean,
    templateName?: string
  ) => {
    try {
      await onUpdatePermissions(perms, saveAsTemplate, templateName);
      setTempPermissions(perms);
      setIsEditingPermissions(false);

      if (saveAsTemplate && templateName) {
        toast.success("Template saved and applied", {
          description: `"${templateName}" template created successfully`,
        });
      } else {
        toast.success("Permissions updated", {
          description: "Permissions saved successfully",
        });
      }
    } catch (error: any) {
      console.error('Save failed:', error);
      toast.error("Error saving permissions", {
        description: error.message || "An error occurred",
      });
    }
  };

  const handleSaveClick = () => {
    if (!hasChanges) {
      savePermissions(tempPermissions);
    } else {
      setShowSaveOptions(true);
    }
  };

  const handleChangeRole = async (newRole: Role) => {
    if (!member) return;

    setChangingRole(true);
    try {
      const token = await getAccessTokenSilently();
      const response = await fetch(
        `http://localhost:3000/auth/role/${member.id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ newRole }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to change role');
      }

      onRoleUpdate(newRole);

      toast.success("Role changed", {
        description: `User is now ${newRole === 'COADMIN' ? 'Co-Admin' : 'Agent'}`,
      });
    } catch (err) {
      console.error('Role change failed:', err);
      toast.error("Failed to change role", {
        description: err instanceof Error ? err.message : 'An error occurred',
      });
    } finally {
      setChangingRole(false);
    }
  };


  const handleSaveAsTemplate = async (templateName: string) => {
    await savePermissions(tempPermissions, true, templateName);
    fetchTemplates();
  };

  const fetchTemplates = async () => {
    setTemplatesLoading(true);
    try {
      const token = await getAccessTokenSilently();
      const response = await fetch('http://localhost:3000/auth/permissions/templates', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed to fetch templates');
      const data = await response.json();
      setTemplates(data);
    } catch (error) {
      console.error('Error fetching templates:', error);
      toast("Error loading templates", {
        description: "Could not load policy templates",
      });
    } finally {
      setTemplatesLoading(false);
    }
  };

  useEffect(() => {
    if (isEditingPermissions) {
      fetchTemplates();
    }
  }, [isEditingPermissions]);

  const handleTemplateClick = async (templateId: string) => {
    try {
      const token = await getAccessTokenSilently();
      const response = await fetch(`http://localhost:3000/auth/permissions/templates/${templateId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed to fetch template');
      const data = await response.json();
      setSelectedTemplate(data);
      setShowTemplateModal(true);
    } catch (error) {
      console.error('Error fetching template:', error);
      toast("Error loading template", {
        description: "Could not load policy template details",
      });
    }
  };

  const canViewPermissions = role === 'ADMIN' || hasPermission('permission-view');
  const canEditPermissions = useMemo(() => {
    // Hide for admins viewing other admins
    if (role === 'ADMIN' && member.role === 'ADMIN') return false;
    if (role === 'COADMIN' && member.role === 'COADMIN') return false;
    // Show for admins viewing non-admins
    return role === 'ADMIN' || hasPermission('permission-edit');
  }, [role, member.role, hasPermission]);

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center p-4 border-b">
        <h2 className="text-lg font-semibold">Member Details</h2>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex flex-col items-center mb-4 pt-4">
        <Avatar className="h-24 w-24 mb-4">
          {member.picture && (
            <AvatarImage src={member.picture} alt={member.name || member.email} />
          )}
          <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white text-3xl">
            {getInitials(member.name || member.email)}
          </AvatarFallback>
        </Avatar>

        <h3 className="text-xl font-bold">{member.name || 'No name'}</h3>
        <p className="text-muted-foreground flex items-center mt-1">
          <Mail className="h-4 w-4 mr-2" />
          {member.email}
        </p>

        <Badge
          variant={member.role === 'ADMIN' ? 'destructive' : 'default'}
          className="mt-3"
        >
          {member.role}
        </Badge>
      </div>
      <div className="flex gap-2 justify-end px-4 mb-4">
        {canDelete && (
          <Button
            variant="destructive"
            size="sm"
            onClick={(e) => handleDelete(e, member.id)}
            disabled={deleting}
          >
            {deleting ? 'Deleting...' : 'Delete'}
          </Button>
        )}
        {role === 'ADMIN' && (
          <>
            {member.role === 'AGENT' && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleChangeRole('COADMIN')}
                disabled={changingRole}
              >
                {changingRole ? 'Changing...' : 'Change to Co-Admin'}
              </Button>
            )}
            {member.role === 'COADMIN' && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleChangeRole('AGENT')}
                disabled={changingRole}
              >
                {changingRole ? 'Changing...' : 'Change to Agent'}
              </Button>
            )}
          </>
        )}
      </div>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="px-4 flex flex-col flex-1"
      >
        <TabsList className="w-full">
          <TabsTrigger value="details" className="flex-1">Details</TabsTrigger>
          <TabsTrigger value="permissions" className="flex-1">Permissions</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="flex-1 overflow-auto pt-4">
          <div className="border rounded-lg p-4">
            <h3 className="font-medium mb-4">Member Information</h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p>{member.email}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Role</p>
                <p>{member.role}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <p>{member.status}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Last Login</p>
                <p>{member.lastLogin ? new Date(member.lastLogin).toLocaleString() : 'Never'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Last Login</p>
                <p>{member.lastLogin ? new Date(member.lastLogin).toLocaleString() : 'Never'}</p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Phone Number</p>
                <p>{member.phoneNumber || 'Not provided'}</p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Account Status</p>
                <p>{member.blocked ? 'Blocked' : 'Active'}</p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Created At</p>
                <p>{member.createdAt ? new Date(member.createdAt).toLocaleString() : 'Unknown'}</p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Last Updated</p>
                <p>{member.updatedAt ? new Date(member.updatedAt).toLocaleString() : 'Unknown'}</p>
              </div>
            </div>
          </div>
          <LoginHistory history={loginHistory} />
        </TabsContent>

        <TabsContent value="permissions" className="flex-1 overflow-auto pt-4">
          {canViewPermissions && (
            isEditingPermissions ? (
              <PermissionEdit
                value={tempPermissions}
                onChange={setTempPermissions}
                onSaveClick={handleSaveClick}
                onCancel={() => setIsEditingPermissions(false)}
                saving={loading}
                templates={templates}
                onTemplateClick={handleTemplateClick}
              />
            ) : (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold">Permissions</h2>

                  {canEditPermissions && (
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowPermissionHistoryModal(true)}
                      >
                        <Clock className="h-4 w-4 mr-2" />
                        permission changes History
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsEditingPermissions(true)}
                      >
                        <Pencil className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                    </div>
                  )}
                </div>

                <Dialog open={showPermissionHistoryModal} onOpenChange={setShowPermissionHistoryModal}>
                  <DialogContent className="max-w-3xl max-h-[80vh] overflow-auto">
                    <DialogHeader>
                      <DialogTitle>Permission History</DialogTitle>
                    </DialogHeader>
                    <PermissionHistorys history={permissionHistory} />
                  </DialogContent>
                </Dialog>

                <div className="space-y-4">
                  {PERMISSION_GROUPS.map(group => {
                    const groupPermissions = group.permissions.filter(p =>
                      tempPermissions[p.value]
                    );

                    return groupPermissions.length > 0 && (
                      <div key={group.id} className="border rounded-lg p-4">
                        <h3 className="font-medium mb-3">{group.label}</h3>
                        <div className="space-y-2">
                          {groupPermissions.map(permission => (
                            <div key={permission.id} className="flex items-center p-2 rounded bg-green-50">
                              <Check className="h-4 w-4 text-green-500 mr-2" />
                              <span>{permission.label}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )
          )}
        </TabsContent>
        <TabsContent value="history">

        </TabsContent>
      </Tabs>

      <TemplatePermissionsModal
        template={selectedTemplate}
        open={showTemplateModal}
        onClose={() => setShowTemplateModal(false)}
        onUse={async (perms, action, templateName) => {
          const token = await getAccessTokenSilently();

          if (action === 'apply') {
            savePermissions(perms);
          } else if (action === 'saveAsTemplate' && templateName) {
            savePermissions(perms, true, templateName);
          } else if (action === 'updateTemplate' && selectedTemplate) {
            try {
              await updateTemplate(token, selectedTemplate.id, { policy: perms });
              // Show success toast/message
              toast.success('Template updated successfully');
              // Refresh templates if needed
              fetchTemplates();
            } catch (error) {
              toast.error('Failed to update template');
              console.error(error);
            }
          }
          setShowTemplateModal(false);
        }}
      />

      <SaveOptionsModal
        open={showSaveOptions}
        onClose={() => setShowSaveOptions(false)}
        onSaveForUser={() => savePermissions(tempPermissions)}
        onSaveAsTemplate={handleSaveAsTemplate}
        templates={templates}
        permissions={tempPermissions}
        onViewTemplate={handleTemplateClick}
      />
    </div>
  );
}