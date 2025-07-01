import { SidebarContent } from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { NavMain } from "@/components/Sidebar/components/Nav/nav-main";
import { SidebarHeader } from "./SidebarHeader";

export function SidebarContentArea({
  filteredItems,
  isLoading,
  isCollapsed,
}: {
  filteredItems: typeof import("../Nav/nav-items").navMainItems;
  isLoading: boolean;
  isCollapsed: boolean;
}) {
  return (
    <SidebarContent>
      <SidebarHeader isCollapsed={isCollapsed} />
      {isLoading ? (
        <div className="space-y-2 px-2">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-10 w-full rounded-md" />
          ))}
        </div>
      ) : (
        <NavMain items={filteredItems} />
      )}
    </SidebarContent>
  );
}
