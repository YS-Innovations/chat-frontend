import { useState } from 'react';
import { Switch } from "@/components/ui/switch";
import { useAuth0 } from '@auth0/auth0-react';
import { toast } from 'sonner';
import type { Member } from '../../types/types';
import { useMembers } from '../../hooks/useMembers';
import { blockUser, unblockUser } from '../../api/auth0Api';

export const UserStatusSwitch = ({ member }: { member: Member }) => {
  const [loading, setLoading] = useState(false);
  const { getAccessTokenSilently } = useAuth0();
  const { fetchMembers } = useMembers();

  const handleStatusChange = async (checked: boolean) => {
    setLoading(true);
    try {
      const token = await getAccessTokenSilently({
        authorizationParams: {
          audience: import.meta.env.VITE_AUTH0_AUDIENCE,
        },
      });
      
      if (checked) {
        await blockUser(member.uuid || member.id, token);
        toast.success('User blocked successfully');
      } else {
        await unblockUser(member.uuid || member.id, token);
        toast.success('User unblocked successfully');
      }
      
      // Refresh member list after a short delay
      setTimeout(() => fetchMembers(), 500);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Operation failed');
      console.error('Error updating user status:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Switch
        checked={member.blocked}
        onCheckedChange={handleStatusChange}
        disabled={loading}
      />
      <span className={member.blocked ? "text-destructive" : "text-success"}>
        {member.blocked ? "Blocked" : "Active"}
      </span>
    </div>
  );
};