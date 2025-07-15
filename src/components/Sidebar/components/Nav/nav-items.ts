import {
  BookOpen,
  Bot,
  Settings2,
  SquareTerminal,
  Users,
} from "lucide-react";
import { type NavItem } from "./types/nav-types";

export const navMainItems: NavItem[] = [
  {
    title: "Inbox",
    url: "/app",
    icon: SquareTerminal,
    isActive: true,
    permission: "inbox-access",
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
    title: "Team",
    url: "#",
    icon: Users,
    permission: "team",
    items: [
      { title: "Members", url: "/app/team", permission: "member-list" },
      { title: "Invite", url: "/app/team/invite", permission: "invite-form" },
      { title: "Pending Invite", url: "/app/team/invite-pending", permission: "pending-invite" },
      { title: "Permission Templates", url: "/app/team/permission-templates", permission: "Permission-Templates" },
      { title: "Status", url: "/app/team/status", permission: "team-status-view" },
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
      { title: "onboarding", url: "/app/onboarding", permission: "onboarding" },
    ],
  },
];