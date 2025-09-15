import { useState, useEffect } from 'react';
import { useNavigate, useParams, useMatch } from 'react-router-dom';
import { useAuthShared } from '@/hooks/useAuthShared';
import { usePermissions } from '@/context/permissions';
import { useMembers } from './useMembers';
import type { Member, Role } from '../types/types';

export function useContactsLogic() {
  const { getAccessTokenSilently } = useAuthShared();
  const { hasPermission, role } = usePermissions();
  const navigate = useNavigate();
  const { memberId } = useParams<{ memberId?: string }>();
  const inviteRouteMatch = useMatch('/app/team/invite');

  const {
    members,
    totalCount,
    error,
    loading: membersLoading,
    pageIndex,
    setPageIndex,
    pageSize,
    setPageSize,
    searchQuery,
    setSearchQuery,
    sorting,
    setSorting,
    fetchMembers,
    selectedRoles,
    setSelectedRoles,
    clearAllFilters,
  } = useMembers();

  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [panelMode, setPanelMode] = useState<'details' | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  useEffect(() => 
    {
    fetchMembers(); // Load members initially
  }, [fetchMembers]);

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
    if (role === 'OWNER' || hasPermission('member-details')) {
      navigate(`/app/team/user/${member.id}`);
    }
  };

  const handleInviteClick = () => {
    navigate('/app/team/invite');
  };

  const closeDetailsPanel = () => {
    setSelectedMember(null);
    setPanelMode(null);
    navigate(`/app/team`);
  };

  const handleRoleUpdate = async (memberId: string, newRole: Role) => {
    setActionLoading(true);
    try {
      const token = await getAccessTokenSilently();
      const response = await fetch(
        `${backendUrl}/auth/members/${memberId}/role`,
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
        `${backendUrl}/auth/permissions/${selectedMember.id}`,
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
    handleInviteClick,
    closeDetailsPanel,
    handleMemberSelect,
    handleRoleUpdate,
    handleUpdatePermissions,
    selectedMember,
    panelMode,
    inviteRouteMatch,
    members,
    totalCount,
    error,
    membersLoading,
    pageIndex,
    setPageIndex,
    pageSize,
    setPageSize,
    searchQuery,
    setSearchQuery,
    sorting,
    setSorting,
    actionLoading,
    selectedRoles,
    setSelectedRoles,
    clearAllFilters,
    fetchMembers,
  };
}
