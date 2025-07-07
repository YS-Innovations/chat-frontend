import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MemberDetailsTabContent } from "./DetailsTab";
import { MemberPermissionsTabContent } from "./PermissionsTab";
import { PermissionHistoryDialog } from "../dialog/PermissionHistoryDialog";
import type { MemberDetailsTabsProps } from "../types/types";

export function MemberDetailsTabs({
  activeTab,
  setActiveTab,
  member,
  loginHistory,
  permissionHistory,
  showPermissionHistoryModal,
  setShowPermissionHistoryModal,
  ...permissionsProps
}: MemberDetailsTabsProps) {
  return (
    <Tabs
      value={activeTab}
      onValueChange={setActiveTab}
      className="px-4 flex flex-col flex-1"
    >
      <TabsList className="w-full">
        <TabsTrigger value="details" className="flex-1">Details</TabsTrigger>
        <TabsTrigger value="permissions" className="flex-1">Permissions</TabsTrigger>
      </TabsList>

      <TabsContent value="details">
        <MemberDetailsTabContent member={member} loginHistory={loginHistory} />
      </TabsContent>

      <TabsContent value="permissions">
        <MemberPermissionsTabContent 
          setShowPermissionHistoryModal={setShowPermissionHistoryModal}
          {...permissionsProps}
        />
      </TabsContent>

      <PermissionHistoryDialog
        showPermissionHistoryModal={showPermissionHistoryModal}
        setShowPermissionHistoryModal={setShowPermissionHistoryModal}
        permissionHistory={permissionHistory}
      />
    </Tabs>
  );
}