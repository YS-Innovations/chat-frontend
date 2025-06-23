export function SidebarHeader({ isCollapsed }: { isCollapsed: boolean }) {
  return (
    <div className="flex items-center justify-center h-16 px-4 shrink-0">
      {isCollapsed ? (
        <div className="flex items-center justify-center w-8 h-8">
          <img src="/eglelogo.jpg" alt="CoConnect Logo" className="w-8 h-8" />
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <img src="/eglelogo.jpg" alt="CoConnect Logo" className="w-8 h-8" />
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
            CoConnect
          </span>
        </div>
      )}
    </div>
  );
}
