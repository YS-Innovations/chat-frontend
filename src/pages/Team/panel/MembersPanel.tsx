import { useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Panel } from 'react-resizable-panels';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { UserPlus, X } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { MemberDataTable } from '../member-table/member-data-table';
import { useContactsLogic } from '../hooks/useTeamLogic';
import { Invitepending } from '../invitePendingMembers/invitePendingMembers';
import { useDebounce } from 'use-debounce';
import { FilterPanel } from './filter-panel';

const ROLE_OPTIONS = [
  { value: 'OWNER', display: 'Owner' },
  { value: 'ADMIN', display: 'admin' },
  { value: 'AGENT', display: 'Agent' },
];

export function MembersPanel() {
  const {
    panelMode,
    inviteRouteMatch,
    activeTab,
    handleTabChange,
    handleInviteClick,
    canViewInactive,
    members,
    totalCount,
    error,
    membersLoading,
    pageIndex,
    setPageIndex,
    pageSize,
    setPageSize,
    handleMemberSelect,
    searchQuery,
    setSearchQuery,
    sorting,
    setSorting,
    selectedRoles,
    setSelectedRoles,
    clearAllFilters,
  } = useContactsLogic();

  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { search: urlSearch } = useLocation();

  const [debounced] = useDebounce(searchQuery, 300);

  // Load query from URL on mount
  useEffect(() => {
    const params = new URLSearchParams(urlSearch);
    const q = params.get('search') || '';
    if (q !== searchQuery) {
      setSearchQuery(q);
    }
    inputRef.current?.focus();
  }, []);

  // Persist to URL
  useEffect(() => {
    const params = new URLSearchParams(urlSearch);
    if (debounced) params.set('search', debounced);
    else params.delete('search');
    navigate({ search: params.toString() }, { replace: true });
  }, [debounced]);

  const handleClear = () => {
    setSearchQuery('');
    inputRef.current?.focus();
  };

  const toggleRole = (role: string) => {
    setSelectedRoles(prev => 
      prev.includes(role) 
        ? prev.filter(r => r !== role) 
        : [...prev, role]
    );
    setPageIndex(0);
  };

  return (
    <Panel
      id="main-panel"
      order={1}
      defaultSize={panelMode || inviteRouteMatch ? 33 : 100}
      minSize={20}
      className="pr-4"
    >
      <Card className="h-full">
        <CardHeader className="border-b">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <CardTitle className="text-lg">Team Members</CardTitle>
            
            <div className="flex flex-col-reverse sm:flex-row gap-2 sm:items-center">
              <div className="relative flex-1 max-w-md">
                <Input
                  ref={inputRef}
                  placeholder="Search members..."
                  value={searchQuery}
                  onChange={(e) => {
                    setPageIndex(0);
                    setSearchQuery(e.target.value);
                  }}
                  className="pr-8"
                />
                {searchQuery && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6"
                    onClick={handleClear}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </div>

              <div className="flex gap-2">
                <FilterPanel
                  roles={ROLE_OPTIONS}
                  selectedRoles={selectedRoles}
                  onRoleToggle={toggleRole}
                  onClearAll={clearAllFilters}
                />
                
                <Button onClick={handleInviteClick} className="shrink-0">
                  <UserPlus className="mr-2 h-4 w-4" />
                  Invite
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="h-[calc(100%-100px)] overflow-y-auto">
          <Tabs value={activeTab} onValueChange={handleTabChange}>
           
            <TabsContent value="active">
              <MemberDataTable
                members={members}
                totalCount={totalCount}
                loading={membersLoading}
                error={error}
                onSelect={handleMemberSelect}
                searchQuery={searchQuery}
                pageIndex={pageIndex}
                pageSize={pageSize}
                setPageIndex={setPageIndex}
                setPageSize={setPageSize}
                sorting={sorting}
                setSorting={setSorting}
                selectedRoles={selectedRoles}
                setSelectedRoles={setSelectedRoles}
                setSearchQuery={setSearchQuery}
                clearAllFilters={clearAllFilters}
              />
            </TabsContent>
            {canViewInactive && (
              <TabsContent value="inactive">
                <Invitepending />
              </TabsContent>
            )}
          </Tabs>
        </CardContent>
      </Card>
    </Panel>
  );
}