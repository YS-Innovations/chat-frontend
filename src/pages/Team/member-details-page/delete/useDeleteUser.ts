// src/hooks/useDeleteUser.ts
import { useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { deleteUser } from "./deleteUser";
import { toast } from "sonner";

export function useDeleteUser(onSuccess?: () => void) {
  const { getAccessTokenSilently } = useAuth0();
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async (userId: string) => {
    const confirmed = window.confirm('Are you sure you want to delete this user?');
    if (!confirmed) return;

    try {
      setDeleting(true);
      const token = await getAccessTokenSilently();
      await deleteUser(userId, token);

      toast.success("User deleted successfully");
      onSuccess?.();
    } catch (error: any) {
      console.error('Delete failed:', error);
      toast.error("Delete failed", {
        description: error?.message || "An error occurred",
      });
    } finally {
      setDeleting(false);
    }
  };

  return { deleting, handleDelete };
}
