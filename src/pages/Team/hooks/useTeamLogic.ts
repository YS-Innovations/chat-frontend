// useContactsLogic.ts
import { useState, useEffect } from 'react';
import { useNavigate, useParams, useMatch } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import { usePermissions } from '@/context/permissions';
import { useMembers } from './useMembers';
import type { Member, Role } from '../types/types';

export function useContactsLogic() {
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
      setSelectedMember(member || null);
      setPanelMode(member ? 'details' : null);
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

  return {
    activeTab,
    setActiveTab,
    handleTabChange,
    handleInviteClick,
    closeDetailsPanel,
    handleMemberSelect,
    handleRoleUpdate,
    handleUpdatePermissions,
    selectedMember,
    panelMode,
    inviteRouteMatch,
    canViewInactive,
    members,
    totalCount,
    error,
    membersLoading,
    pageIndex,
    setPageIndex,
    pageSize,
    setPageSize,
    actionLoading,
  };
}
