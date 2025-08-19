// src/components/Channel/CreateChannelDialog.tsx

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import LoadingSpinner from '@/components/Loading/LoadingSpinner';

interface CreateChannelDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (createdChannel: any) => void;
  getAccessToken: () => Promise<string>;
  API_URL: string;
}

const CreateChannelDialog: React.FC<CreateChannelDialogProps> = ({ open, onOpenChange, onSuccess, getAccessToken, API_URL }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    domain: '',
  });

  const reset = () => {
    setFormData({ name: '', domain: '' });
    onOpenChange(false);
  };

  const handleSubmit = async () => {
    if (!formData.name) return;

    try {
      setIsSubmitting(true);
      const token = await getAccessToken();

      const response = await fetch(`${API_URL}/channels/init`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          theme: 'light',
          primaryColor: '#2563EB',
          position: 'bottom-right',
          showBranding: true,
          showHelpTab: true,
          allowUploads: true,
          csatEnabled: true,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create channel');
      }

      const createdChannel = await response.json();
      onSuccess(createdChannel);
      reset();
    } catch (err) {
      console.error(err);
      alert(err instanceof Error ? err.message : 'Failed to create channel');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Channel</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="channelName">Channel Name</Label>
            <Input
              id="channelName"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter channel name"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="domain">Domain (optional)</Label>
            <Input
              id="domain"
              value={formData.domain}
              onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
              placeholder="example.com"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={reset}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={!formData.name || isSubmitting}>
            {isSubmitting ? (
              <>
                <LoadingSpinner />
                Creating...
              </>
            ) : 'Create'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateChannelDialog;
