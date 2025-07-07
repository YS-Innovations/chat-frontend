import { useState, useEffect, useMemo, useCallback } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { toast } from "sonner";
import type { Member } from "../../types/types";
import { usePermissions } from "@/context/permissions";
import { useHistories } from "../../hooks/useHistories";
import { useTemplates } from "../../hooks/useTemplates";
import { useDeleteMember } from "../../hooks/useDeleteMember";
import { useRoleChange } from "../../hooks/useRoleChange";
import { usePermissionsLogic } from "../../hooks/usePermissionsLogic";

export function useMemberDetails(
  member: Member,
  onClose: () => void,
  onUpdatePermissions: any,
  onRoleUpdate: any
) {
  const [isEditingPermissions, setIsEditingPermissions] = useState(false);
  const [tempPermissions, setTempPermissions] = useState<Record<string, boolean>>({});
  const [showSaveOptions, setShowSaveOptions] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<any | null>(null);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [activeTab, setActiveTab] = useState('permissions');
  const [showPermissionHistoryModal, setShowPermissionHistoryModal] = useState(false);
  const { role, hasPermission } = usePermissions();
  const { getAccessTokenSilently } = useAuth0();

  const hasChanges = useMemo(() => {
    return JSON.stringify(tempPermissions) !== JSON.stringify(member.permissions);
  }, [tempPermissions, member.permissions]);

  const {
    loginHistory,
    permissionHistory,
    fetchHistories
  } = useHistories(member.id);

  const {
    templates,
    templatesLoading,
    matchingTemplate,
    fetchTemplates,
    handleTemplateClick
  } = useTemplates(member, getAccessTokenSilently, isEditingPermissions);

  const {
    handleDelete,
    deleting
  } = useDeleteMember(member.id, onClose);

  const {
    handleChangeRole,
    changingRole
  } = useRoleChange(member.id, onRoleUpdate);

  const {
    canDelete,
    canEditPermissions,
    canViewPermissions
  } = usePermissionsLogic(role, member, hasPermission);

  const savePermissions = useCallback(async (
    perms: Record<string, boolean>,
    saveAsTemplate?: boolean,
    templateName?: string
  ) => {
    try {
      await onUpdatePermissions(perms, saveAsTemplate, templateName);
      setTempPermissions(perms);
      setIsEditingPermissions(false);
      toast.success(saveAsTemplate ? "Template saved and applied" : "Permissions updated");
    } catch (error: any) {
      console.error('Save failed:', error);
      toast.error(error.message || "Error saving permissions");
    }
  }, [onUpdatePermissions]);

  const handleSaveClick = useCallback(() => {
    if (!hasChanges) {
      savePermissions(tempPermissions);
    } else {
      setShowSaveOptions(true);
    }
  }, [hasChanges, savePermissions, tempPermissions]);

  useEffect(() => {
    if (member) {
      setTempPermissions(member.permissions || {});
      fetchHistories(getAccessTokenSilently);
    }
  }, [member, fetchHistories, getAccessTokenSilently]);

  useEffect(() => {
    if (isEditingPermissions) fetchTemplates();
  }, [isEditingPermissions, fetchTemplates]);

  return {
    state: {
      isEditingPermissions,
      tempPermissions,
      deleting,
      showSaveOptions,
      templates,
      templatesLoading,
      selectedTemplate,
      showTemplateModal,
      matchingTemplate,
      changingRole,
      activeTab,
      loginHistory,
      permissionHistory,
      showPermissionHistoryModal,
      hasChanges,
      canDelete,
      canViewPermissions,
      canEditPermissions,
      role
    },
    actions: {
      setTempPermissions,
      setIsEditingPermissions,
      setShowSaveOptions,
      setSelectedTemplate,
      setShowTemplateModal,
      setActiveTab,
      setShowPermissionHistoryModal,
      handleDelete,
      savePermissions,
      handleSaveClick,
      handleChangeRole,
      handleTemplateClick
    }
  };
}
