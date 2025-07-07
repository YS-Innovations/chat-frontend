import { PermissionEdit } from "@/pages/permissions/edit-page/components";
import { PERMISSION_GROUPS } from "@/pages/permissions/types/types";
import { Badge } from "@/components/ui/badge";
import { Pencil, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PermissionGroupSection } from "./PermissionViewSection";

interface MemberPermissionsTabContentProps {
  canViewPermissions: boolean;
  isEditingPermissions: boolean;
  tempPermissions: Record<string, boolean>;
  setTempPermissions: (perms: Record<string, boolean>) => void;
  handleSaveClick: () => void;
  setIsEditingPermissions: (editing: boolean) => void;
  loading: boolean;
  templates: any[];
  handleTemplateClick: (templateId: string) => void;
  matchingTemplate: any | null;
  canEditPermissions: boolean;
  setShowPermissionHistoryModal: (show: boolean) => void;
}

export function MemberPermissionsTabContent({
  canViewPermissions,
  isEditingPermissions,
  tempPermissions,
  setTempPermissions,
  handleSaveClick,
  setIsEditingPermissions,
  loading,
  templates,
  handleTemplateClick,
  matchingTemplate,
  canEditPermissions,
  setShowPermissionHistoryModal
}: MemberPermissionsTabContentProps) {
  if (!canViewPermissions) return null;

  return isEditingPermissions ? (
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
    <div className="flex-1 overflow-auto pt-4">
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
              History
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

      {matchingTemplate && (
        <div className="mb-4 flex items-center">
          <span className="text-sm text-muted-foreground mr-2">
            Using template:
          </span>
          <Badge
            variant="secondary"
            className="cursor-pointer hover:bg-accent"
            onClick={() => handleTemplateClick(matchingTemplate.id)}
          >
            {matchingTemplate.policyName}
          </Badge>
        </div>
      )}

      <div className="space-y-4">
        {PERMISSION_GROUPS.map(group => (
          <PermissionGroupSection 
            key={group.id} 
            group={group} 
            tempPermissions={tempPermissions} 
          />
        ))}
      </div>
    </div>
  );
}