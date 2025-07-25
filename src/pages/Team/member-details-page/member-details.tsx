// src/pages/contacts/components/member-details.tsx
"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { getInitials } from "@/lib/utils";
import { Mail, X, Pencil, Check } from "lucide-react";
import type { Member, Role, UserLoginHistory } from "../types/types";
import { usePermissions } from "@/context/permissions";
import { useAuth0 } from "@auth0/auth0-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { LoginHistory } from "../login-history/login-history";
import { PermissionEdit } from "@/pages/features/permissions/Layout";
import { PERMISSION_GROUPS } from "@/pages/features/permissions/types/types";
import { TemplatePermissionsModal } from "@/pages/features/permissions/Dialog/PolicyPermissions";
import { SaveOptionsModal } from "@/pages/features/permissions/Dialog/SaveOptions";
import { updateTemplate } from "@/pages/features/permissions/Api/api";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { DeleteUserButton } from "./delete/components/DeleteUserButton";
import { PermissionHistorySection } from "../permission-history/PermissionHistorySection";

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
  const { getAccessTokenSilently } = useAuth0();
  const [showSaveOptions, setShowSaveOptions] = useState(false);
  const [templates, setTemplates] = useState<any[]>([]);
  const [templatesLoading, setTemplatesLoading] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<any | null>(null);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [changingRole, setChangingRole] = useState(false);
  const [activeTab, setActiveTab] = useState('permissions');
  const [loginHistory, setLoginHistory] = useState<{ history: UserLoginHistory[]; total: number; }>({ history: [], total: 0 });

  const hasChanges = useMemo(() => {
    return JSON.stringify(tempPermissions) !== JSON.stringify(permissions);
  }, [tempPermissions, permissions]);

  // Use ref to track if we're already fetching data
  const isFetchingRef = useRef(false);

  const fetchHistories = async () => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;

    try {
      const token = await getAccessTokenSilently();
      const page = 1;
      const perPage = 5;

      // Fetch login history
      const loginRes = await fetch(
        `http://localhost:3000/auth/user/${member.id}/login-history?skip=${(page - 1) * perPage}&take=${perPage}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!loginRes.ok) throw new Error('Failed to fetch login history');
      const loginData = await loginRes.json();
      setLoginHistory({
        history: loginData.history || [],
        total: loginData.total || 0
      });

    } catch (error) {
      console.error('Error fetching histories:', error);
    } finally {
      isFetchingRef.current = false;
    }
  };

  useEffect(() => {
    if (!member) return;
    fetchHistories();
  }, [member, getAccessTokenSilently]);

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
        description: `User is now ${newRole === 'ADMIN' ? 'Admin' : 'Agent'}`,
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

  const canViewPermissions = role === 'OWNER' || hasPermission('permission-view');
  const canEditPermissions = useMemo(() => {
    if (role === 'OWNER' && member.role === 'OWNER') return false;
    if (role === 'ADMIN' && member.role === 'ADMIN') return false;
    return role === 'OWNER' || hasPermission('permission-edit');
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
          variant={member.role === 'OWNER' ? 'destructive' : 'default'}
          className="mt-3"
        >
          {member.role}
        </Badge>
      </div>
      <div className="flex gap-2 justify-end px-4 mb-4">
        <DeleteUserButton
          userId={member.id}
          userRole={member.role}
          onSuccess={onClose}
        />
        {role === 'OWNER' && (
          <>
            {member.role === 'AGENT' && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleChangeRole('ADMIN')}
                disabled={changingRole}
              >
                {changingRole ? 'Changing...' : 'Change to Admin'}
              </Button>
            )}
            {member.role === 'ADMIN' && (
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
          <LoginHistory
            history={loginHistory.history}
            total={loginHistory.total}
            memberId={member.id}
          />
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
                      <PermissionHistorySection memberId={member.id} />

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



                <div className="space-y-4">
                  <Accordion type="multiple" className="w-full space-y-3">
                    {PERMISSION_GROUPS.map(group => {
                      const groupPermissions = group.permissions.filter(p =>
                        tempPermissions[p.value]
                      );

                      if (groupPermissions.length === 0) return null;

                      return (
                        <AccordionItem
                          key={group.id}
                          value={group.id}
                          className="border rounded-lg shadow-sm bg-white dark:bg-muted"
                        >
                          <AccordionTrigger className="px-4 py-3 text-left font-semibold text-sm hover:bg-muted/50 transition-colors">
                            {group.label}
                          </AccordionTrigger>

                          <AccordionContent className="px-4 pb-4 pt-2">
                            <div className="space-y-2">
                              {groupPermissions.map(permission => (
                                <div
                                  key={permission.id}
                                  className="flex items-center gap-2 px-3 py-2 bg-green-100 dark:bg-green-900/40 rounded-md text-sm"
                                >
                                  <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
                                  <span className="text-muted-foreground">{permission.label}</span>
                                </div>
                              ))}
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      );
                    })}
                  </Accordion>
                </div>
              </div>
            )
          )}
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
              toast.success('Template updated successfully');
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