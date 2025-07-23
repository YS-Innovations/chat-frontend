import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useDeleteUser } from "../hooks/useDeleteUser";

interface DeleteUserButtonProps {
  userId: string;
  userRole: string;
  onSuccess?: () => void;
  className?: string;
}

export const DeleteUserButton = ({
  userId,
  onSuccess,
  className = "",
}: DeleteUserButtonProps) => {
  const [open, setOpen] = useState(false);
  const { deleting, handleDelete } = useDeleteUser(() => {
    setOpen(false);
    onSuccess?.();
  });

  const onConfirmDelete = () => {
    handleDelete(userId);
  };

  return (
    <>
      {/* This button triggers opening the dialog */}
      <Button
        variant="destructive"
        size="sm"
        onClick={(e) => {
          e.stopPropagation();
          setOpen(true);
        }}
        disabled={deleting}
        className={className}
      >
        Delete
      </Button>

      {/* Dialog for confirmation */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this user? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={onConfirmDelete}
              disabled={deleting}
            >
              {deleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
