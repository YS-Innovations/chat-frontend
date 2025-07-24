import { PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import { useContactsLogic } from './hooks/useTeamLogic';
import { MembersPanel } from './panel/MembersPanel';
import { DetailsPanel } from './panel/DetailsPanel';

export function Teams() {
  const {
    panelMode,
    selectedMember,
    actionLoading,
  } = useContactsLogic();

  return (
    <div className="flex flex-col">
      <div className="flex-1">
        <PanelGroup direction="horizontal">
          <MembersPanel />
          {panelMode === 'details' && (
            <>
              <PanelResizeHandle className="w-2 group relative">
                <div className="absolute inset-0 bg-border transition-colors group-hover:bg-primary group-active:bg-primary w-1 mx-auto" />
              </PanelResizeHandle>
              <DetailsPanel
                panelMode={panelMode}
                selectedMember={selectedMember}
                loading={actionLoading}
              />
            </>
          )}
        </PanelGroup>
      </div>
    </div>
  );
}
