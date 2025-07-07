// src/pages/Team/member-details-page/components/MemberActions.tsx
import { Button } from "@/components/ui/button";
import type { Role } from "../../types/types";

interface MemberActionsProps {
  canDelete: boolean;
  deleting: boolean;
  role?: string;
  memberRole: Role;
  changingRole: boolean;
  handleDelete: (e: React.MouseEvent) => void;
  handleChangeRole: (newRole: Role) => void;
}

export function MemberActions({
  canDelete,
  deleting,
  role,
  memberRole,
  changingRole,
  handleDelete,
  handleChangeRole
}: MemberActionsProps) {
  return (
    <div className="flex gap-2 justify-end px-4 mb-4">
      {canDelete && (
        <Button
          variant="destructive"
          size="sm"
          onClick={handleDelete}
          disabled={deleting}
        >
          {deleting ? 'Deleting...' : 'Delete'}
        </Button>
      )}
      {role === 'ADMIN' && (
        <>
          {memberRole === 'AGENT' && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleChangeRole('COADMIN')}
              disabled={changingRole}
            >
              {changingRole ? 'Changing...' : 'Change to Co-Admin'}
            </Button>
          )}
          {memberRole === 'COADMIN' && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleChangeRole('AGENT')}
              disabled={changingRole}
            >
              {changingRole ? 'Changing...' : 'Change to Agent'}
            </Button>
          )}
        </>
      )}
    </div>
  );
}