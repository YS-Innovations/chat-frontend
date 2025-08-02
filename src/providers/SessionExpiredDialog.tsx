import { useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

export const SessionExpiredDialog = ({ open }: { open: boolean }) => {
  const { logout } = useAuth0();

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
