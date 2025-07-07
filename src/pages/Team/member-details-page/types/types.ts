import { PERMISSION_GROUPS } from "@/pages/permissions/types/types";

export interface MemberDetailsTabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  member: any;
  loginHistory: any[];
  permissionHistory: any[];
  showPermissionHistoryModal: boolean;
  setShowPermissionHistoryModal: (show: boolean) => void;
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
}

export interface PermissionGroupSectionProps {
  group: typeof PERMISSION_GROUPS[0];
  tempPermissions: Record<string, boolean>;
}