import React, { useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { toast } from 'sonner';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import LoadingSpinner from '@/components/Loading/LoadingSpinner';


type ChannelType = 'WEB' | 'WHATSAPP';
type Theme = 'light' | 'dark';
type Position = 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';

interface ChannelSettings {
  id: string;
  channelId: string;
  name?: string;
  domain?: string;
  theme: Theme;
  primaryColor: string;
  position: Position;
  launcherIcon?: string;
  orgName?: string;
  orgLogo?: string;
  showBranding: boolean;
  showHelpTab: boolean;
  allowUploads: boolean;
  csatEnabled: boolean;
  QuickReply?: any;
  updatedAt: string;
}

interface Channel {
  id: string;
  uuid: string;
  channelToken: string;
  type: ChannelType;
  createdAt: string;
  updatedAt: string;
  channelSettings?: ChannelSettings | null;
  organization?: {
    id: string;
    name: string;
    website: string;
  };
}

interface ChannelSettingsForm {
  name: string;
  domain: string;
  theme: Theme;
  primaryColor: string;
  position: Position;
  showBranding: boolean;
  showHelpTab: boolean;
  allowUploads: boolean;
  csatEnabled: boolean;
}

const API_URL = import.meta.env.VITE_API_URL;

const ChannelsPage: React.FC = () => {
  const { getAccessTokenSilently } = useAuth0();
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showTokenModal, setShowTokenModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newChannel, setNewChannel] = useState<ChannelSettingsForm>({
    name: '',
    domain: '',
    theme: 'light',
    primaryColor: '#2563EB',
    position: 'bottom-right',
    showBranding: true,
    showHelpTab: true,
    allowUploads: true,
    csatEnabled: true,
  });
  const [generatedToken, setGeneratedToken] = useState('');

  useEffect(() => {
    const fetchChannels = async () => {
      try {
        setLoading(true);
        const token = await getAccessTokenSilently();
        const response = await fetch(`${API_URL}/channels`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch channels');
        }

        const data = await response.json();
        setChannels(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
        toast.error('Failed to load channels');
      } finally {
        setLoading(false);
      }
    };

    fetchChannels();
  }, [getAccessTokenSilently]);

  const handleCreateChannel = async () => {
    try {
      setIsSubmitting(true);
      const token = await getAccessTokenSilently();
      const response = await fetch(`${API_URL}/channels/init`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newChannel),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create channel');
      }

      const createdChannel = await response.json();
      setGeneratedToken(createdChannel.channelToken);
      setShowCreateModal(false);
      setShowTokenModal(true);
      setChannels(prev => [...prev, createdChannel]);
      toast.success('Channel created successfully');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to create channel');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateSettings = async () => {
    if (!selectedChannel) return;

    try {
      setIsSubmitting(true);
      const token = await getAccessTokenSilently();
      const method = selectedChannel.channelSettings ? 'PATCH' : 'POST';
      const endpoint = `${API_URL}/channels/${selectedChannel.id}/settings`;

      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newChannel),
      });

      if (!response.ok) {
        throw new Error('Failed to update settings');
      }

      const updatedSettings = await response.json();
      setChannels(prev =>
        prev.map(channel =>
          channel.id === selectedChannel.id
            ? { ...channel, channelSettings: updatedSettings }
            : channel
        )
      );
      setShowSettingsModal(false);
      toast.success('Settings updated successfully');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update settings');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteChannel = async (id: string) => {
    if (!confirm('Are you sure you want to delete this channel?')) return;

    try {
      setIsSubmitting(true);
      const token = await getAccessTokenSilently();
      const response = await fetch(`${API_URL}/channels/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Failed to delete channel');

      setChannels(prev => prev.filter(channel => channel.id !== id));
      toast.success('Channel deleted successfully');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete channel');
    } finally {
      setIsSubmitting(false);
    }
  };

  const openSettingsModal = (channel: Channel) => {
    setSelectedChannel(channel);
    if (channel.channelSettings) {
      setNewChannel({
        name: channel.channelSettings?.name || '',
        domain: channel.channelSettings?.domain || '',
        theme: (channel.channelSettings?.theme as Theme) || 'light',
        primaryColor: channel.channelSettings?.primaryColor || '#2563EB',
        position: (channel.channelSettings?.position as Position) || 'bottom-right',
        showBranding: channel.channelSettings?.showBranding ?? true,
        showHelpTab: channel.channelSettings?.showHelpTab ?? true,
        allowUploads: channel.channelSettings?.allowUploads ?? true,
        csatEnabled: channel.channelSettings?.csatEnabled ?? true,
      });
    }
    setShowSettingsModal(true);
  };

  const resetForms = () => {
    setNewChannel({
      name: '',
      domain: '',
      theme: 'light',
      primaryColor: '#2563EB',
      position: 'bottom-right',
      showBranding: true,
      showHelpTab: true,
      allowUploads: true,
      csatEnabled: true,
    });
    setGeneratedToken('');
    setSelectedChannel(null);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-destructive text-lg">{error}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-foreground">Channels</h1>
        <Button onClick={() => setShowCreateModal(true)}>
          Create Channel
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Channels</CardTitle>
        </CardHeader>
        <CardContent>
          {channels.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No channels found. Create your first channel to get started.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Token</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Settings</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {channels.map((channel) => (
                  <TableRow key={channel.id}>
                    <TableCell className="font-medium">
                      {channel.channelSettings?.name || 'Unnamed'}
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      <span className="truncate max-w-xs inline-block">
                        {channel.channelToken}
                      </span>
                    </TableCell>
                    <TableCell>{channel.type}</TableCell>
                    <TableCell>
                      {new Date(channel.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: '2-digit',
                        year: 'numeric',
                      })}
                    </TableCell>
                    <TableCell>
                      {channel.channelSettings ? (
                        <Badge variant="secondary">Configured</Badge>
                      ) : (
                        <Badge variant="destructive">Not Configured</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openSettingsModal(channel)}
                      >
                        Settings
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteChannel(channel.id)}
                        disabled={isSubmitting}
                      >
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Create Channel Dialog */}
      <Dialog open={showCreateModal} onOpenChange={(open) => {
        if (!open) {
          setShowCreateModal(false);
          resetForms();
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Channel</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="channelName">Channel Name</Label>
              <Input
                id="channelName"
                value={newChannel.name}
                onChange={(e) => setNewChannel({ ...newChannel, name: e.target.value })}
                placeholder="Enter channel name"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="domain">Domain (optional)</Label>
              <Input
                id="domain"
                value={newChannel.domain}
                onChange={(e) => setNewChannel({ ...newChannel, domain: e.target.value })}
                placeholder="example.com"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowCreateModal(false);
                resetForms();
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateChannel}
              disabled={!newChannel.name || isSubmitting}
            >
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

      {/* Token Dialog */}
      <Dialog open={showTokenModal} onOpenChange={(open) => {
        if (!open) {
          setShowTokenModal(false);
          resetForms();
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Channel Created Successfully</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Your Channel Token</Label>
              <div className="p-3 bg-muted rounded-md font-mono break-all">
                {generatedToken}
              </div>
              <p className="text-sm text-muted-foreground">
                Copy this token and use it to connect your application.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowTokenModal(false);
                resetForms();
              }}
            >
              Close
            </Button>
            <Button
              onClick={() => {
                setShowTokenModal(false);
                setShowSettingsModal(true);
              }}
            >
              Configure Settings
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Settings Dialog */}
      <Dialog open={showSettingsModal} onOpenChange={(open) => {
        if (!open) {
          setShowSettingsModal(false);
          resetForms();
        }
      }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {selectedChannel?.channelSettings ? 'Update' : 'Configure'} Channel Settings
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4 md:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="settingsName">Channel Name</Label>
              <Input
                id="settingsName"
                value={newChannel.name}
                onChange={(e) => setNewChannel({ ...newChannel, name: e.target.value })}
                placeholder="Channel name"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="settingsDomain">Domain</Label>
              <Input
                id="settingsDomain"
                value={newChannel.domain}
                onChange={(e) => setNewChannel({ ...newChannel, domain: e.target.value })}
                placeholder="example.com"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="theme">Theme</Label>
              <Select
                value={newChannel.theme}
                onValueChange={(value) => setNewChannel({ ...newChannel, theme: value as Theme })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select theme" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="primaryColor">Primary Color</Label>
              <div className="flex items-center gap-2">
                <input
                  id="primaryColor"
                  type="color"
                  className="w-10 h-10 rounded-md border cursor-pointer"
                  value={newChannel.primaryColor}
                  onChange={(e) => setNewChannel({ ...newChannel, primaryColor: e.target.value })}
                />
                <span className="text-sm">{newChannel.primaryColor}</span>
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="position">Position</Label>
              <Select
                value={newChannel.position}
                onValueChange={(value) => setNewChannel({ ...newChannel, position: value as Position })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select position" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bottom-right">Bottom Right</SelectItem>
                  <SelectItem value="bottom-left">Bottom Left</SelectItem>
                  <SelectItem value="top-right">Top Right</SelectItem>
                  <SelectItem value="top-left">Top Left</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label>Features</Label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="showBranding"
                    checked={newChannel.showBranding}
                    onCheckedChange={(checked) => setNewChannel({ ...newChannel, showBranding: Boolean(checked) })}
                  />
                  <Label htmlFor="showBranding" className="font-normal">
                    Show Branding
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="showHelpTab"
                    checked={newChannel.showHelpTab}
                    onCheckedChange={(checked) => setNewChannel({ ...newChannel, showHelpTab: Boolean(checked) })}
                  />
                  <Label htmlFor="showHelpTab" className="font-normal">
                    Show Help Tab
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="allowUploads"
                    checked={newChannel.allowUploads}
                    onCheckedChange={(checked) => setNewChannel({ ...newChannel, allowUploads: Boolean(checked) })}
                  />
                  <Label htmlFor="allowUploads" className="font-normal">
                    Allow File Uploads
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="csatEnabled"
                    checked={newChannel.csatEnabled}
                    onCheckedChange={(checked) => setNewChannel({ ...newChannel, csatEnabled: Boolean(checked) })}
                  />
                  <Label htmlFor="csatEnabled" className="font-normal">
                    Enable CSAT Surveys
                  </Label>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowSettingsModal(false);
                resetForms();
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdateSettings}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <LoadingSpinner />
                  Saving...
                </>
              ) : 'Save Settings'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ChannelsPage;