import { type LucideIcon } from "lucide-react";

export type NavItem = {
  title: string;
  url: string;
  icon?: LucideIcon;
  badge?: string;
  permission?: string;
  isActive?: boolean;
  items?: NavSubItem[];
};

export type NavSubItem = {
  title: string;
  url: string;
  badge?: string;
  permission?: string;
};