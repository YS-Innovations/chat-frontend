import { Panel } from 'react-resizable-panels';
import { Card } from '@/components/ui/card';
import { MemberDetails } from '../member-details-page/member-details';
import { Outlet } from 'react-router-dom';
import { useContactsLogic } from '../hooks/useTeamLogic';

interface DetailsPanelProps {
  panelMode: string | null;
  selectedMember: any;
  loading: boolean;
}

export function DetailsPanel({ panelMode, selectedMember, loading }: DetailsPanelProps) {
  const { closeDetailsPanel, handleUpdatePermissions, handleRoleUpdate } = useContactsLogic();

  return (
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
            loading={loading}
            permissions={selectedMember.permissions || {}}
            onUpdatePermissions={handleUpdatePermissions}
            onRoleUpdate={(newRole) => handleRoleUpdate(selectedMember.id, newRole)}
          />
        ) : (
          <Outlet />
        )}
      </Card>
    </Panel>
  );
}
