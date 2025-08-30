import React, { useState, useEffect, useCallback } from 'react';
import { useAuthShared } from '@/hooks/useAuthShared';
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
import { Link } from 'react-router-dom';
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
import CreateChannelDialog from './CreateChannelDialog';
import { io, Socket } from 'socket.io-client';
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

interface WebSocketEvent {
  type: string;
  data: any;
}

class WebSocketService {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectInterval = 3000;
  private eventHandlers: Map<string, ((data: any) => void)[]> = new Map();
  private isConnected = false;

  constructor() {
    this.connect();
  }

  connect() {
    try {
      // Use the same origin as your API with Socket.io path
      const socketUrl = import.meta.env.VITE_BACKEND_URL || window.location.origin;
      this.socket = io(socketUrl, {
        path: '/socket.io', // This is the default Socket.io path
        transports: ['websocket', 'polling'] // Fallback to polling if websocket fails
      });

      this.socket.on('connect', () => {
        console.log('Socket.io connected');
        this.isConnected = true;
        this.reconnectAttempts = 0;
        this.emitEvent('connection:established', { timestamp: Date.now() });
      });

      this.socket.on('disconnect', (reason) => {
        console.log('Socket.io disconnected:', reason);
        this.isConnected = false;
        this.emitEvent('connection:lost', { timestamp: Date.now(), reason });
        this.handleReconnection();
      });

      this.socket.on('connect_error', (error) => {
        console.error('Socket.io connection error:', error);
        this.emitEvent('connection:error', { error });
      });

      // Listen for all events from server
      this.socket.onAny((event, data) => {
        this.handleMessage({ type: event, data });
      });

    } catch (error) {
      console.error('Socket.io connection failed:', error);
    }
  }

  private handleReconnection() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      setTimeout(() => {
        console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
        this.connect();
      }, this.reconnectInterval);
    } else {
      console.error('Max reconnection attempts reached');
      this.emitEvent('connection:failed', { message: 'Max reconnection attempts reached' });
    }
  }

  private handleMessage(message: { type: string; data: any }) {
    const handlers = this.eventHandlers.get(message.type) || [];
    handlers.forEach(handler => handler(message.data));
  }

  on(event: string, handler: (data: any) => void) {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, []);
    }
    this.eventHandlers.get(event)!.push(handler);
  }

  off(event: string, handler: (data: any) => void) {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
  }

  emit(event: string, data: any) {
    if (this.socket && this.isConnected) {
      this.socket.emit(event, data);
    }
  }

  emitEvent(event: string, data: any) {
    const handlers = this.eventHandlers.get(event) || [];
    handlers.forEach(handler => handler(data));
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.isConnected = false;
  }

  getConnectionStatus() {
    return this.isConnected;
  }
}

// Create a singleton instance
const webSocketService = new WebSocketService();

// Custom hook for using WebSocket
const useWebSocket = () => {
  const [isConnected, setIsConnected] = useState(webSocketService.getConnectionStatus());

  useEffect(() => {
    const handleConnectionChange = () => {
      setIsConnected(webSocketService.getConnectionStatus());
    };

    webSocketService.on('connection:established', handleConnectionChange);
    webSocketService.on('connection:lost', handleConnectionChange);

    return () => {
      webSocketService.off('connection:established', handleConnectionChange);
      webSocketService.off('connection:lost', handleConnectionChange);
    };
  }, []);

  const on = useCallback((event: string, handler: (data: any) => void) => {
    webSocketService.on(event, handler);
    return () => webSocketService.off(event, handler);
  }, []);

  const emit = useCallback((event: string, data: any) => {
    webSocketService.emit(event, data);
  }, []);

  return {
    isConnected,
    on,
    emit,
    webSocketService
  };
};

const API_URL = import.meta.env.VITE_API_URL;

const ChannelsPage: React.FC = () => {
  const { getAccessTokenSilently } = useAuthShared();
  const { isConnected, on } = useWebSocket();
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

  const fetchChannels = useCallback(async () => {
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
  }, [getAccessTokenSilently]);

  useEffect(() => {
    fetchChannels();
  }, [fetchChannels]);

  useEffect(() => {
    // Listen for channel creation events
    const unsubscribeCreate = on('channel:created', (data) => {
      console.log('Channel created via WebSocket:', data);
      toast.success('New channel created');
      fetchChannels();
    });

    // Listen for channel update events
    const unsubscribeUpdate = on('channel:updated', (data) => {
      console.log('Channel updated via WebSocket:', data);
      setChannels(prev => prev.map(channel => 
        channel.id === data.id ? { ...channel, ...data } : channel
      ));
    });

    // Listen for channel deletion events
    const unsubscribeDelete = on('channel:deleted', (data) => {
      console.log('Channel deleted via WebSocket:', data);
      setChannels(prev => prev.filter(channel => channel.id !== data.channelId));
      toast.info('Channel was deleted');
    });

    // Listen for channel restoration events
    const unsubscribeRestore = on('channel:restored', (data) => {
      console.log('Channel restored via WebSocket:', data);
      toast.success('Channel restored');
      fetchChannels();
    });

    // Listen for connection errors
    const unsubscribeError = on('connection:error', (error) => {
      console.error('WebSocket error:', error);
      toast.error('Connection error occurred');
    });

    return () => {
      unsubscribeCreate();
      unsubscribeUpdate();
      unsubscribeDelete();
      unsubscribeRestore();
      unsubscribeError();
    };
  }, [on, fetchChannels]);

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
      const deletedChannel = channels.find((c) => c.id === id) || null;
      const response = await fetch(`${API_URL}/channels/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Failed to delete channel');

      setChannels(prev => prev.filter(channel => channel.id !== id));
      toast.success('Channel deleted. Undo?', {
        action: {
          label: 'Undo',
          onClick: async () => {
            try {
              const restoreToken = await getAccessTokenSilently();
              const restoreRes = await fetch(`${API_URL}/channels/${id}/restore`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${restoreToken}` },
              });
              if (!restoreRes.ok) throw new Error('Failed to restore channel');
              if (deletedChannel) {
                setChannels((prev) => [...prev, deletedChannel]);
              } else {
                const res = await fetch(`${API_URL}/channels`, {
                  headers: { Authorization: `Bearer ${restoreToken}` },
                });
                if (res.ok) {
                  const data = await res.json();
                  setChannels(data);
                }
              }
              toast.success('Channel restored');
            } catch (err) {
              toast.error(err instanceof Error ? err.message : 'Failed to restore channel');
            }
          },
        },
      });
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
        <div className="flex items-center gap-4">
          <h1 className="text-3xl font-bold text-foreground">Channels</h1>
          <Badge 
            variant={isConnected ? "default" : "destructive"} 
            className="flex items-center gap-1"
          >
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`} />
            {isConnected ? 'Connected' : 'Disconnected'}
          </Badge>
        </div>
        <div className="space-x-2">
          <Link to="/app/channel-restore">
            <Button variant="outline">Trash / Restore</Button>
          </Link>
          <Button onClick={() => setShowCreateModal(true)}>
            Create Channel
          </Button>
        </div>
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
      <CreateChannelDialog
        open={showCreateModal}
        onOpenChange={(open) => setShowCreateModal(open)}
        API_URL={API_URL}
        getAccessToken={getAccessTokenSilently}
        onSuccess={(createdChannel) => {
          // setChannels(prev => [...prev, createdChannel]);
          setGeneratedToken(createdChannel.channelToken);
          setShowTokenModal(true);
          toast.success('Channel created successfully');
        }}
      />

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