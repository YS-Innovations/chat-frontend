import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import type { ChannelType } from './types'; // Assuming you have this type defined

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

const ChannelsPage: React.FC = () => {
  const { getAccessTokenSilently } = useAuth0();
  const navigate = useNavigate();
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  const [newChannel, setNewChannel] = useState({
    channelToken: '',
    type: 'WEB' as ChannelType,
  });
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
const API_URL = import.meta.env.VITE_API_URL;

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
      const response = await fetch(`${API_URL}/channels`, {
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
      setChannels([...channels, createdChannel]);
      setShowCreateModal(false);
      setNewChannel({ channelToken: '', type: 'WEB' });
      toast.success('Channel created successfully');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to create channel');
    }
  };

  const handleCreateWithSettings = async () => {
    try {
      const token = await getAccessTokenSilently();
      const response = await fetch(`${API_URL}/channels/init`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...newSettings,
          type: newChannel.type,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create channel with settings');
      }

      const createdChannel = await response.json();
      setChannels([...channels, createdChannel]);
      setShowCreateModal(false);
      setShowSettingsModal(false);
      resetForms();
      toast.success('Channel with settings created successfully');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to create channel with settings');
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
        body: JSON.stringify(newSettings),
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
      toast.success('Settings updated successfully');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update settings');
    }
  };

  const resetForms = () => {
    setNewChannel({
      channelToken: '',
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
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{channel.channelToken}</td>
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

      {/* Create Channel Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Create New Channel</h2>
            
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="channelToken">
                Channel Token
              </label>
              <input
                id="channelToken"
                type="text"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                value={newChannel.channelToken}
                onChange={(e) => setNewChannel({...newChannel, channelToken: e.target.value})}
                placeholder="Enter channel token"
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
            
            <div className="flex justify-between">
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
                onClick={() => {
                  setShowCreateModal(false);
                  setShowSettingsModal(true);
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition duration-200"
              >
                Add Settings
              </button>
              <button
                onClick={handleCreateChannel}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md transition duration-200"
                disabled={!newChannel.channelToken}
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Channel Settings Modal */}
      {showSettingsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 overflow-y-auto">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl my-8">
            <h2 className="text-xl font-bold mb-4">
              {selectedChannel?.channelSettings ? 'Update Channel Settings' : 'Add Channel Settings'}
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
                  Name
                </label>
                <input
                  id="name"
                  type="text"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  value={newSettings.name}
                  onChange={(e) => setNewSettings({...newSettings, name: e.target.value})}
                  placeholder="Channel name"
                />
              </div>
              
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
              
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="primaryColor">
                  Primary Color
                </label>
                <div className="flex items-center">
                  <input
                    id="primaryColor"
                    type="color"
                    className="h-10 w-10 rounded border mr-2"
                    value={newSettings.primaryColor}
                    onChange={(e) => setNewSettings({...newSettings, primaryColor: e.target.value})}
                  />
                  <input
                    type="text"
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    value={newSettings.primaryColor}
                    onChange={(e) => setNewSettings({...newSettings, primaryColor: e.target.value})}
                    placeholder="#2563EB"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="position">
                  Position
                </label>
                <select
                  id="position"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  value={newSettings.position}
                  onChange={(e) => setNewSettings({...newSettings, position: e.target.value})}
                >
                  <option value="bottom-right">Bottom Right</option>
                  <option value="bottom-left">Bottom Left</option>
                  <option value="top-right">Top Right</option>
                  <option value="top-left">Top Left</option>
                </select>
              </div>
              
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="launcherIcon">
                  Launcher Icon URL
                </label>
                <input
                  id="launcherIcon"
                  type="text"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  value={newSettings.launcherIcon}
                  onChange={(e) => setNewSettings({...newSettings, launcherIcon: e.target.value})}
                  placeholder="Icon URL"
                />
              </div>
              
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="orgName">
                  Organization Name
                </label>
                <input
                  id="orgName"
                  type="text"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  value={newSettings.orgName}
                  onChange={(e) => setNewSettings({...newSettings, orgName: e.target.value})}
                  placeholder="Organization name"
                />
              </div>
              
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="orgLogo">
                  Organization Logo URL
                </label>
                <input
                  id="orgLogo"
                  type="text"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  value={newSettings.orgLogo}
                  onChange={(e) => setNewSettings({...newSettings, orgLogo: e.target.value})}
                  placeholder="Logo URL"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <div className="flex items-center">
                <input
                  id="showBranding"
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  checked={newSettings.showBranding}
                  onChange={(e) => setNewSettings({...newSettings, showBranding: e.target.checked})}
                />
                <label htmlFor="showBranding" className="ml-2 block text-sm text-gray-700">
                  Show Branding
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  id="showHelpTab"
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  checked={newSettings.showHelpTab}
                  onChange={(e) => setNewSettings({...newSettings, showHelpTab: e.target.checked})}
                />
                <label htmlFor="showHelpTab" className="ml-2 block text-sm text-gray-700">
                  Show Help Tab
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  id="allowUploads"
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  checked={newSettings.allowUploads}
                  onChange={(e) => setNewSettings({...newSettings, allowUploads: e.target.checked})}
                />
                <label htmlFor="allowUploads" className="ml-2 block text-sm text-gray-700">
                  Allow Uploads
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  id="csatEnabled"
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  checked={newSettings.csatEnabled}
                  onChange={(e) => setNewSettings({...newSettings, csatEnabled: e.target.checked})}
                />
                <label htmlFor="csatEnabled" className="ml-2 block text-sm text-gray-700">
                  CSAT Enabled
                </label>
              </div>
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="quickReply">
                Quick Reply Configuration (JSON)
              </label>
              <textarea
                id="quickReply"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline h-32"
                value={newSettings.QuickReply ? JSON.stringify(newSettings.QuickReply, null, 2) : ''}
                onChange={(e) => {
                  try {
                    const parsed = JSON.parse(e.target.value);
                    setNewSettings({...newSettings, QuickReply: parsed});
                  } catch (err) {
                    // Invalid JSON, don't update
                  }
                }}
                placeholder="Enter QuickReply JSON configuration"
              />
            </div>
            
            <div className="flex justify-between">
              <button
                onClick={() => {
                  setShowSettingsModal(false);
                  if (!selectedChannel?.channelSettings) {
                    setShowCreateModal(true);
                  }
                }}
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md transition duration-200"
              >
                Cancel
              </button>
              
              {selectedChannel && !selectedChannel.channelSettings && (
                <button
                  onClick={handleCreateWithSettings}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md transition duration-200"
                >
                  Create Channel with Settings
                </button>
              )}
              
              <button
                onClick={handleUpdateSettings}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition duration-200"
              >
                {selectedChannel?.channelSettings ? 'Update Settings' : 'Save Settings'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChannelsPage;

