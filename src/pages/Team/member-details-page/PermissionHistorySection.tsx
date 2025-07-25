import { useState, useEffect } from "react";
import { Clock } from "lucide-react";
import { toast } from "sonner";
import { useAuth0 } from "@auth0/auth0-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PermissionHistorys } from "../permission-history/permission-history";
import type { PermissionHistory } from "../types/types";

interface Props {
  memberId: string;
  disabled?: boolean;
}

export function PermissionHistorySection({ memberId, disabled }: Props) {
  const { getAccessTokenSilently } = useAuth0();
  const [showPermissionHistoryModal, setShowPermissionHistoryModal] = useState(false);
  const [permissionHistory, setPermissionHistory] = useState<PermissionHistory[]>([]);

  useEffect(() => {
    const fetchPermissionHistory = async () => {
      try {
        const token = await getAccessTokenSilently();
        const res = await fetch(
          `http://localhost:3000/auth/permissions/${memberId}/history`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (!res.ok) throw new Error("Failed to fetch permission history");
        const data = await res.json();
        setPermissionHistory(data);
      } catch (error) {
        console.error("Error fetching permission history:", error);
        toast.error("Could not load permission history");
      }
    };

    if (showPermissionHistoryModal) {
      fetchPermissionHistory();
    }
  }, [memberId, getAccessTokenSilently, showPermissionHistoryModal]);

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setShowPermissionHistoryModal(true)}
        disabled={disabled}
      >
        <Clock className="h-4 w-4 mr-2" />
        Permission Changes History
      </Button>

      <Dialog open={showPermissionHistoryModal} onOpenChange={setShowPermissionHistoryModal}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>Permission History</DialogTitle>
          </DialogHeader>
          <PermissionHistorys history={permissionHistory} />
        </DialogContent>
      </Dialog>
    </>
  );
}
