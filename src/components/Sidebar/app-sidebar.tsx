// src/components/Sidebar/app-sidebar.tsx
import * as React from "react";
import { useSidebar } from "@/components/ui/sidebar";
import { Sidebar, SidebarRail } from "@/components/ui/sidebar";
import { usePermissions } from "@/context/permissions";
import { SidebarContentArea } from "./components/Sidebar/SidebarContentArea";
import { SidebarEmptyState } from "./components/Sidebar/SidebarEmptyState";
import { SidebarFooterArea } from "./components/Sidebar/SidebarFooterArea";
import { navMainItems } from "./components/Nav/nav-items";
import type { NavItem } from "./components/Nav/types/nav-types";
import { useChannels } from "./components/Nav/hooks/use-channels";

export function AppSidebar(props: React.ComponentProps<typeof Sidebar>) {
  const { isCollapsed } = useSidebar();
  const { hasPermission, isLoading: permissionsLoading, role } = usePermissions();
  const { channels, loading: channelsLoading } = useChannels();

  const filteredItems = React.useMemo(() => {
  if (permissionsLoading) return [];

  // Create channels menu items
  const channelItems = channels.map(channel => ({
    title: channel.channelSettings?.name || `Channel ${channel.id.slice(0, 8)}`,
    url: `/app/channels/${channel.id}`,
    permission: "channel-access",
  }));

  // Add "Manage Channels" item
  const manageChannelsItem = {
    title: "Manage Channels",
    url: "/app/channel-settings",
    permission: "channel-settings-access",
  };

  const itemsWithChannels = navMainItems.map(item => {
    if (item.title === "Channels") {
      // Only add Channels section if there are channels or the user has permission
      if (channels.length > 0) {
        return {
          ...item,
          items: [
            ...channelItems,
            manageChannelsItem
          ]
        };
      }
      return null; // Skip adding "Channels" item when there are no channels
    }
    return item;
  }).filter(Boolean); // Remove any null items

  return itemsWithChannels
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
    .filter(Boolean) as NavItem[];
}, [hasPermission, permissionsLoading, channels]);


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
      <SidebarContentArea 
        filteredItems={filteredItems} 
        isLoading={permissionsLoading || channelsLoading} 
        isCollapsed={isCollapsed} 
      />
      <SidebarFooterArea />
      <SidebarRail />
    </Sidebar>
  );
}