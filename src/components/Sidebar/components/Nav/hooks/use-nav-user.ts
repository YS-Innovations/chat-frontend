"use client";

import { useAuthShared } from "@/hooks/useAuthShared";
import { useNavigate } from "react-router-dom";
import { useSidebar } from "@/components/ui/sidebar";
import { useProfilePicture } from "@/pages/Profile/useProfilePicture";

export function useNavUser() {
  const { isCollapsed } = useSidebar();
  const { user: auth0User, isLoading, logout } = useAuthShared();
  const navigate = useNavigate();
  const { profilePicture } = useProfilePicture();
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
    avatar: profilePicture ?? auth0User.picture ?? "/default-avatar.png",
  } : null;


  return {
    isCollapsed,
    auth0User,
    isLoading,
    navigate,
    handleLogout,
    currentUser,
  };
}