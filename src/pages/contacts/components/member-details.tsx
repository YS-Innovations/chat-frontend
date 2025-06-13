import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { getInitials } from "@/lib/utils";
import { Mail, X } from "lucide-react";
import type { Member } from "../types";
import { PermissionView } from "@/pages/permissions/components/permission-view";
import { PermissionEdit } from "@/pages/permissions/components/permission-edit";
import { usePermissions } from "@/context/PermissionsContext";
import { useAuth0 } from "@auth0/auth0-react";

interface MemberDetailsProps {
  member: Member;
  onClose: () => void;
  permissions: Record<string, boolean>;
  onUpdatePermissions: (permissions: Record<string, boolean>) => Promise<void>;
  loading?: boolean;
}

export function MemberDetails({
  member,
  onClose,
  permissions,
  onUpdatePermissions,
  loading = false,
}: MemberDetailsProps) {
  const [isEditingPermissions, setIsEditingPermissions] = useState(false);
  const [currentPermissions, setCurrentPermissions] = 
    useState<Record<string, boolean>>(permissions);
  const { hasPermission, role } = usePermissions();
  const [deleting, setDeleting] = useState(false);
  const { getAccessTokenSilently } = useAuth0();


  const canDelete = role === 'ADMIN' || 
                   (hasPermission('user-delete') && member.role === 'AGENT');

  const handleDelete = async (e: React.MouseEvent, memberId: string) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    
    try {
      setDeleting(true);
      const token = await getAccessTokenSilently();
      await fetch(`http://localhost:3000/auth/members/${memberId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      // Refresh list or remove from UI
    } catch (error) {
      console.error('Delete failed:', error);
    } finally {
      setDeleting(false);
    }
  };

  // Reset permissions when member changes
  useEffect(() => {
    setCurrentPermissions(permissions);
    setIsEditingPermissions(false);
  }, [member.id, permissions]);

  const handleSavePermissions = async (updatedPermissions: Record<string, boolean>) => {
    try {
      await onUpdatePermissions(updatedPermissions);
      setCurrentPermissions(updatedPermissions);
    } finally {
      setIsEditingPermissions(false);
    }
  };

  // Determine visibility of permission sections
  const canViewPermissions = role === 'ADMIN' || hasPermission('permission-view');
  const canEditPermissions = role === 'ADMIN' || hasPermission('permission-edit');

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center p-4 border-b">
        <h2 className="text-lg font-semibold">Member Details</h2>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="flex-1 p-6 overflow-auto">
        <div className="flex flex-col items-center mb-6">
          <Avatar className="h-24 w-24 mb-4">
            {member.picture && (
              <AvatarImage src={member.picture} alt={member.name || member.email} />
            )}
            <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white text-3xl">
              {getInitials(member.name || member.email)}
            </AvatarFallback>
          </Avatar>
          
          <h3 className="text-xl font-bold">{member.name || 'No name'}</h3>
          <p className="text-muted-foreground flex items-center mt-1">
            <Mail className="h-4 w-4 mr-2" />
            {member.email}
          </p>
          
          <Badge 
            variant={member.role === 'ADMIN' ? 'destructive' : 'default'}
            className="mt-3"
          >
            {member.role}
          </Badge>
        </div>
        <div className="flex gap-2 justify-end">
          {canDelete && (
            <Button 
              variant="destructive" 
              size="sm"
              onClick={(e) => handleDelete(e, member.id)}
              disabled={deleting}
            >
              {deleting ? 'Deleting...' : 'Delete'}
            </Button>
          )}
        </div>

        {canViewPermissions && (
          isEditingPermissions ? (
            <PermissionEdit
              initialPermissions={currentPermissions}
              onSave={handleSavePermissions}
              onCancel={() => setIsEditingPermissions(false)}
              saving={loading}
            />
          ) : (
            <PermissionView
              selectedPermissions={currentPermissions}
              onEdit={() => canEditPermissions && setIsEditingPermissions(true)}
              canEdit={canEditPermissions}
            />
          )
        )}
      </div>
    </div>
  );
}