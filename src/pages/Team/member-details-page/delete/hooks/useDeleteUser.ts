import { useState } from "react";
import { useAuthShared } from "@/hooks/useAuthShared";
import { toast } from "sonner";
import { deleteUser } from "../api/deleteUser";

export function useDeleteUser(onSuccess?: () => void) {
  const { getAccessTokenSilently } = useAuthShared();
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async (userId: string) => {
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
