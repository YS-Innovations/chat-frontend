import React, { useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import type { ChannelType } from './types';
import { toast } from 'sonner';

interface ChannelSettings {
  id: string;
  channelId: string;
  name?: string | null;
  domain?: string | null;
  theme: string;
  primaryColor: string;
  position: string;
  launcherIcon?: string | null;
  orgName?: string | null;
  orgLogo?: string | null;
  showBranding: boolean;
  showHelpTab: boolean;
  allowUploads: boolean;
  csatEnabled: boolean;
  QuickReply?: any;
  updatedAt: Date;
}

interface Channel {
  id: string;
  uuid: string;
  channelToken: string;
  type: ChannelType;
  createdAt: Date;
  updatedAt: Date;
  channelSettings?: ChannelSettings | null;
}

interface CreateChannelForm {
  name: string;
  type: ChannelType;
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
  const [newChannel, setNewChannel] = useState<CreateChannelForm>({
    name: '',
    type: 'WEB',
  });
  const [generatedToken, setGeneratedToken] = useState<string>('');
  const [newSettings, setNewSettings] = useState({
    name: '',
    domain: '',
    theme: 'light',
    primaryColor: '#2563EB',
    position: 'bottom-right',
    launcherIcon: '',
    orgName: '',
    orgLogo: '',
    showBranding: true,
    showHelpTab: true,
    allowUploads: true,
    csatEnabled: true,
    QuickReply: null,
  });

  useEffect(() => {
    fetchChannels();
  }, []);

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

  const handleCreateChannel = async () => {
    try {
      const token = await getAccessTokenSilently();
      const response = await fetch(`${API_URL}/channels/init`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: newChannel.name,
          type: newChannel.type,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create channel');
      }

      const createdChannel = await response.json();
      setGeneratedToken(createdChannel.channelToken);
      setShowCreateModal(false);
      setShowTokenModal(true);
      
      // Refresh the channels list to include the new channel
      fetchChannels();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to create channel');
    }
  };

  const handleAddSettings = () => {
    setShowTokenModal(false);
    setShowSettingsModal(true);
  };

  const handleUpdateSettings = async () => {
    if (!selectedChannel) return;

    try {
      const token = await getAccessTokenSilently();
      const response = await fetch(`${API_URL}/channels/${selectedChannel.id}/settings`, {
        method: selectedChannel.channelSettings ? 'PATCH' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...newSettings,
          name: newChannel.name, // Use the name from the first form
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update settings');
      }

      const updatedSettings = await response.json();
      const updatedChannels = channels.map(channel => 
        channel.id === selectedChannel.id 
          ? { ...channel, channelSettings: updatedSettings } 
          : channel
      );
      
      setChannels(updatedChannels);
      setShowSettingsModal(false);
      resetForms();
      toast.success('Settings updated successfully');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update settings');
    }
  };

  const handleDeleteChannel = async (channelId: string) => {
    if (!window.confirm('Are you sure you want to delete this channel?')) return;

    try {
      const token = await getAccessTokenSilently();
      const response = await fetch(`${API_URL}/channels/${channelId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete channel');
      }

      setChannels(channels.filter(channel => channel.id !== channelId));
      toast.success('Channel deleted successfully');
    } catch (err) {
      toast.error('Failed to delete channel');
    }
  };

  const resetForms = () => {
    setNewChannel({
      name: '',
      type: 'WEB',
    });
    setNewSettings({
      name: '',
      domain: '',
      theme: 'light',
      primaryColor: '#2563EB',
      position: 'bottom-right',
      launcherIcon: '',
      orgName: '',
      orgLogo: '',
      showBranding: true,
      showHelpTab: true,
      allowUploads: true,
      csatEnabled: true,
      QuickReply: null,
    });
    setGeneratedToken('');
  };

  const openSettingsModal = (channel: Channel) => {
    setSelectedChannel(channel);
    if (channel.channelSettings) {
      setNewSettings({
        name: channel.channelSettings.name || '',
        domain: channel.channelSettings.domain || '',
        theme: channel.channelSettings.theme,
        primaryColor: channel.channelSettings.primaryColor,
        position: channel.channelSettings.position,
        launcherIcon: channel.channelSettings.launcherIcon || '',
        orgName: channel.channelSettings.orgName || '',
        orgLogo: channel.channelSettings.orgLogo || '',
        showBranding: channel.channelSettings.showBranding,
        showHelpTab: channel.channelSettings.showHelpTab,
        allowUploads: channel.channelSettings.allowUploads,
        csatEnabled: channel.channelSettings.csatEnabled,
        QuickReply: channel.channelSettings.QuickReply || null,
      });
    }
    setShowSettingsModal(true);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-red-500 text-lg">{error}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Channels</h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition duration-200"
        >
          Create Channel
        </button>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Token</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Settings</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {channels.map((channel) => (
              <tr key={channel.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {channel.channelSettings?.name || 'Unnamed'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-500">{channel.channelToken}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{channel.type}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(channel.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {channel.channelSettings ? 'Configured' : 'Not Configured'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => openSettingsModal(channel)}
                    className="text-blue-600 hover:text-blue-900 mr-4"
                  >
                    Settings
                  </button>
                  <button
                    onClick={() => handleDeleteChannel(channel.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Step 1: Create Channel Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Create New Channel</h2>
            
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="channelName">
                Channel Name
              </label>
              <input
                id="channelName"
                type="text"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                value={newChannel.name}
                onChange={(e) => setNewChannel({...newChannel, name: e.target.value})}
                placeholder="Enter channel name"
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="channelType">
                Channel Type
              </label>
              <select
                id="channelType"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                value={newChannel.type}
                onChange={(e) => setNewChannel({...newChannel, type: e.target.value as ChannelType})}
              >
                <option value="WEB">Web</option>
                <option value="MOBILE">Mobile</option>
                <option value="API">API</option>
              </select>
            </div>
            
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  resetForms();
                }}
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md transition duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateChannel}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition duration-200"
                disabled={!newChannel.name}
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Step 2: Show Generated Token Modal */}
      {showTokenModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Channel Created Successfully</h2>
            
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Your Channel Token
              </label>
              <div className="p-3 bg-gray-100 rounded-md font-mono break-all">
                {generatedToken}
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Copy this token and use it to connect your application.
              </p>
            </div>
            
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => {
                  setShowTokenModal(false);
                  resetForms();
                }}
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md transition duration-200"
              >
                Close
              </button>
              <button
                onClick={handleAddSettings}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition duration-200"
              >
                Configure Settings
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Channel Settings Modal */}
      {showSettingsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 overflow-y-auto">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl my-8">
            <h2 className="text-xl font-bold mb-4">Configure Channel Settings</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="domain">
                  Domain
                </label>
                <input
                  id="domain"
                  type="text"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  value={newSettings.domain}
                  onChange={(e) => setNewSettings({...newSettings, domain: e.target.value})}
                  placeholder="Your domain"
                />
              </div>
              
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="theme">
                  Theme
                </label>
                <select
                  id="theme"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  value={newSettings.theme}
                  onChange={(e) => setNewSettings({...newSettings, theme: e.target.value})}
                >
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                </select>
              </div>
              
              {/* Rest of the settings fields... */}
            </div>
            
            <div className="flex justify-end">
              <button
                onClick={() => {
                  setShowSettingsModal(false);
                  resetForms();
                }}
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md transition duration-200 mr-2"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateSettings}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition duration-200"
              >
                Save Settings
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChannelsPage;