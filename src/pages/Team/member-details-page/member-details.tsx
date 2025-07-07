// src/pages/Team/member-details-page/member-details.tsx
"use client";

import { useMemberDetails } from "./hooks/useMemberDetails";
import { TemplatePermissionsModal } from "@/pages/permissions/components/template-permissions-modal";
import { SaveOptionsModal } from "@/pages/permissions/components/save-options-modal";
import type { Member, Role } from "../types";
import { MemberDetailsHeader } from "./components/MemberDetailsHeader";
import { MemberProfile } from "./components/MemberProfile";
import { MemberActions } from "./components/RoleActions";
import { MemberDetailsTabs } from "./tabs/Tabs";

interface MemberDetailsProps {
  member: Member;
  onClose: () => void;
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
  onUpdatePermissions,
  loading = false,
  onRoleUpdate,
}: MemberDetailsProps) {
  const {
    state: {
      isEditingPermissions,
      tempPermissions,
      deleting,
      showSaveOptions,
      templates,
      role,
      selectedTemplate,
      showTemplateModal,
      matchingTemplate,
      changingRole,
      activeTab,
      loginHistory,
      permissionHistory,
      showPermissionHistoryModal,
      canDelete,
      canViewPermissions,
      canEditPermissions
    },
    actions: {
      setTempPermissions,
      setIsEditingPermissions,
      setShowSaveOptions,
      setShowTemplateModal,
      setActiveTab,
      setShowPermissionHistoryModal,
      handleDelete,
      savePermissions,
      handleSaveClick,
      handleChangeRole,
      handleTemplateClick
    }
  } = useMemberDetails(member, onClose, onUpdatePermissions, onRoleUpdate);

  return (
    <div className="h-full flex flex-col">
      <MemberDetailsHeader onClose={onClose} />
      <MemberProfile member={member} />
      <MemberActions
        canDelete={canDelete}
        deleting={deleting}
        role={role}
        memberRole={member.role}
        changingRole={changingRole}
        handleDelete={handleDelete}
        handleChangeRole={handleChangeRole}
      />
      <MemberDetailsTabs
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        member={member}
        loginHistory={loginHistory}
        permissionHistory={permissionHistory}
        showPermissionHistoryModal={showPermissionHistoryModal}
        setShowPermissionHistoryModal={setShowPermissionHistoryModal}
        canViewPermissions={canViewPermissions}
        isEditingPermissions={isEditingPermissions}
        tempPermissions={tempPermissions}
        setTempPermissions={setTempPermissions}
        handleSaveClick={handleSaveClick}
        setIsEditingPermissions={setIsEditingPermissions}
        loading={loading}
        templates={templates}
        handleTemplateClick={handleTemplateClick}
        matchingTemplate={matchingTemplate}
        canEditPermissions={canEditPermissions}
      />

      <TemplatePermissionsModal
        template={selectedTemplate}
        open={showTemplateModal}
        onClose={() => setShowTemplateModal(false)}
        onUse={(perms, action, templateName) => {
          if (action === 'apply') {
            savePermissions(perms);
          } else if (action === 'saveAsTemplate' && templateName) {
            savePermissions(perms, true, templateName);
          }
          setShowTemplateModal(false);
        }}
      />

      <SaveOptionsModal
        open={showSaveOptions}
        onClose={() => setShowSaveOptions(false)}
        onSaveForUser={() => savePermissions(tempPermissions)}
        onSaveAsTemplate={(name) => savePermissions(tempPermissions, true, name)}
        templates={templates}
        permissions={tempPermissions}
        onViewTemplate={handleTemplateClick}
      />
    </div>
  );
}