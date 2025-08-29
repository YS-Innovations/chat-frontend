import { useState } from 'react';
import { Switch } from "@/components/ui/switch";
import { useAuthShared } from '@/hooks/useAuthShared';
import { toast } from 'sonner';
import type { Member } from '../../types/types';
import { blockUser, unblockUser } from '../../api/auth0Api';

export const UserStatusSwitch = ({ member }: { member: Member }) => {
  const [loading, setLoading] = useState(false);
  const [isBlocked, setIsBlocked] = useState<boolean>(member.blocked);

  const { getAccessTokenSilently } = useAuthShared();

  const handleStatusChange = async (checked: boolean) => {
    setLoading(true);
    setIsBlocked(checked); // Optimistically update UI

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

      // Do not refetch or navigate — local state handles UI
    } catch (error) {
      setIsBlocked(!checked); // Revert on error
      toast.error(error instanceof Error ? error.message : 'Operation failed');
      console.error('Error updating user status:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Switch
        checked={isBlocked}
        onCheckedChange={handleStatusChange}
        disabled={loading}
        onClick={(e) => e.stopPropagation()} // 👈 Prevent row click / navigation
      />
      <span className={isBlocked ? "text-destructive" : "text-success"}>
        {isBlocked ? "Blocked" : "Active"}
      </span>
    </div>
  );
};
