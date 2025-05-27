import { Outlet } from 'react-router-dom';
import { SidebarProvider } from '@/components/ui/sidebar'; // ✅ make sure this is correctly imported
import { AppSidebar } from './AppSidebar';

export default function AppLayout() {
  return (
    <SidebarProvider>
      <div className="flex h-screen bg-gray-50">
        <AppSidebar />
        <div className="flex-1 overflow-auto">
          <Outlet />
        </div>
      </div>
    </SidebarProvider>
  );
}
