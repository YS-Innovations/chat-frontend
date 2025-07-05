import { Button } from "@/components/ui/button";

interface PermissionEditActionsProps {
  onCancel: () => void;
  onSaveClick: () => void;
  saving: boolean;
  isDirty: boolean;
}

export function PermissionEditActions({
  onCancel,
  onSaveClick,
  saving,
  isDirty,
}: PermissionEditActionsProps) {
  return (
    <div className="flex justify-end space-x-3 pt-4 border-t">
      <Button variant="outline" onClick={onCancel} disabled={saving}>
        Cancel
      </Button>
      <Button onClick={onSaveClick} disabled={saving || !isDirty}>
        {saving ? "Saving..." : "Save Changes"}
      </Button>
    </div>
  );
}
