import { useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { UserPlus } from 'lucide-react';
import type { Member, Role } from './types';
import { MemberDetails } from './member-details-page/member-details';
import { usePermissions } from '@/context/permissions';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { InactiveMembersTab } from './inactive-members-tab';
import { useMembers } from './hooks/useMembers';
import { MemberDataTable } from './member-table/member-data-table';
import { Outlet, useNavigate, useParams, useMatch } from 'react-router-dom';

export function Contacts() {
  const { getAccessTokenSilently } = useAuth0();
  const { hasPermission, role } = usePermissions();
  const navigate = useNavigate();

  const { memberId } = useParams<{ memberId?: string }>();
  const activeTabMatch = useMatch('/app/contacts/active/*');
  const inactiveTabMatch = useMatch('/app/contacts/inactive/*');
  const inviteRouteMatch = useMatch('/app/contacts/invite');

  const [activeTab, setActiveTab] = useState<'active' | 'inactive'>(
    activeTabMatch ? 'active' : inactiveTabMatch ? 'inactive' : 'active'
  );

  const {
    members,
    totalCount,
    error,
    loading: membersLoading,
    pageIndex,
    setPageIndex,
    pageSize,
    setPageSize,
    fetchMembers
  } = useMembers();

  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [panelMode, setPanelMode] = useState<'details' | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const canViewInactive = role === 'ADMIN' || hasPermission('inactive-members-view');

  useEffect(() => {
    if (activeTabMatch) setActiveTab('active');
    else if (inactiveTabMatch) setActiveTab('inactive');
  }, [activeTabMatch, inactiveTabMatch]);

  useEffect(() => {
    if (memberId && members.length > 0) {
      const member = members.find(m => m.id === memberId);
      if (member) {
        setSelectedMember(member);
        setPanelMode('details');
      } else {
        setSelectedMember(null);
        setPanelMode(null);
      }
    } else {
      setSelectedMember(null);
      setPanelMode(null);
    }
  }, [memberId, members]);

  const handleMemberSelect = (member: Member) => {
    if (role === 'ADMIN' || hasPermission('member-details')) {
      navigate(`/app/contacts/${activeTab}/user/${member.id}`);
    }
  };

  const handleRoleUpdate = async (memberId: string, newRole: Role) => {
    setActionLoading(true);
    try {
      const token = await getAccessTokenSilently();
      const response = await fetch(
        `http://localhost:3000/auth/members/${memberId}/role`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ role: newRole }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update role');
      }

      await fetchMembers();

      if (selectedMember && selectedMember.id === memberId) {
        setSelectedMember({ ...selectedMember, role: newRole });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdatePermissions = async (
    permissions: Record<string, boolean>,
    saveAsTemplate?: boolean,
    templateName?: string
  ) => {
    if (!selectedMember) return;

    setActionLoading(true);
    try {
      const token = await getAccessTokenSilently();
      const response = await fetch(
        `http://localhost:3000/auth/permissions/${selectedMember.id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            permissions,
            saveAsTemplate,
            templateName,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update permissions');
      }

      await fetchMembers();

      setSelectedMember(prev => (prev ? { ...prev, permissions } : null));
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

const handleTabChange = (value: string) => {
  if (value === 'active' || value === 'inactive') {
    setActiveTab(value);
    setPanelMode(null);
    setSelectedMember(null);
    navigate(`/app/contacts/${value}`);
  }
};

  const handleInviteClick = () => {
    navigate('/app/contacts/invite');
  };

  const closeDetailsPanel = () => {
    setSelectedMember(null);
    setPanelMode(null);
    navigate(`/app/contacts/${activeTab}`);
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 p-6">
        <PanelGroup direction="horizontal" className="h-full rounded-lg border">
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
                  {(role === 'ADMIN' || hasPermission('invite-form')) && (
                    <Button onClick={handleInviteClick}>
                      <UserPlus className="mr-2 h-4 w-4" />
                      Invite
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="h-[calc(100%-100px)] overflow-y-auto">
                <Tabs value={activeTab} onValueChange={handleTabChange}>
                  <TabsList className="mb-4">
                    <TabsTrigger value="active">Active Members</TabsTrigger>
                    {canViewInactive && (
                      <TabsTrigger value="inactive">Inactive Members</TabsTrigger>
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
                      <InactiveMembersTab/>
                    </TabsContent>
                  )}
                </Tabs>
              </CardContent>
            </Card>
          </Panel>

          {(panelMode === 'details' || inviteRouteMatch) && (
            <>
              <PanelResizeHandle className="w-2 group relative">
                <div className="absolute inset-0 bg-border transition-colors group-hover:bg-primary group-active:bg-primary w-1 mx-auto" />
              </PanelResizeHandle>

              <Panel
                id="side-panel"
                order={2}
                defaultSize={67}
                minSize={40}
                className="pl-4"
              >
                <Card className="h-full">
                  {panelMode === 'details' && selectedMember ? (
                    <MemberDetails
                      member={selectedMember}
                      onClose={closeDetailsPanel}
                      loading={actionLoading}
                      permissions={selectedMember.permissions || {}}
                      onUpdatePermissions={handleUpdatePermissions}
                      onRoleUpdate={(newRole) =>
                        handleRoleUpdate(selectedMember.id, newRole)
                      }
                    />
                  ) : (
                    <Outlet />
                  )}
                </Card>
              </Panel>
            </>
          )}
        </PanelGroup>
      </div>
    </div>
  );
}
