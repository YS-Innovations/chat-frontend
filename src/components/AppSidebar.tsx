import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  SidebarSeparator,
} from '@/components/ui/sidebar';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import {
  InboxIcon,
  MessageCircleIcon,
  HashIcon,
  UsersIcon,
  BarChart2Icon,
  HelpCircleIcon,
  SettingsIcon,
  UserIcon,
  LogOutIcon,
} from 'lucide-react';

export function AppSidebar() {
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        {/* Search Field */}
        <Input placeholder="Search..." />
      </SidebarHeader>
      <SidebarSeparator />
      <SidebarContent>
        {/* Main Navigation Group */}
        <SidebarGroup>
          {/* SidebarGroupLabel is optional; omitted here for a clean look */}
          <SidebarGroupContent>
            <SidebarMenu>
              {/* My Inbox */}
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <a href="#inbox" className="flex items-center">
                    <InboxIcon className="mr-2 h-4 w-4" />
                    <span>My Inbox</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {/* Conversations (with nested submenu) */}
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <a href="#conversations" className="flex items-center">
                    <MessageCircleIcon className="mr-2 h-4 w-4" />
                    <span>Conversations</span>
                  </a>
                </SidebarMenuButton>
                <SidebarMenuSub>
                  <SidebarMenuSubItem>
                    <SidebarMenuSubButton asChild>
                      <a href="#conversations/all" className="ml-6">
                        All Conversations
                      </a>
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                  <SidebarMenuSubItem>
                    <SidebarMenuSubButton asChild>
                      <a href="#conversations/mentions" className="ml-6">
                        Mentions
                      </a>
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                  <SidebarMenuSubItem>
                    <SidebarMenuSubButton asChild>
                      <a href="#conversations/unattended" className="ml-6">
                        Unattended
                      </a>
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                </SidebarMenuSub>
              </SidebarMenuItem>

              {/* Channels (with nested submenu) */}
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <a href="#channels" className="flex items-center">
                    <HashIcon className="mr-2 h-4 w-4" />
                    <span>Channels</span>
                  </a>
                </SidebarMenuButton>
                <SidebarMenuSub>
                  <SidebarMenuSubItem>
                    <SidebarMenuSubButton asChild>
                      <a href="#channels/yogesh" className="ml-6">
                        yogesh
                      </a>
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                </SidebarMenuSub>
              </SidebarMenuItem>

              {/* Contacts */}
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <a href="#contacts" className="flex items-center">
                    <UsersIcon className="mr-2 h-4 w-4" />
                    <span>Contacts</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {/* Reports */}
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <a href="#reports" className="flex items-center">
                    <BarChart2Icon className="mr-2 h-4 w-4" />
                    <span>Reports</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {/* Help Center */}
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <a href="#help" className="flex items-center">
                    <HelpCircleIcon className="mr-2 h-4 w-4" />
                    <span>Help Center</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {/* Settings (with nested submenu) */}
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <a href="#settings" className="flex items-center">
                    <SettingsIcon className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </a>
                </SidebarMenuButton>
                <SidebarMenuSub>
                  <SidebarMenuSubItem>
                    <SidebarMenuSubButton asChild>
                      <a href="#settings/account" className="ml-6">
                        Account Settings
                      </a>
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                  <SidebarMenuSubItem>
                    <SidebarMenuSubButton asChild>
                      <a href="#settings/agents" className="ml-6">
                        Agents
                      </a>
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                  <SidebarMenuSubItem>
                    <SidebarMenuSubButton asChild>
                      <a href="#settings/teams" className="ml-6">
                        Teams
                      </a>
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                  <SidebarMenuSubItem>
                    <SidebarMenuSubButton asChild>
                      <a href="#settings/inboxes" className="ml-6">
                        Inboxes
                      </a>
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                  <SidebarMenuSubItem>
                    <SidebarMenuSubButton asChild>
                      <a href="#settings/macros" className="ml-6">
                        Macros
                      </a>
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                  <SidebarMenuSubItem>
                    <SidebarMenuSubButton asChild>
                      <a href="#settings/canned" className="ml-6">
                        Canned Responses
                      </a>
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                  <SidebarMenuSubItem>
                    <SidebarMenuSubButton asChild>
                      <a href="#settings/audit" className="ml-6">
                        Audit Logs
                      </a>
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                  <SidebarMenuSubItem>
                    <SidebarMenuSubButton asChild>
                      <a href="#settings/roles" className="ml-6">
                        Custom Roles
                      </a>
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                  <SidebarMenuSubItem>
                    <SidebarMenuSubButton asChild>
                      <a href="#settings/billing" className="ml-6">
                        Billing
                      </a>
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                </SidebarMenuSub>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarSeparator />
      {/* Footer with Profile and Logout */}
      <SidebarFooter>
        <div className="flex flex-col items-center gap-2">
          <Avatar className="h-10 w-10">
            <AvatarImage src="/images/user.png" alt="User" />
            <AvatarFallback>JD</AvatarFallback>
          </Avatar>
          <span className="mt-1 text-sm font-semibold">John Doe</span>
        </div>
        <SidebarSeparator />
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <a href="#profile/settings" className="flex items-center">
                <SettingsIcon className="mr-2 h-4 w-4" />
                <span>Profile Settings</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <a href="#profile/logout" className="flex items-center">
                <LogOutIcon className="mr-2 h-4 w-4" />
                <span>Log Out</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
