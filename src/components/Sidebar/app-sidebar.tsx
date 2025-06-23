import * as React from "react";
import { useSidebar } from "@/components/ui/sidebar";
import { Sidebar, SidebarRail } from "@/components/ui/sidebar";
import { usePermissions } from "@/context/PermissionsContext";
import { SidebarContentArea } from "./components/Sidebar/SidebarContentArea";
import { SidebarEmptyState } from "./components/Sidebar/SidebarEmptyState";
import { SidebarFooterArea } from "./components/Sidebar/SidebarFooterArea";
import { navMainItems } from "./components/Nav/nav-items";
export function AppSidebar(props: React.ComponentProps<typeof Sidebar>) {
  const { isCollapsed } = useSidebar();
  const { hasPermission, isLoading, role } = usePermissions();

  const filteredItems = React.useMemo(() => {
    if (isLoading) return [];

    return navMainItems
      .filter(item => !item.permission || hasPermission(item.permission))
      .map(item => {
        if (item.items) {
          return {
            ...item,
            items: item.items.filter(subItem => !subItem.permission || hasPermission(subItem.permission)),
          };
        }
        return item;
      })
      .filter(item => !(item.items && item.items.length === 0));
  }, [hasPermission, isLoading, navMainItems]);

  if (role === "AGENT" && filteredItems.length === 0) {
    return (
      <Sidebar collapsible="icon" {...props}>
        <SidebarEmptyState isCollapsed={isCollapsed} />
        <SidebarFooterArea />
      </Sidebar>
    );
  }

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarContentArea filteredItems={filteredItems} isLoading={isLoading} isCollapsed={isCollapsed} />
      <SidebarFooterArea />
      <SidebarRail />
    </Sidebar>
  );
}
