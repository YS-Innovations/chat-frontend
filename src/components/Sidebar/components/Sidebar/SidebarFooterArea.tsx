import { SidebarFooter, SidebarRail } from "@/components/ui/sidebar";
import { NavUser } from "@/components/Sidebar/components/Nav/nav-user";

export function SidebarFooterArea() {
  return (
    <>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </>
  );
}
