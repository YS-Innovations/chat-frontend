import { useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Panel } from 'react-resizable-panels';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { UserPlus, X, Loader2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { MemberDataTable } from '../member-table/member-data-table';
import { useContactsLogic } from '../hooks/useTeamLogic';
import { Invitepending } from '../invitePendingMembers/invitePendingMembers';
import { useDebounce } from 'use-debounce';
import type { SortField } from '../types/types';

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
    sortLoading,
    pageIndex,
    setPageIndex,
    pageSize,
    setPageSize,
    handleMemberSelect,
    searchQuery,
    setSearchQuery,
    sorting,
    setSorting,
  } = useContactsLogic();

  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { search: urlSearch } = useLocation();

  // Load state from URL on mount
  useEffect(() => {
    const params = new URLSearchParams(urlSearch);
    const q = params.get('search') || '';
    const sort = params.get('sort') || '';
    const order = params.get('order') || '';

    if (q !== searchQuery) setSearchQuery(q);
    if (sort && order) {
      setSorting([{ id: sort as SortField, desc: order === 'desc' }]);
    }
    inputRef.current?.focus();
  }, []);

  const [debouncedSearch] = useDebounce(searchQuery, 300);
  const [debouncedSorting] = useDebounce(sorting, 200);

  // Persist state to URL
  useEffect(() => {
    const params = new URLSearchParams(urlSearch);
    
    if (debouncedSearch) params.set('search', debouncedSearch);
    else params.delete('search');

    if (debouncedSorting.length > 0) {
      params.set('sort', debouncedSorting[0].id);
      params.set('order', debouncedSorting[0].desc ? 'desc' : 'asc');
    } else {
      params.delete('sort');
      params.delete('order');
    }

    navigate({ search: params.toString() }, { replace: true });
  }, [debouncedSearch, debouncedSorting]);

  const handleClear = () => {
    setSearchQuery('');
    inputRef.current?.focus();
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
                  onChange={(e) => { setPageIndex(0); setSearchQuery(e.target.value); }}
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
              <div className="relative">
                {sortLoading && (
                  <div className="absolute inset-0 bg-background/50 z-10 flex items-center justify-center">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                )}
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
                />
              </div>
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