import * as React from "react";
import { useSidebar } from "@/components/ui/sidebar";
import {
  BookOpen,
  Bot,
  Settings2,
  SquareTerminal,
  Users,
} from "lucide-react";

import { NavMain } from "@/components/Sidebar/nav-main";
import { NavUser } from "@/components/Sidebar/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarRail,
} from "@/components/ui/sidebar";
import { usePermissions } from "@/context/PermissionsContext";
import { Skeleton } from "@/components/ui/skeleton";

const navMainItems = [
  {
    title: "Inbox",
    url: "/app",
    icon: SquareTerminal,
    isActive: true,
    permission: "inbox-access"
  },
  {
    title: "Conversation",
    url: "#",
    icon: Bot,
    permission: "conversation-access",
    items: [
      { title: "All Conversation", url: "/app/conversations", permission: "conversation-list" },
      { title: "Unread", url: "/app/conversations/unread", permission: "conversation-unread" },
      { title: "Archived", url: "/app/conversations/archived", permission: "conversation-archived" },
    ],
  },
  {
    title: "Contacts",
    url: "/app/contacts",
    icon: SquareTerminal,
    isActive: false,
    permission: "member-list"
  },
  {
    title: "Team",
    url: "#",
    icon: Users,
    permission: "team-access",
    items: [
      { title: "Members", url: "/app/team/members", permission: "member-list" },
      { title: "Permissions", url: "/app/team/permissions", permission: "permission-view" },
    ],
  },
  {
    title: "Documentation",
    url: "#",
    icon: BookOpen,
    permission: "documentation-access",
    items: [
      { title: "Introduction", url: "#", permission: "docs-intro" },
      { title: "Get Started", url: "#", permission: "docs-get-started" },
    ],
  },
  {
    title: "Settings",
    url: "#",
    icon: Settings2,
    permission: "settings-access",
    items: [
      { title: "General", url: "/app/settings/general", permission: "settings-general" },
      { title: "Billing", url: "/app/settings/billing", permission: "settings-billing" },
    ],
  },
];

export function AppSidebar(props: React.ComponentProps<typeof Sidebar>) {
  const { isCollapsed } = useSidebar();
  const { hasPermission, isLoading, role } = usePermissions();

  // Filter sidebar items based on permissions
  const filteredItems = React.useMemo(() => {
    if (isLoading) return [];
    
    return navMainItems
      .filter(item => {
        // Always show items without permission requirement
        if (!item.permission) return true;
        
        // Show item if user has the permission
        return hasPermission(item.permission);
      })
      .map(item => {
        // Filter sub-items if present
        if (item.items) {
          return {
            ...item,
            items: item.items.filter(subItem => 
              !subItem.permission || hasPermission(subItem.permission)
            ),
          };
        }
        return item;
      })
      .filter(item => {
        // Remove parent items with no visible children
        if (item.items && item.items.length === 0) return false;
        return true;
      });
  }, [hasPermission, isLoading]);

  if (role === "AGENT" && filteredItems.length === 0) {
    return (
      <Sidebar collapsible="icon" {...props}>
        <SidebarContent>
          <div className="flex items-center justify-center h-16 px-4 shrink-0">
            {isCollapsed ? (
              <div className="flex items-center justify-center w-8 h-8">
                <img
                  src="/eglelogo.jpg"
                  alt="CoConnect Logo"
                  className="w-8 h-8"
                />
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <img
                  src="/eglelogo.jpg"
                  alt="CoConnect Logo"
                  className="w-8 h-8"
                />
                <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
                  CoConnect
                </span>
              </div>
            )}
          </div>
          <div className="p-4 text-center text-muted-foreground text-sm">
            No accessible modules
          </div>
        </SidebarContent>
        <SidebarFooter>
          <NavUser />
        </SidebarFooter>
      </Sidebar>
    );
  }

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarContent>
        <div className="flex items-center justify-center h-16 px-4 shrink-0">
          {isCollapsed ? (
            <div className="flex items-center justify-center w-8 h-8">
              <img
                src="/eglelogo.jpg"
                alt="CoConnect Logo"
                className="w-8 h-8"
              />
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <img
                src="/eglelogo.jpg"
                alt="CoConnect Logo"
                className="w-8 h-8"
              />
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
                CoConnect
              </span>
            </div>
          )}
        </div>
        
        {isLoading ? (
          <div className="space-y-2 px-2">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-10 w-full rounded-md" />
            ))}
          </div>
        ) : (
          <NavMain items={filteredItems} />
        )}
      </SidebarContent>

      <SidebarFooter>
        <NavUser />
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}