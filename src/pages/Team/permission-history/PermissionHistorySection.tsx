import { useState, useEffect } from "react";
import { Clock } from "lucide-react";
import { toast } from "sonner";
import { useAuthShared } from "@/hooks/useAuthShared";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PermissionHistorys } from "./permission-history";
import type { PermissionHistory } from "../types/types";

const PAGE_SIZE = 2;

interface Props {
  memberId: string;
  disabled?: boolean;
}

export function PermissionHistorySection({ memberId, disabled }: Props) {
  const { getAccessTokenSilently } = useAuthShared();
  const [showPermissionHistoryModal, setShowPermissionHistoryModal] = useState(false);
  const [permissionHistory, setPermissionHistory] = useState<PermissionHistory[]>([]);
  const [skip, setSkip] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const fetchPermissionHistory = async (reset = false) => {
    try {
      setLoading(true);
      const token = await getAccessTokenSilently();
      const res = await fetch(
        `${backendUrl}/auth/permissions/${memberId}/history?skip=${reset ? 0 : skip}&take=${PAGE_SIZE}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!res.ok) throw new Error("Failed to fetch permission history");
      const data: PermissionHistory[] = await res.json();

      if (reset) {
        setPermissionHistory(data);
        setSkip(data.length);
      } else {
        setPermissionHistory((prev) => [...prev, ...data]);
        setSkip((prev) => prev + data.length);
      }

      setHasMore(data.length === PAGE_SIZE);
    } catch (error) {
      console.error("Error fetching permission history:", error);
      toast.error("Could not load permission history");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (showPermissionHistoryModal) {
      // Reset state and load first page
      setPermissionHistory([]);
      setSkip(0);
      setHasMore(true);
      fetchPermissionHistory(true);
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

          {hasMore && (
            <div className="mt-4 flex justify-center">
              <Button
                variant="outline"
                onClick={() => fetchPermissionHistory()}
                disabled={loading}
              >
                {loading ? "Loading..." : "Show More"}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
