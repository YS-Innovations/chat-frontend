// NavMain.tsx
"use client";

import { useLocation, useNavigate } from "react-router-dom";
import { ChevronRight, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSidebar } from "@/components/ui/sidebar";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";

type NavItem = {
  title: string;
  url: string;
  icon?: LucideIcon;
  badge?: string;
  items?: {
    title: string;
    url: string;
    badge?: string;
  }[];
};

interface NavMainProps {
  items: NavItem[];
}

export function NavMain({ items }: NavMainProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { isCollapsed } = useSidebar();

  const isActive = (item: NavItem) => {
    if (location.pathname === item.url) return true;
    if (item.items?.some(sub => location.pathname === sub.url)) return true;
    return false;
  };

  return (
    <SidebarGroup>
      <SidebarMenu>
        {items.map((item) => {
          const active = isActive(item);

          if (item.items && item.items.length > 0) {
            return (
              <Collapsible
                key={item.title}
                asChild
                defaultOpen={active}
                className="group/collapsible"
              >
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton
                      tooltip={isCollapsed ? item.title : undefined}
                      className={cn(
                        "transition-colors hover:bg-accent hover:text-accent-foreground",
                        active && "bg-sidebar-accent text-sidebar-accent-foreground"
                      )}
                    >
                      {item.icon && <item.icon className="size-4" />}
                      {!isCollapsed && (
                        <>
                          <span className="truncate">{item.title}</span>
                          {item.badge && (
                            <span className="ml-auto rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800">
                              {item.badge}
                            </span>
                          )}
                        </>
                      )}
                      {!isCollapsed && (
                        <ChevronRight className="ml-auto size-4 shrink-0 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                      )}
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  {!isCollapsed && (
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {item.items.map((subItem) => {
                          const subActive = location.pathname === subItem.url;
                          return (
                            <SidebarMenuSubItem key={subItem.title}>
                              <SidebarMenuSubButton
                                asChild
                                className={cn(
                                  "hover:bg-accent hover:text-accent-foreground",
                                  subActive && "bg-sidebar-accent text-sidebar-accent-foreground"
                                )}
                              >
                                <a
                                  href="#"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    navigate(subItem.url);
                                  }}
                                >
                                  <span className="truncate">{subItem.title}</span>
                                  {subItem.badge && (
                                    <span className="ml-auto rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800">
                                      {subItem.badge}
                                    </span>
                                  )}
                                </a>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          );
                        })}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  )}
                </SidebarMenuItem>
              </Collapsible>
            );
          }

          return (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                tooltip={isCollapsed ? item.title : undefined}
                className={cn(
                  "transition-colors hover:bg-accent hover:text-accent-foreground",
                  active && "bg-sidebar-accent text-sidebar-accent-foreground"
                )}
                onClick={() => navigate(item.url)}
              >
                {item.icon && <item.icon className="size-4" />}
                {!isCollapsed && (
                  <>
                    <span className="truncate">{item.title}</span>
                    {item.badge && (
                      <span className="ml-auto rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800">
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
              </SidebarMenuButton>
            </SidebarMenuItem>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}