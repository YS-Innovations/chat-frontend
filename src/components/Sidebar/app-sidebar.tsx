import * as React from "react";
import { useSidebar } from "@/components/ui/sidebar";
import { Sidebar, SidebarRail } from "@/components/ui/sidebar";
import { usePermissions } from "@/context/permissions";
import { SidebarContentArea } from "./components/Sidebar/SidebarContentArea";
import { SidebarEmptyState } from "./components/Sidebar/SidebarEmptyState";
import { SidebarFooterArea } from "./components/Sidebar/SidebarFooterArea";
import { navMainItems } from "./components/Nav/nav-items";
import type { NavItem } from "./components/Nav/types/nav-types";

export function AppSidebar(props: React.ComponentProps<typeof Sidebar>) {
  const { isCollapsed } = useSidebar();
  const { hasPermission, isLoading, role } = usePermissions();

const filteredItems = React.useMemo(() => {
  if (isLoading) return [];

  return navMainItems
    .map(item => {
      if (item.items) {
        const filteredChildItems = item.items.filter(
          subItem => !subItem.permission || hasPermission(subItem.permission)
        );

        if (
          (item.permission ? hasPermission(item.permission) : true) ||
          filteredChildItems.length > 0
        ) {
          return {
            ...item,
            items: filteredChildItems,
          };
        }

        return null;
      }

      if (!item.permission || hasPermission(item.permission)) {
        return item;
      }

      return null;
    })
    .filter(Boolean) as NavItem[]; // cast to fix TypeScript error
}, [hasPermission, isLoading]);


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