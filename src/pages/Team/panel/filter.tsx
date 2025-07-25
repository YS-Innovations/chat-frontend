import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Filter } from "lucide-react";

interface FilterPanelProps {
  roles: { value: string; display: string }[];
  selectedRoles: string[];
  onRoleToggle: (role: string) => void;
  onClearAll: () => void;
}

export function FilterPanel({
  roles,
  selectedRoles,
  onRoleToggle,
  onClearAll,
}: FilterPanelProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="relative">
          <Filter className="mr-2 h-4 w-4" />
          Filters
          {selectedRoles.length > 0 && (
            <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center">
              {selectedRoles.length}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      
      <PopoverContent className="w-64 p-2" align="end">
        <div className="space-y-4">
          <div className="flex justify-between items-center px-2">
            <h4 className="font-medium">Filters</h4>
            {selectedRoles.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClearAll}
                className="h-7 text-sm text-primary"
              >
                Clear all
              </Button>
            )}
          </div>
          
          <div className="space-y-2">
            <h5 className="px-2 text-sm font-medium">Roles</h5>
            <div className="space-y-1">
              {roles.map((role) => (
                <label
                  key={role.value}
                  className="flex items-center gap-2 p-2 rounded hover:bg-accent cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedRoles.includes(role.value)}
                    onChange={() => onRoleToggle(role.value)}
                    className="h-4 w-4 rounded border-primary text-primary focus:ring-primary"
                  />
                  <span>{role.display}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}