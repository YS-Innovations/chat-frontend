// src/pages/contacts/components/invite-form.tsx
import { useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, X } from "lucide-react";

interface InviteFormProps {
  onClose: () => void;
  onInviteSuccess: () => void;
}

export function InviteForm({ onClose, onInviteSuccess }: InviteFormProps) {
  const { user, getAccessTokenSilently } = useAuth0();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [inviteStatus, setInviteStatus] = useState('');

  const handleInvite = async () => {
    if (!email) return;

    try {
      setLoading(true);
      setInviteStatus('');
      const token = await getAccessTokenSilently();
      const response = await fetch('http://localhost:3000/auth/invite', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        setEmail('');
        setInviteStatus('Invitation sent successfully');
        onInviteSuccess();
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to send invitation');
      }
    } catch (err) {
      setError('Failed to send invitation');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center p-4 border-b">
        <h2 className="text-lg font-semibold">Invite New Member</h2>
        <Button 
          variant="ghost" 
          size="icon"
          onClick={onClose}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="flex-1 p-6 overflow-auto">
        {inviteStatus ? (
          <Alert className="mb-4">
            <AlertDescription>{inviteStatus}</AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-6 py-4">
            <div>
              <p className="text-sm text-muted-foreground mb-2">
                Enter email address to send invitation
              </p>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="member@example.com"
              />
            </div>
            
            <div className="border rounded-lg p-4">
              <h3 className="font-medium mb-3">Invitation Details</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="space-y-1">
                  <p className="text-muted-foreground">Role</p>
                  <p>Agent</p>
                </div>
                <div className="space-y-1">
                  <p className="text-muted-foreground">Permissions</p>
                  <p>View and manage contacts</p>
                </div>
                <div className="space-y-1">
                  <p className="text-muted-foreground">Expiration</p>
                  <p>7 days</p>
                </div>
                <div className="space-y-1">
                  <p className="text-muted-foreground">Organization</p>
                  <p>{user?.org_name || 'Your Organization'}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      <div className="p-4 border-t flex justify-end">
        {!inviteStatus && (
          <Button
            onClick={handleInvite}
            disabled={loading}
            className="w-full sm:w-auto"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : 'Send Invitation'}
          </Button>
        )}
      </div>
    </div>
  );
}