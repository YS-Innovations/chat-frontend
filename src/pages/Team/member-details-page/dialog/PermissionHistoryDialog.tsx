import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PermissionHistorys } from "../../permission-history/permission-history";

interface PermissionHistoryDialogProps {
  showPermissionHistoryModal: boolean;
  setShowPermissionHistoryModal: (show: boolean) => void;
  permissionHistory: any[];
}

export function PermissionHistoryDialog({
  showPermissionHistoryModal,
  setShowPermissionHistoryModal,
  permissionHistory
}: PermissionHistoryDialogProps) {
  return (
    <Dialog open={showPermissionHistoryModal} onOpenChange={setShowPermissionHistoryModal}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>Permission History</DialogTitle>
        </DialogHeader>
        <PermissionHistorys history={permissionHistory} />
      </DialogContent>
    </Dialog>
  );
}