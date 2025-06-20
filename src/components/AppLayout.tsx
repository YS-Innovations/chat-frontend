// AppLayout.tsx
import { Outlet } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import { useEffect } from "react";
import { AppSidebar } from "@/components/Sidebar/app-sidebar";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Toaster } from "@/components/ui/sonner";
import { Skeleton } from "@/components/ui/skeleton";
import {UAParser }from 'ua-parser-js';

export default function AppLayout() {
  const { user, isLoading, error } = useAuth0();

useEffect(() => {
    const fetchClientInfo = async () => {
      try {
        // Get accurate IP
        const ipResponse = await fetch('https://api.ipify.org?format=json');
        const ipData = await ipResponse.json();
        const clientIp = ipData.ip;
        
        // Parse browser details with enhanced accuracy
        const parser = new UAParser();
        const result = parser.getResult();
        
        const clientInfo = {
          browser: `${result.browser.name} ${result.browser.version}`,
          os: `${result.os.name} ${result.os.version || ''}`.trim(),
          deviceType: result.device.type || 'desktop',
          ip: clientIp,
          rawUA: navigator.userAgent,
          loginTime: new Date().toISOString(),
      
        };

        if (user) {
          fetch("http://localhost:3000/auth/save-user", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              ...user,
              clientInfo
            }),
          }).catch(console.error);
        }
      } catch (error) {
        console.error("Error getting client info:", error);
        // Enhanced fallback
        const parser = new UAParser();
        const result = parser.getResult();
        
        const clientInfo = {
          browser: `${result.browser.name} ${result.browser.version}`,
          os: `${result.os.name} ${result.os.version || ''}`.trim(),
          deviceType: result.device.type || 'desktop',
          ip: 'unknown',
          rawUA: navigator.userAgent,
          loginTime: new Date().toISOString()
        };
        
        if (user) {
          fetch("http://localhost:3000/auth/save-user", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              ...user,
              clientInfo
            }),
          }).catch(console.error);
        }
      }
    };

    if (user) fetchClientInfo();
  }, [user]);
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <Skeleton className="h-12 w-12 rounded-full" />
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-24" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="max-w-md rounded-lg bg-red-50 p-6 text-center shadow-md">
          <h2 className="mb-2 text-xl font-semibold text-red-600">
            Authentication Error
          </h2>
          <p className="text-red-500">{error.message}</p>
          <button 
            className="mt-4 rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700"
            onClick={() => window.location.reload()}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

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