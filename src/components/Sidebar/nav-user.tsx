"use client"

import {
  BadgeCheck,
  Bell,
  ChevronsUpDown,
  CreditCard,
  LogOut,
  Pencil,
  Sparkles,
} from "lucide-react"
import { useAuth0 } from "@auth0/auth0-react";
import { useNavigate } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useSidebar } from "@/components/ui/sidebar";
import { useUserStatus } from "@/context/UserStatusContext";
import { UserStatusIndicator } from "@/components/UserStatusIndicator";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { cn } from "@/lib/utils";

export function NavUser() {
  const { isCollapsed } = useSidebar();
  const { user: auth0User, isLoading, logout } = useAuth0();
  const { statuses } = useUserStatus();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout({ 
      logoutParams: { 
        returnTo: window.location.origin 
      } 
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 px-2 py-2">
        <Skeleton className="h-8 w-8 rounded-lg" />
        {!isCollapsed && (
          <div className="flex-1">
            <Skeleton className="mb-1 h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        )}
        <Skeleton className="h-4 w-4" />
      </div>
    );
  }

  if (!auth0User) {
    return (
      <button 
        className={cn(
          "w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700",
          isCollapsed ? "p-2" : ""
        )}
        onClick={() => navigate('/login')}
      >
        {isCollapsed ? "🔑" : "Sign In"}
      </button>
    );
  }

  const currentUser = {
    name: auth0User.name ?? auth0User.email ?? "Unknown User",
    email: auth0User.email ?? "No email",
    avatar: auth0User.picture ?? "/default-avatar.png",
  };

  const userStatus = auth0User.sub 
    ? Object.values(statuses).find(s => s.user?.auth0Id === auth0User.sub)
    : null;

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              aria-label="User account menu"
            >
              <div className="relative">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage 
                    src={currentUser.avatar} 
                    alt={currentUser.name} 
                    className="object-cover"
                  />
                  <AvatarFallback className="rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                    {currentUser.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                {auth0User.sub && (
                  <div className="absolute -bottom-1 -right-1">
                    <UserStatusIndicator 
                      userId={auth0User.sub} 
                      size="sm"
                    />
                  </div>
                )}
              </div>
              {!isCollapsed && (
                <>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-medium">{currentUser.name}</span>
                    <span className="truncate text-xs text-muted-foreground">{currentUser.email}</span>
                  </div>
                  <ChevronsUpDown className="ml-auto size-4 shrink-0" />
                </>
              )}
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[var(--radix-dropdown-menu-trigger-width)] min-w-56 rounded-lg p-1 shadow-lg"
            side={isCollapsed ? "right" : "top"}
            align="end"
            sideOffset={8}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-2 py-1.5">
                <div className="relative">
                  <Avatar className="h-10 w-10 rounded-lg">
                    <AvatarImage 
                      src={currentUser.avatar} 
                      alt={currentUser.name} 
                      className="object-cover"
                    />
                    <AvatarFallback className="rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                      {currentUser.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  {auth0User.sub && (
                    <div className="absolute -bottom-1 -right-1">
                      <UserStatusIndicator 
                        userId={auth0User.sub} 
                        size="sm"
                      />
                    </div>
                  )}
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{currentUser.name}</span>
                  <span className="truncate text-xs text-muted-foreground">{currentUser.email}</span>
                  {auth0User.sub && userStatus && (
                    <div className="flex items-center mt-1">
                      <UserStatusIndicator 
                        userId={auth0User.sub} 
                        size="sm" 
                        showText
                      />
                    </div>
                  )}
                </div>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button 
                      onClick={() => navigate("/app/profile")}
                      className="flex size-8 items-center justify-center rounded-full hover:bg-accent"
                      aria-label="Edit profile"
                    >
                      <Pencil className="size-4" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="text-xs">
                    Edit Profile
                  </TooltipContent>
                </Tooltip>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem onClick={() => navigate("/app/upgrade")}>
                <Sparkles className="mr-2 size-4" />
                <span>Upgrade to Pro</span>
                <span className="ml-auto rounded-full bg-gradient-to-r from-amber-500 to-orange-500 px-2 py-0.5 text-xs font-medium text-white">
                  New
                </span>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem onClick={() => navigate("/app/profile")}>
                <BadgeCheck className="mr-2 size-4" />
                <span>Account</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("/app/settings/billing")}>
                <CreditCard className="mr-2 size-4" />
                <span>Billing</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("/app/settings/notifications")}>
                <Bell className="mr-2 size-4" />
                <span>Notifications</span>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={handleLogout}
              className="focus:bg-destructive focus:text-destructive-foreground"
            >
              <LogOut className="mr-2 size-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}