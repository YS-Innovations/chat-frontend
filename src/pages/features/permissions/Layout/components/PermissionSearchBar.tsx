import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface PermissionSearchBarProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
}

export function PermissionSearchBar({
  searchTerm,
  onSearchChange,
}: PermissionSearchBarProps) {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
      <Input
        placeholder="Search permissions..."
        className="pl-10"
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
      />
    </div>
  );
}