import { useState, useCallback } from "react";
import { toast } from "sonner";
import { useAuth0 } from "@auth0/auth0-react";

export function useDeleteMember(memberId: string, onClose: () => void) {
  const [deleting, setDeleting] = useState(false);
  const { getAccessTokenSilently } = useAuth0();

  const handleDelete = useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this user?')) return;

    try {
      setDeleting(true);
      const token = await getAccessTokenSilently();
      await fetch(`http://localhost:3000/auth/members/${memberId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      onClose();
    } catch (error) {
      console.error('Delete failed:', error);
      toast.error("Delete failed");
    } finally {
      setDeleting(false);
    }
  }, [memberId, getAccessTokenSilently, onClose]);

  return { handleDelete, deleting };
}
