import { Panel } from 'react-resizable-panels';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { UserPlus } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MemberDataTable } from '../member-table/member-data-table';
import { useContactsLogic } from '../hooks/useTeamLogic';
import { Invitepending } from '../invitePendingMembers/invitePendingMembers';
import { Input } from '@/components/ui/input';

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
  } = useContactsLogic();

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
              <Input
                type="text"
                placeholder="Search members"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-9"
              />
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
                pageIndex={pageIndex}
                pageSize={pageSize}
                setPageIndex={setPageIndex}
                setPageSize={setPageSize}
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
