import React, { useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { toast } from 'sonner';

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
    if (!window.confirm('Are you sure you want to delete this channel?')) return;

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
        {channels.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No channels found. Create your first channel to get started.
          </div>
        ) : (
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
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-500">
                    <span className="truncate max-w-xs inline-block">{channel.channelToken}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{channel.type}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(channel.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {channel.channelSettings ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Configured
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        Not Configured
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button
                      onClick={() => openSettingsModal(channel)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      Settings
                    </button>
                    <button
                      onClick={() => handleDeleteChannel(channel.id)}
                      className="text-red-600 hover:text-red-900"
                      disabled={isSubmitting}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Create New Channel</h2>
            
            <div className="space-y-4">
              <div>
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
              
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="domain">
                  Domain (optional)
                </label>
                <input
                  id="domain"
                  type="text"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  value={newChannel.domain}
                  onChange={(e) => setNewChannel({...newChannel, domain: e.target.value})}
                  placeholder="example.com"
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-2 mt-6">
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
                className={`bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition duration-200 ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                disabled={!newChannel.name || isSubmitting}
              >
                {isSubmitting ? 'Creating...' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}

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
                onClick={() => {
                  setShowTokenModal(false);
                  setShowSettingsModal(true);
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition duration-200"
              >
                Configure Settings
              </button>
            </div>
          </div>
        </div>
      )}

      {showSettingsModal && selectedChannel && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 overflow-y-auto">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl my-8">
            <h2 className="text-xl font-bold mb-4">
              {selectedChannel.channelSettings ? 'Update' : 'Configure'} Channel Settings
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="settingsName">
                  Channel Name
                </label>
                <input
                  id="settingsName"
                  type="text"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  value={newChannel.name}
                  onChange={(e) => setNewChannel({...newChannel, name: e.target.value})}
                  placeholder="Channel name"
                />
              </div>
              
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="settingsDomain">
                  Domain
                </label>
                <input
                  id="settingsDomain"
                  type="text"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  value={newChannel.domain}
                  onChange={(e) => setNewChannel({...newChannel, domain: e.target.value})}
                  placeholder="example.com"
                />
              </div>
              
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="theme">
                  Theme
                </label>
                <select
                  id="theme"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  value={newChannel.theme}
                  onChange={(e) => setNewChannel({...newChannel, theme: e.target.value as Theme})}
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
                    className="w-10 h-10 mr-2"
                    value={newChannel.primaryColor}
                    onChange={(e) => setNewChannel({...newChannel, primaryColor: e.target.value})}
                  />
                  <span>{newChannel.primaryColor}</span>
                </div>
              </div>
              
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="position">
                  Position
                </label>
                <select
                  id="position"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  value={newChannel.position}
                  onChange={(e) => setNewChannel({...newChannel, position: e.target.value as Position})}
                >
                  <option value="bottom-right">Bottom Right</option>
                  <option value="bottom-left">Bottom Left</option>
                  <option value="top-right">Top Right</option>
                  <option value="top-left">Top Left</option>
                </select>
              </div>
              
              <div className="space-y-2">
                <label className="block text-gray-700 text-sm font-bold mb-2">Features</label>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="showBranding"
                    checked={newChannel.showBranding}
                    onChange={(e) => setNewChannel({...newChannel, showBranding: e.target.checked})}
                    className="mr-2"
                  />
                  <label htmlFor="showBranding">Show Branding</label>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="showHelpTab"
                    checked={newChannel.showHelpTab}
                    onChange={(e) => setNewChannel({...newChannel, showHelpTab: e.target.checked})}
                    className="mr-2"
                  />
                  <label htmlFor="showHelpTab">Show Help Tab</label>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="allowUploads"
                    checked={newChannel.allowUploads}
                    onChange={(e) => setNewChannel({...newChannel, allowUploads: e.target.checked})}
                    className="mr-2"
                  />
                  <label htmlFor="allowUploads">Allow File Uploads</label>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="csatEnabled"
                    checked={newChannel.csatEnabled}
                    onChange={(e) => setNewChannel({...newChannel, csatEnabled: e.target.checked})}
                    className="mr-2"
                  />
                  <label htmlFor="csatEnabled">Enable CSAT Surveys</label>
                </div>
              </div>
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
                className={`bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition duration-200 ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Saving...' : 'Save Settings'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChannelsPage;