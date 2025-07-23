import { Button } from "@/components/ui/button";
import { usePermissions } from "@/context/permissions";
import { useDeleteUser } from "./useDeleteUser";

interface DeleteUserButtonProps {
  userId: string;
  userRole: string;
  onSuccess?: () => void;
  className?: string;
}

export const DeleteUserButton = ({
  userId,
  userRole,
  onSuccess,
  className = '',
}: DeleteUserButtonProps) => {
  const { role, hasPermission } = usePermissions();
  const { deleting, handleDelete } = useDeleteUser(() => {
    onSuccess?.();
  });

  const canDelete =
    role === "OWNER" || (hasPermission("user-delete") && userRole === "AGENT");

  if (!canDelete) return null;

  return (
    <Button
      variant="destructive"
      size="sm"
      onClick={(e) => {
        e.stopPropagation();
        handleDelete(userId);
      }}
      disabled={deleting}
      className={className}
    >
      {deleting ? "Deleting..." : "Delete"}
    </Button>
  );
};
