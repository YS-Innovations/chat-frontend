import { Outlet } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import { AppSidebar } from "@/components/Sidebar/app-sidebar";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Toaster } from "@/components/ui/sonner";
import useClientInfo from "../../hooks/useClientInfo";
import LoadingScreen from "../Loading/LoadingScreen";
import ErrorPage from "@/pages/ErrorPage";

export default function AppLayout() {
  const { user, isLoading, error } = useAuth0();

  useClientInfo(user);

  if (isLoading) return <LoadingScreen />;
  if (error) return <ErrorPage statusCode={401} error={error} />;

  return (
    <div className="flex h-screen bg-gray-50">
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset className="flex flex-1 flex-col overflow-hidden">
          <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
            <div className="flex items-center gap-2 px-4">
              <SidebarTrigger className="-ml-1" />
              <Separator
                orientation="vertical"
                className="mr-2 data-[orientation=vertical]:h-4"
              />
            </div>
          </header>
          <main className="flex-1 overflow-auto p-4">
            <Outlet />
          </main>
        </SidebarInset>
      </SidebarProvider>
      <Toaster />
    </div>
  );
}
