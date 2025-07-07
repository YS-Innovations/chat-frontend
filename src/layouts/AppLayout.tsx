// src/layouts/AppLayout.tsx
import { Outlet } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";

import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/sonner";
import useClientInfo from "@/hooks/useClientInfo";

import Header from "@/components/layout/Header";
import ErrorPage from "@/pages/ErrorPage";
import LoadingScreen from "@/components/Loading/LoadingScreen";
import { AppSidebar } from "@/components/Sidebar/app-sidebar";

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
          <Header />
          <main className="flex-1 overflow-auto p-4">
            <Outlet />
          </main>
        </SidebarInset>
      </SidebarProvider>
      <Toaster />
    </div>
  );
}
