import {
  BookOpen,
  Bot,
  Settings2,
  SquareTerminal,
  Users,
} from "lucide-react";

export const navMainItems = [
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
    title: "Contacts",
    url: "/app/contacts",
    icon: SquareTerminal,
    isActive: false,
    permission: "member-list",
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
