import { useEffect } from 'react';
import { useAuthShared } from '@/hooks/useAuthShared';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

export const SessionExpiredDialog = ({ open }: { open: boolean }) => {
  const { logout } = useAuthShared();

  useEffect(() => {
    if (open) {
      const timer = setTimeout(() => {
        logout({ logoutParams: { returnTo: window.location.origin } });
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [open, logout]);

  return (
    <Dialog open={open}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>⚠️ Session Expired</DialogTitle>
          <DialogDescription>
            Your login session has expired. You will be logged out automatically. Please log in again to continue.
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};
