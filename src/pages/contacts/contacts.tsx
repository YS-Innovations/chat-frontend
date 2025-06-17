// src/pages/contacts/contacts.tsx
import { useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Search, UserPlus } from 'lucide-react';
import type { Member } from './types';
import { MemberList } from './components/member-list';
import { InviteForm } from './components/invite-form';
import { MemberDetails } from './components/member-details';
import { usePermissions } from '@/context/PermissionsContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { InactiveMembersTab } from './inactive-members-tab';

export function Contacts() {
  const { user, getAccessTokenSilently } = useAuth0();
  const { hasPermission, role } = usePermissions();
  const [members, setMembers] = useState<Member[]>([]);
  const [filteredMembers, setFilteredMembers] = useState<Member[]>([]);
  const [error, setError] = useState('');
  const [membersLoading, setMembersLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [panelMode, setPanelMode] = useState<'invite' | 'details' | null>(null);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const canViewInactive = role === 'ADMIN' || hasPermission('inactive-members-view');

  useEffect(() => {
    if (user) fetchMembers();
  }, [user]);

  useEffect(() => {
    const results = members.filter(member =>
      member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (member.name && member.name.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    setFilteredMembers(results);
  }, [searchTerm, members]);

  const fetchMembers = async () => {
    setMembersLoading(true);
    try {
      const token = await getAccessTokenSilently({
        authorizationParams: {
          audience: import.meta.env.VITE_AUTH0_AUDIENCE,
        },
      });

      const response = await fetch('http://localhost:3000/auth/members', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error('Failed to fetch members');

      const membersData = await response.json();
      setMembers(membersData);
      setFilteredMembers(membersData);
    } catch (err) {
      console.error('Error fetching members:', err);
      setError('Failed to fetch organization members');
    } finally {
      setMembersLoading(false);
    }
  };

  const handleInviteSuccess = () => {
    fetchMembers();
    setTimeout(() => setPanelMode(null), 2000);
  };

  const handleMemberSelect = (member: Member) => {
    if (role === 'ADMIN' || hasPermission('member-details')) {
      setSelectedMember(member);
      setPanelMode('details');
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
            templateName 
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update permissions');
      }
      
      // Update local state
      setMembers(prev => prev.map(m => 
        m.id === selectedMember.id ? { ...m, permissions } : m
      ));
      
      // Update selected member if it's the same
      setSelectedMember(prev => 
        prev && prev.id === selectedMember.id ? { ...prev, permissions } : prev
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update permissions');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 p-6">
        <PanelGroup direction="horizontal" className="h-full rounded-lg border">
          <Panel id="main-panel" order={1} defaultSize={panelMode ? 60 : 100} minSize={40} className="pr-4">
            <Card className="h-full">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg">Team Members</CardTitle>
                  <div className="flex gap-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search members..."
                        className="pl-10"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                    {(role === 'ADMIN' || hasPermission('invite-form')) && (
                      <Button onClick={() => {
                        setSelectedMember(null);
                        setPanelMode('invite');
                      }}>
                        <UserPlus className="mr-2 h-4 w-4" />
                        Invite
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="h-[calc(100%-100px)] overflow-y-auto">
                <Tabs defaultValue="active">
                  <TabsList className="mb-4">
                    <TabsTrigger value="active">Active Members</TabsTrigger>
                    {canViewInactive && (
                      <TabsTrigger value="inactive">Inactive Members</TabsTrigger>
                    )}
                  </TabsList>
                  <TabsContent value="active">
                    <MemberList
                      members={filteredMembers}
                      loading={membersLoading}
                      error={error}
                      onSelect={handleMemberSelect}
                    />
                  </TabsContent>
                  {canViewInactive && (
                    <TabsContent value="inactive">
                      <InactiveMembersTab />
                    </TabsContent>
                  )}
                </Tabs>
              </CardContent>
            </Card>
          </Panel>

          {panelMode && (
            <>
              <PanelResizeHandle className="w-2 group relative">
                <div className="absolute inset-0 bg-border transition-colors group-hover:bg-primary group-active:bg-primary w-1 mx-auto" />
              </PanelResizeHandle>

              <Panel id="side-panel" order={2} defaultSize={40} minSize={30} className="pl-4">
                <Card className="h-full">
                  {panelMode === 'invite' ? (
                    <InviteForm
                      onClose={() => setPanelMode(null)}
                      onInviteSuccess={handleInviteSuccess}
                    />
                  ) : (
                    selectedMember && (
                      <MemberDetails
                        member={selectedMember}
                        onClose={() => {
                          setSelectedMember(null);
                          setPanelMode(null);
                        }}
                        loading={actionLoading}
                        permissions={selectedMember.permissions || {}}
                        onUpdatePermissions={handleUpdatePermissions}
                      />
                    )
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