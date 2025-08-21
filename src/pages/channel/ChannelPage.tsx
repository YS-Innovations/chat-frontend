// src/pages/Channels/ChannelsPage.tsx
import React from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useChannels } from "@/components/Sidebar/components/Nav/hooks/use-channels";
import LoadingSpinner from '@/components/Loading/LoadingSpinner';

const ChannelsPagess: React.FC = () => {
  const { channelId } = useParams<{ channelId: string }>();
  const { channels, loading } = useChannels();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  const channel = channels.find(c => c.id === channelId);

  if (!channel) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Channel Not Found</CardTitle>
          </CardHeader>
          <CardContent>
            <p>The requested channel could not be found.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {channel.channelSettings?.name || `Channel ${channel.id.slice(0, 8)}`}
            <Badge variant="secondary">{channel.type}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h3 className="font-semibold mb-2">Channel Information</h3>
              <dl className="space-y-2">
                <div>
                  <dt className="text-sm text-muted-foreground">ID</dt>
                  <dd className="font-mono text-sm">{channel.id}</dd>
                </div>
                <div>
                  <dt className="text-sm text-muted-foreground">Type</dt>
                  <dd>{channel.type}</dd>
                </div>
                <div>
                  <dt className="text-sm text-muted-foreground">Created</dt>
                  <dd>{new Date(channel.createdAt).toLocaleDateString()}</dd>
                </div>
              </dl>
            </div>

            {channel.channelSettings && (
              <div>
                <h3 className="font-semibold mb-2">Settings</h3>
                <dl className="space-y-2">
                  <div>
                    <dt className="text-sm text-muted-foreground">Domain</dt>
                    <dd>{channel.channelSettings.domain || 'Not set'}</dd>
                  </div>
                  <div>
                    <dt className="text-sm text-muted-foreground">Theme</dt>
                    <dd className="capitalize">{channel.channelSettings.theme}</dd>
                  </div>
                  <div>
                    <dt className="text-sm text-muted-foreground">Primary Color</dt>
                    <dd className="flex items-center gap-2">
                      <span 
                        className="w-4 h-4 rounded-full border" 
                        style={{ backgroundColor: channel.channelSettings.primaryColor }}
                      />
                      {channel.channelSettings.primaryColor}
                    </dd>
                  </div>
                </dl>
              </div>
            )}
          </div>

          {!channel.channelSettings && (
            <div className="mt-6 p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">
                This channel hasn't been configured yet. 
                <a href="/app/channel-settings" className="text-blue-600 hover:underline ml-1">
                  Configure channel settings
                </a>
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ChannelsPagess;