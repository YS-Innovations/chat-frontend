import { Link, useLocation } from 'react-router-dom';
import { Button } from './ui/button';
import { 
  ChevronDown, 
  MessageSquare, 
  User, 
  Contact, 
  LayoutDashboard,
  ChevronRight,
  Plus,
  Settings,
  LogOut
} from 'lucide-react';
import { useState } from 'react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from './ui/collapsible';
import { Separator } from './ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { useAuth0 } from '@auth0/auth0-react';

export default function Sidebar() {
  const [isConversationsOpen, setIsConversationsOpen] = useState(false);
  const { user, logout } = useAuth0();
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const navItems = [
    {
      icon: LayoutDashboard,
      label: 'Dashboard',
      path: '/app',
    },
    {
      icon: Contact,
      label: 'Contacts',
      path: '/app/contacts',
    },
    {
      icon: User,
      label: 'Profile',
      path: '/app/profile',
    },
  ];

  return (
    <div className="w-64 h-full bg-background border-r flex flex-col">
      <div className="p-4 border-b flex items-center justify-between">
        <h2 className="text-xl font-semibold">CoConnect</h2>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      
      <nav className="flex-1 p-2 space-y-1">
        {navItems.map((item) => (
          <Button
            key={item.path}
            asChild
            variant={isActive(item.path) ? 'secondary' : 'ghost'}
            className="w-full justify-start gap-2"
          >
            <Link to={item.path}>
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          </Button>
        ))}
        
        <Collapsible
          open={isConversationsOpen}
          onOpenChange={setIsConversationsOpen}
          className="space-y-1"
        >
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              className="w-full justify-between gap-2"
            >
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Conversations
              </div>
              {isConversationsOpen ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="ml-4 space-y-1">
            <Button
              asChild
              variant={isActive('/app/conversations') ? 'secondary' : 'ghost'}
              className="w-full justify-start gap-2 pl-4"
              size="sm"
            >
              <Link to="/app/conversations">
                All Conversations
              </Link>
            </Button>
          </CollapsibleContent>
        </Collapsible>
      </nav>
      
      <div className="p-4 border-t">
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user?.picture} />
            <AvatarFallback>
              {user?.name?.charAt(0) || 'U'}
            </AvatarFallback>
          </Avatar>
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
            className="w-full justify-start gap-2"
            size="sm"
          >
            <Settings className="h-4 w-4" />
            Settings
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start gap-2 text-destructive hover:text-destructive"
            size="sm"
            onClick={() => logout()}
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </div>
    </div>
  );
}