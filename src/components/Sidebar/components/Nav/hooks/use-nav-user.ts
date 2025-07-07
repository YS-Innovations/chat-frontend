"use client";

import { useAuth0 } from "@auth0/auth0-react";
import { useNavigate } from "react-router-dom";
import { useUserStatus } from "@/context/userStatus";
import { useSidebar } from "@/components/ui/sidebar";

export function useNavUser() {
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

  const currentUser = auth0User ? {
    name: auth0User.name ?? auth0User.email ?? "Unknown User",
    email: auth0User.email ?? "No email",
    avatar: auth0User.picture ?? "/default-avatar.png",
  } : null;

  const userStatus = auth0User?.sub 
    ? Object.values(statuses).find(s => s.user?.auth0Id === auth0User.sub)
    : null;

  return {
    isCollapsed,
    auth0User,
    isLoading,
    navigate,
    handleLogout,
    currentUser,
    userStatus,
  };
}