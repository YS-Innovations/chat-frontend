// AppSidebar.tsx
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

const navMainItems = [
  {
    title: "Inbox",
    url: "/app",
    icon: SquareTerminal,
    isActive: true,
  },
  {
    title: "Conversation",
    url: "#",
    icon: Bot,
    items: [
      { title: "All Conversation", url: "/app/conversations" },
      { title: "Unread", url: "/app/conversations/unread" },
      { title: "Archived", url: "/app/conversations/archived" },
    ],
  },
  {
    title: "Contacts",
    url: "/app/contacts",
    icon: SquareTerminal,
    isActive: false,
  },
  {
    title: "Team",
    url: "/app/team",
    icon: Users,
    isActive: false,
  },
  {
    title: "Documentation",
    url: "#",
    icon: BookOpen,
    items: [
      { title: "Introduction", url: "#" },
      { title: "Get Started", url: "#" },
      { title: "Tutorials", url: "#" },
      { title: "Changelog", url: "#" },
    ],
  },
  {
    title: "Settings",
    url: "#",
    icon: Settings2,
    items: [
      { title: "General", url: "/app/settings/general" },
      { title: "Billing", url: "/app/settings/billing" },
      { title: "Limits", url: "/app/settings/limits" },
    ],
  },
];

export function AppSidebar(props: React.ComponentProps<typeof Sidebar>) {
  const { isCollapsed } = useSidebar();

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
        <NavMain items={navMainItems} />
      </SidebarContent>

      <SidebarFooter>
        <NavUser />
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}