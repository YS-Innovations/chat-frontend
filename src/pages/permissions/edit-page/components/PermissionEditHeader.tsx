import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

interface PermissionEditHeaderProps {
  onSelectAll: () => void;
  onClearAll: () => void;
}

export function PermissionEditHeader({
  onSelectAll,
  onClearAll,
}: PermissionEditHeaderProps) {
  return (
    <div className="flex justify-between items-center">
      <h2 className="text-xl font-bold">Edit Permissions</h2>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={onSelectAll}>
          <Check className="h-4 w-4 mr-2" /> Select All
        </Button>
        <Button variant="outline" size="sm" onClick={onClearAll}>
          Clear All
        </Button>
      </div>
    </div>
  );
}