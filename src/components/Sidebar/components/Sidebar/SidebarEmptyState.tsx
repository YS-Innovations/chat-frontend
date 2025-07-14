import { SidebarContent } from "@/components/ui/sidebar";
import { SidebarHeader } from "./SidebarHeader";

export function SidebarEmptyState({ isCollapsed }: { isCollapsed: boolean }) {
  return (
    <>
      <SidebarContent>
        <SidebarHeader isCollapsed={isCollapsed} />
        <div className="p-4 text-center text-muted-foreground text-sm">No accessible modules</div>
      </SidebarContent>
    </>
  );
}
