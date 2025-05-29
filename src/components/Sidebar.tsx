import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  MessageSquare,
  User,
  Contact,
  LayoutDashboard,
  ChevronRight,
  ChevronLeft,
  Settings,
  LogOut,
  Menu,
  X,
  Search,
  Users,
  HelpCircle,
  Mail,
  Archive,
  Inbox,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { useAuth0 } from '@auth0/auth0-react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';

const Sidebar = () => {
  const { user, logout } = useAuth0();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [desktopCollapsed, setDesktopCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeAccordion, setActiveAccordion] = useState<string | null>('conversations');
  const [userStatus, setUserStatus] = useState<'online' | 'away' | 'offline'>('online');
  const location = useLocation();
  const sidebarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location]);

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const toggleDesktopSidebar = () => {
    setDesktopCollapsed(!desktopCollapsed);
  };

  const toggleAccordion = (value: string) => {
    setActiveAccordion(activeAccordion === value ? null : value);
  };

  const mainNavItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/app' },
    { icon: Contact, label: 'Contacts', path: '/app/contacts' },
    { icon: User, label: 'Profile', path: '/app/profile' },
    { icon: Users, label: 'Team', path: '/app/team' },
    { icon: HelpCircle, label: 'Help Center', path: '/app/help' },
  ];

  const conversationItems = [
    { icon: Inbox, label: 'All Conversations', path: '/app/conversations' },
    { icon: Mail, label: 'Unread', path: '/app/conversations/unread' },
    { icon: Archive, label: 'Archived', path: '/app/conversations/archived' },
  ];

  const filteredNavItems = mainNavItems.filter(item =>
    item.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusColor = () => {
    switch (userStatus) {
      case 'online': return 'bg-green-500';
      case 'away': return 'bg-yellow-500';
      case 'offline': return 'bg-gray-500';
      default: return 'bg-green-500';
    }
  };

  return (
    <TooltipProvider delayDuration={100}>
      {/* Desktop Sidebar */}
      <aside
        ref={sidebarRef}
        className={cn(
          "hidden lg:flex flex-col h-screen bg-background border-r transition-all duration-300 ease-in-out sticky top-0 z-30",
          desktopCollapsed ? "w-16" : "w-64",
          isScrolled ? "shadow-lg" : "",
          "backdrop-blur-sm bg-opacity-90"
        )}
      >
        {/* Header */}
        <div className="p-4 border-b flex items-center justify-between relative">
          {!desktopCollapsed && (
            <div className="flex items-center gap-2 transition-all duration-300">
              <div className="p-1.5 rounded-lg">
                <img src="/eglelogo.jpg" alt="Logo" className="h-8 w-8" />
              </div>
              <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
                CoConnect
              </h2>
            </div>
          )}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full hover:bg-accent transition-colors"
                onClick={toggleDesktopSidebar}
              >
                {desktopCollapsed ? (
                  <ChevronRight className="h-4 w-4 transition-transform duration-300" />
                ) : (
                  <ChevronLeft className="h-4 w-4 transition-transform duration-300" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">
              {desktopCollapsed ? "Expand" : "Collapse"}
            </TooltipContent>
          </Tooltip>
        </div>

        {/* Search */}
        {!desktopCollapsed && (
          <div className="p-3 border-b">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search..."
                className="pl-9 transition-all duration-300 focus:ring-2 focus:ring-primary/30"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        )}

        {/* Navigation */}
        <ScrollArea className="flex-1 py-2">
          <div className="space-y-1 px-2">
            {/* Dashboard */}
            <Tooltip disableHoverableContent={!desktopCollapsed}>
              <TooltipTrigger asChild>
                <Button
                  asChild
                  variant={isActive('/app') ? 'secondary' : 'ghost'}
                  className={cn(
                    "w-full justify-start gap-3 transition-all duration-200 group",
                    desktopCollapsed ? "px-2" : "px-4",
                    isActive('/app')
                      ? "bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-100 shadow-sm"
                      : "hover:bg-accent/50",
                    "relative overflow-hidden"
                  )}
                >
                  <Link to="/app">
                    <div className="relative">
                      <LayoutDashboard className={cn(
                        "h-4 w-4 transition-transform duration-300 group-hover:scale-110",
                        isActive('/app') ? "text-blue-600 scale-110" : "text-muted-foreground"
                      )} />
                    </div>
                    {!desktopCollapsed && (
                      <>
                        <span className={cn(
                          "font-medium transition-colors",
                          isActive('/app') ? "text-primary" : "text-muted-foreground"
                        )}>
                          Dashboard
                        </span>
                        {isActive('/app') && (
                          <span className="absolute right-4 top-1/2 -translate-y-1/2 h-2 w-2 rounded-full bg-blue-600 animate-pulse" />
                        )}
                      </>
                    )}
                  </Link>
                </Button>
              </TooltipTrigger>
              {desktopCollapsed && (
                <TooltipContent side="right">Dashboard</TooltipContent>
              )}
            </Tooltip>

            {/* Conversations Accordion */}
            <div className="mt-1">
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start gap-3 p-2 hover:bg-accent/50 rounded-md transition-colors duration-200 group",
                  desktopCollapsed ? "justify-center" : ""
                )}
                onClick={() => toggleAccordion('conversations')}
              >
                <div className="relative">
                  <MessageSquare className={cn(
                    "h-4 w-4 transition-transform duration-300 group-hover:scale-110",
                    activeAccordion === 'conversations' ? "text-blue-600" : "text-muted-foreground"
                  )} />
                  {activeAccordion === 'conversations' && (
                    <span className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-blue-600 animate-pulse" />
                  )}
                </div>
                {!desktopCollapsed && (
                  <>
                    <span className="font-medium text-muted-foreground flex-1 text-left">
                      Conversations
                    </span>
                    {activeAccordion === 'conversations' ? (
                      <ChevronUp className="h-4 w-4 text-muted-foreground transition-transform duration-200" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform duration-200" />
                    )}
                  </>
                )}
              </Button>

              {activeAccordion === 'conversations' && !desktopCollapsed && (
                <div className="ml-2 mt-1 space-y-1 overflow-hidden">
                  {conversationItems.map((item) => (
                    <Tooltip key={item.path} disableHoverableContent>
                      <TooltipTrigger asChild>
                        <Button
                          asChild
                          variant={isActive(item.path) ? 'secondary' : 'ghost'}
                          className={cn(
                            "w-full justify-start gap-3 pl-8 pr-3 transition-all duration-200 group",
                            isActive(item.path)
                              ? "bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-100"
                              : "hover:bg-accent/50",
                            "relative"
                          )}
                          size="sm"
                        >
                          <Link to={item.path}>
                            <item.icon className={cn(
                              "h-4 w-4 transition-transform duration-300 group-hover:scale-110",
                              isActive(item.path) ? "text-blue-600" : "text-muted-foreground"
                            )} />
                            <span className={cn(
                              "font-medium",
                              isActive(item.path) ? "text-primary" : "text-muted-foreground"
                            )}>
                              {item.label}
                            </span>

                            {isActive(item.path) && (
                              <span className="absolute right-3 top-1/2 -translate-y-1/2 h-2 w-2 rounded-full bg-blue-600 animate-pulse" />
                            )}
                          </Link>
                        </Button>
                      </TooltipTrigger>
                    </Tooltip>
                  ))}
                </div>
              )}
            </div>

            {/* Other Main Navigation Items */}
            {filteredNavItems.slice(1).map((item) => (
              <Tooltip key={item.path} disableHoverableContent={!desktopCollapsed}>
                <TooltipTrigger asChild>
                  <Button
                    asChild
                    variant={isActive(item.path) ? 'secondary' : 'ghost'}
                    className={cn(
                      "w-full justify-start gap-3 transition-all duration-200 group",
                      desktopCollapsed ? "px-2" : "px-4",
                      isActive(item.path)
                        ? "bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-100 shadow-sm"
                        : "hover:bg-accent/50",
                      "relative overflow-hidden"
                    )}
                  >
                    <Link to={item.path}>
                      <div className="relative">
                        <item.icon className={cn(
                          "h-4 w-4 transition-transform duration-300 group-hover:scale-110",
                          isActive(item.path) ? "text-blue-600 scale-110" : "text-muted-foreground"
                        )} />
                      </div>
                      {!desktopCollapsed && (
                        <>
                          <span className={cn(
                            "font-medium transition-colors",
                            isActive(item.path) ? "text-primary" : "text-muted-foreground"
                          )}>
                            {item.label}
                          </span>
                          {isActive(item.path) && (
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 h-2 w-2 rounded-full bg-blue-600 animate-pulse" />
                          )}
                        </>
                      )}
                    </Link>
                  </Button>
                </TooltipTrigger>
                {desktopCollapsed && (
                  <TooltipContent side="right">{item.label}</TooltipContent>
                )}
              </Tooltip>
            ))}
          </div>
        </ScrollArea>

        {/* User Section */}
        <div className="p-4 border-t bg-gradient-to-t from-background to-white/50">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Avatar className="h-9 w-9 border-2 border-white shadow-sm group-hover:scale-105 transition-transform duration-300">
                <AvatarImage src={user?.picture} className="object-cover" />
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                  {user?.name?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className={cn(
                "absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-background transition-all duration-300",
                getStatusColor()
              )} />
            </div>
            {!desktopCollapsed && (
              <div className="flex-1 min-w-0 transition-all duration-300">
                <p className="text-sm font-medium truncate">{user?.name}</p>
                <p className="text-xs text-muted-foreground truncate">
                  {user?.email}
                </p>
              </div>
            )}
          </div>

          {!desktopCollapsed && <Separator className="my-3" />}

          <div className={cn("space-y-1", desktopCollapsed ? "flex justify-center mt-2" : "")}>
            <Tooltip disableHoverableContent={!desktopCollapsed}>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full justify-start gap-2 group transition-colors",
                    desktopCollapsed ? "px-2" : "px-3"
                  )}
                  size="sm"
                >
                  <Settings className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors group-hover:rotate-45 duration-500" />
                  {!desktopCollapsed && (
                    <span className="text-muted-foreground group-hover:text-primary transition-colors">
                      Settings
                    </span>
                  )}
                </Button>
              </TooltipTrigger>
              {desktopCollapsed && (
                <TooltipContent side="right">Settings</TooltipContent>
              )}
            </Tooltip>
            <Tooltip disableHoverableContent={!desktopCollapsed}>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full justify-start gap-2 text-muted-foreground hover:text-destructive group transition-colors",
                    desktopCollapsed ? "px-2" : "px-3"
                  )}
                  size="sm"
                  onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}
                >
                  <LogOut className="h-4 w-4 group-hover:text-destructive transition-colors group-hover:-rotate-12 duration-500" />
                  {!desktopCollapsed && (
                    <span className="group-hover:text-destructive transition-colors">
                      Sign Out
                    </span>
                  )}
                </Button>
              </TooltipTrigger>
              {desktopCollapsed && (
                <TooltipContent side="right">Sign Out</TooltipContent>
              )}
            </Tooltip>
          </div>
        </div>
      </aside>

      {/* Mobile Sidebar Trigger */}
      <Button
        variant="outline"
        size="icon"
        className="lg:hidden fixed bottom-4 right-4 z-50 shadow-lg rounded-full w-12 h-12 bg-background backdrop-blur-sm bg-opacity-80 transition-transform hover:scale-105 hover:shadow-xl"
        onClick={() => setMobileOpen(true)}
      >
        <Menu className="h-5 w-5" />
      </Button>

      {/* Mobile Sidebar */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300 animate-fadeIn"
            onClick={() => setMobileOpen(false)}
          />

          {/* Sidebar Content */}
          <div className="absolute left-0 top-0 h-full w-[85%] max-w-xs bg-background shadow-xl transform transition-transform duration-300 flex flex-col backdrop-blur-lg bg-opacity-95 animate-slideIn">
            <div className="p-4 border-b flex items-center justify-between bg-gradient-to-r from-blue-50 to-white">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg">
                  <img src="/eglelogo.jpg" alt="Logo" className="h-8 w-8" />
                </div>
                <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
                  CoConnect
                </h2>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full hover:bg-accent transition-colors"
                onClick={() => setMobileOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Mobile Search */}
            <div className="p-3 border-b">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search..."
                  className="pl-9 transition-all duration-300 focus:ring-2 focus:ring-primary/30"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <ScrollArea className="flex-1 py-2">
              <div className="space-y-1 px-2">
                {/* Dashboard */}
                <Link
                  to="/app"
                  className={cn(
                    "flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 hover:bg-accent/50 relative",
                    isActive('/app')
                      ? "bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-100 shadow-sm"
                      : "hover:bg-accent/50"
                  )}
                  onClick={() => setMobileOpen(false)}
                >
                  <div className="relative">
                    <LayoutDashboard className={cn(
                      "h-4 w-4 transition-colors",
                      isActive('/app') ? "text-blue-600" : "text-muted-foreground"
                    )} />
                  </div>
                  <span className={cn(
                    "font-medium transition-colors",
                    isActive('/app') ? "text-primary" : "text-muted-foreground"
                  )}>
                    Dashboard
                  </span>
                  {isActive('/app') && (
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 h-2 w-2 rounded-full bg-blue-600 animate-pulse" />
                  )}
                </Link>

                {/* Conversations Accordion */}
                <div className="mt-1">
                  <Button
                    variant="ghost"
                    className="w-full justify-start gap-3 p-2 hover:bg-accent/50 rounded-md transition-colors duration-200"
                    onClick={() => toggleAccordion('conversations')}
                  >
                    <MessageSquare className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium text-muted-foreground flex-1 text-left">
                      Conversations
                    </span>
                    {activeAccordion === 'conversations' ? (
                      <ChevronUp className="h-4 w-4 text-muted-foreground transition-transform duration-200" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform duration-200" />
                    )}
                  </Button>

                  {activeAccordion === 'conversations' && (
                    <div className="ml-2 mt-1 space-y-1 animate-fadeIn">
                      {conversationItems.map((item) => (
                        <Link
                          to={item.path}
                          key={item.path}
                          className={cn(
                            "flex items-center gap-3 px-4 py-2 pl-12 rounded-xl transition-all duration-200 hover:bg-accent/50 relative",
                            isActive(item.path) && "bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-100"
                          )}
                          onClick={() => setMobileOpen(false)}
                        >
                          <item.icon className={cn(
                            "h-4 w-4",
                            isActive(item.path) ? "text-blue-600" : "text-muted-foreground"
                          )} />
                          <span className={cn(
                            "font-medium",
                            isActive(item.path) ? "text-primary" : "text-muted-foreground"
                          )}>
                            {item.label}
                          </span>
                          {isActive(item.path) && (
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 h-2 w-2 rounded-full bg-blue-600 animate-pulse" />
                          )}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>

                {/* Other Main Navigation Items */}
                {filteredNavItems.slice(1).map((item) => (
                  <Link
                    to={item.path}
                    key={item.path}
                    className={cn(
                      "flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 hover:bg-accent/50 relative",
                      isActive(item.path)
                        ? "bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-100 shadow-sm"
                        : "hover:bg-accent/50"
                    )}
                    onClick={() => setMobileOpen(false)}
                  >
                    <div className="relative">
                      <item.icon className={cn(
                        "h-4 w-4 transition-colors",
                        isActive(item.path) ? "text-blue-600" : "text-muted-foreground"
                      )} />
                    </div>
                    <span className={cn(
                      "font-medium transition-colors",
                      isActive(item.path) ? "text-primary" : "text-muted-foreground"
                    )}>
                      {item.label}
                    </span>
                    {isActive(item.path) && (
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 h-2 w-2 rounded-full bg-blue-600 animate-pulse" />
                    )}
                  </Link>
                ))}
              </div>
            </ScrollArea>

            {/* Mobile User Section */}
            <div className="p-4 border-t bg-gradient-to-t from-background to-white/50 mt-auto">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Avatar className="h-9 w-9 border-2 border-white shadow-sm">
                    <AvatarImage src={user?.picture} className="object-cover" />
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                      {user?.name?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className={cn(
                    "absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-background",
                    getStatusColor()
                  )} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{user?.name}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {user?.email}
                  </p>
                </div>
              </div>

              <Separator className="my-3" />

              <div className="space-y-1">
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-2 group transition-colors px-3"
                  size="sm"
                >
                  <Settings className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors group-hover:rotate-45 duration-500" />
                  <span className="text-muted-foreground group-hover:text-primary transition-colors">
                    Settings
                  </span>
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-2 text-muted-foreground hover:text-destructive group transition-colors px-3"
                  size="sm"
                  onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}
                >
                  <LogOut className="h-4 w-4 group-hover:text-destructive transition-colors group-hover:-rotate-12 duration-500" />
                  <span className="group-hover:text-destructive transition-colors">
                    Sign Out
                  </span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </TooltipProvider>
  );
};

export default Sidebar;