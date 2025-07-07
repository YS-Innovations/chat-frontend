import { useLocation, useNavigate } from "react-router-dom";
import { useSidebar } from "@/components/ui/sidebar";
import { type NavItem } from "../types/nav-types";

export function useNavMain() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isCollapsed } = useSidebar();

  const isActive = (item: NavItem) => {
    if (location.pathname === item.url) return true;
    if (item.items?.some(sub => location.pathname === sub.url)) return true;
    return false;
  };

  const handleNavigate = (url: string) => navigate(url);

  return {
    isActive,
    handleNavigate,
    isCollapsed,
    location
  };
}