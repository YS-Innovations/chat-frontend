import { Button } from "@/components/ui/button";
import { Search, Filter } from "lucide-react";

export function EmptyState({
  hasSearch,
  hasFilters,
  onClearFilters,
}: {
  hasSearch: boolean;
  hasFilters: boolean;
  onClearFilters: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      {hasSearch || hasFilters ? (
        <>
          <Filter className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">
            No members match your filters
          </h3>
          <p className="text-muted-foreground mb-4">
            Try adjusting your search or filter criteria
          </p>
          <Button onClick={onClearFilters}>
            Clear all filters
          </Button>
        </>
      ) : (
        <>
          <Search className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">
            No members found
          </h3>
          <p className="text-muted-foreground">
            Your organization doesn't have any members yet
          </p>
        </>
      )}
    </div>
  );
}