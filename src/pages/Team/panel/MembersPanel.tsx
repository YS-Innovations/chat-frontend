import { useRef, useEffect, useState } from 'react';
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

const ROLE_OPTIONS = [
  { display: 'Admin', value: 'ADMIN' },
  { display: 'Co-admin', value: 'COADMIN' },
  { display: 'Agent', value: 'AGENT' },
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
    setSelectedRoles
  } = useContactsLogic();

  const inputRef = useRef<HTMLInputElement>(null);
  const filterRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { search: urlSearch } = useLocation();

  const [filterOpen, setFilterOpen] = useState(false);

  // Close popup if clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setFilterOpen(false);
      }
    }
    if (filterOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [filterOpen]);

  // Load query from URL on mount
  useEffect(() => {
    const params = new URLSearchParams(urlSearch);
    const q = params.get('search') || '';
    if (q !== searchQuery) {
      setSearchQuery(q);
    }
    inputRef.current?.focus();
  }, []);

  const [debounced] = useDebounce(searchQuery, 300);

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
    setFilterOpen(false);
  };

  const clearAllFilters = () => {
    setSelectedRoles([]);
    setSearchQuery('');
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
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg">Team Members</CardTitle>
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Input
                  ref={inputRef}
                  type="text"
                  placeholder="Search members"
                  value={searchQuery}
                  onChange={(e) => {
                    setPageIndex(0);
                    setSearchQuery(e.target.value);
                  }}
                  className="h-9 pr-8"
                />
                {searchQuery && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1"
                    onClick={handleClear}
                  >
                    <X />
                  </Button>
                )}
              </div>

              {/* Filter button and popup */}
              <div className="relative" ref={filterRef}>
                <Button 
                  variant={selectedRoles.length > 0 ? "secondary" : "default"}
                  onClick={() => setFilterOpen(open => !open)}
                >
                  Filter
                  {selectedRoles.length > 0 && (
                    <span className="ml-2 bg-primary rounded-full px-2 py-0.5 text-xs">
                      {selectedRoles.length}
                    </span>
                  )}
                </Button>
                {filterOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white border rounded shadow-lg z-50">
                    <div className="p-2 border-b">
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="font-semibold">Role</h3>
                        <Button 
                          variant="link" 
                          size="sm"
                          onClick={clearAllFilters}
                          disabled={selectedRoles.length === 0}
                        >
                          Clear
                        </Button>
                      </div>
                      <div className="flex flex-col space-y-1">
                        {ROLE_OPTIONS.map((role) => (
                          <label
                            key={role.value}
                            className="inline-flex items-center space-x-2 cursor-pointer p-1 hover:bg-gray-50 rounded"
                          >
                            <input
                              type="checkbox"
                              checked={selectedRoles.includes(role.value)}
                              onChange={() => toggleRole(role.value)}
                              className="form-checkbox rounded text-primary focus:ring-primary"
                            />
                            <span>{role.display}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <Button onClick={handleInviteClick}>
                <UserPlus className="mr-2 h-4 w-4" />
                Invite
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="h-[calc(100%-100px)] overflow-y-auto">
          <Tabs value={activeTab} onValueChange={handleTabChange}>
            <TabsList className="mb-4">
              <TabsTrigger value="active">Members</TabsTrigger>
              {canViewInactive && (
                <TabsTrigger value="inactive">Pending Invite</TabsTrigger>
              )}
            </TabsList>
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