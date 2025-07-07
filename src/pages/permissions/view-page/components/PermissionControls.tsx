import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface PermissionControlsProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  canEdit: boolean;
  onEdit: () => void;
}

export function PermissionControls({ searchTerm, setSearchTerm, canEdit, onEdit }: PermissionControlsProps) {
  return (
    <div className="controls">
      <Input
        placeholder="Search permissions..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="search-input"
      />
      {canEdit && (
        <Button onClick={onEdit} className="edit-button">
          Edit Permissions
        </Button>
      )}
    </div>
  );
}
