import React, { useEffect, useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { PERMISSION_GROUPS } from './permissions/types/types';

interface Template {
  id: string;
  policyName: string;
  createdAt: string;
  policy?: Record<string, boolean>;
}

export const PermissionTemplates: React.FC = () => {
  const { getAccessTokenSilently, isAuthenticated } = useAuth0();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [loadingList, setLoadingList] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [newTemplateMode, setNewTemplateMode] = useState(false);
  const [templateName, setTemplateName] = useState('');
  const [permissions, setPermissions] = useState<Record<string, boolean>>({});
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    const initialPermissions: Record<string, boolean> = {};
    PERMISSION_GROUPS.forEach(group => {
      group.permissions.forEach(permission => {
        initialPermissions[permission.value] = false;
      });
    });
    setPermissions(initialPermissions);
  }, []);

  const fetchTemplates = async () => {
    if (!isAuthenticated) return;
    setLoadingList(true);
    try {
      const token = await getAccessTokenSilently();
      const res = await fetch('http://localhost:3000/auth/permissions/templates', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to fetch templates');
      const data = await res.json();
      setTemplates(data);
      setError(null);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => { fetchTemplates(); }, [getAccessTokenSilently, isAuthenticated]);

  const loadTemplateDetails = async (id: string) => {
    if (!isAuthenticated) return;
    setLoadingDetail(true);
    try {
      const token = await getAccessTokenSilently();
      const res = await fetch(`http://localhost:3000/auth/permissions/templates/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to fetch template detail');
      const data = await res.json();
      setSelectedTemplate(data);
      setTemplateName(data.policyName);
      setPermissions(data.policy || {});
      setError(null);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleSelectTemplate = (template: Template) => {
    setSelectedTemplate(template);
    setEditMode(false);
    setNewTemplateMode(false);
    loadTemplateDetails(template.id);
  };

  const handlePermissionChange = (permissionValue: string, checked: boolean) => {
    setPermissions(prev => ({ ...prev, [permissionValue]: checked }));
  };

  const handleCreateTemplate = async () => {
    if (!templateName.trim()) {
      setError('Template name is required');
      return;
    }

    try {
      const token = await getAccessTokenSilently();
      const res = await fetch('http://localhost:3000/auth/permissions/templates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ policyName: templateName, policy: permissions }),
      });

      if (!res.ok) throw new Error(await res.text());
      setSuccessMessage('Template created successfully');
      setNewTemplateMode(false);
      fetchTemplates();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const handleUpdateTemplate = async () => {
    if (!selectedTemplate) return;
    if (!templateName.trim()) {
      setError('Template name is required');
      return;
    }

    try {
      const token = await getAccessTokenSilently();
      const res = await fetch(`http://localhost:3000/auth/permissions/templates/${selectedTemplate.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ policyName: templateName, policy: permissions }),
      });

      if (!res.ok) throw new Error(await res.text());
      setSuccessMessage('Template updated successfully');
      setEditMode(false);
      fetchTemplates();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const handleDeleteTemplate = async () => {
    if (!selectedTemplate || !window.confirm('Are you sure you want to delete this template?')) return;

    try {
      const token = await getAccessTokenSilently();
      const res = await fetch(`http://localhost:3000/auth/permissions/templates/${selectedTemplate.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error(await res.text());
      setSuccessMessage('Template deleted successfully');
      setSelectedTemplate(null);
      setEditMode(false);
      fetchTemplates();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const handleNewTemplateClick = () => {
    const initialPermissions: Record<string, boolean> = {};
    PERMISSION_GROUPS.forEach(group => {
      group.permissions.forEach(permission => {
        initialPermissions[permission.value] = false;
      });
    });
    setTemplateName('');
    setPermissions(initialPermissions);
    setNewTemplateMode(true);
    setEditMode(false);
    setSelectedTemplate(null);
  };

  if (loadingList) return <p className="text-center py-8">Loading permission templates...</p>;
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Permission Templates</h1>
        <button
          onClick={handleNewTemplateClick}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          New Template
        </button>
      </div>

      {successMessage && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {successMessage}
        </div>
      )}

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-8">
        <div className="md:w-1/3 bg-white rounded-lg shadow p-4">
          <h2 className="text-xl font-semibold mb-4">Saved Templates</h2>
          {templates.length === 0 ? (
            <p className="text-gray-500">No templates found.</p>
          ) : (
            <ul className="space-y-2">
              {templates.map(template => (
                <li
                  key={template.id}
                  className={`p-3 rounded cursor-pointer hover:bg-gray-100 ${
                    selectedTemplate?.id === template.id ? 'bg-blue-100 border-l-4 border-blue-500' : ''
                  }`}
                  onClick={() => handleSelectTemplate(template)}
                >
                  <div className="font-medium">{template.policyName}</div>
                  <div className="text-sm text-gray-500">
                    Created: {new Date(template.createdAt).toLocaleDateString()}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="md:w-2/3 bg-white rounded-lg shadow p-4">
          {loadingDetail ? (
            <p className="text-center py-8">Loading template details...</p>
          ) : newTemplateMode ? (
            <div>
              <h2 className="text-xl font-semibold mb-4">Create New Template</h2>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="templateName">
                  Template Name
                </label>
                <input
                  id="templateName"
                  type="text"
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  placeholder="Enter template name"
                />
              </div>
              
              <div className="mb-6">
                <h3 className="text-lg font-medium mb-3">Permissions</h3>
                <div className="space-y-4">
                  {PERMISSION_GROUPS.map(group => (
                    <div key={group.id} className="border rounded p-4">
                      <h4 className="font-medium mb-2">{group.label}</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {group.permissions.map(permission => (
                          <div key={permission.value} className="flex items-center">
                            <input
                              type="checkbox"
                              id={permission.value}
                              checked={permissions[permission.value] || false}
                              onChange={(e) => handlePermissionChange(permission.value, e.target.checked)}
                              className="mr-2"
                            />
                            <label htmlFor={permission.value}>{permission.label}</label>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={handleCreateTemplate}
                  className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
                >
                  Create Template
                </button>
                <button
                  onClick={() => setNewTemplateMode(false)}
                  className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : selectedTemplate ? (
            <div>
              <div className="flex justify-between items-center mb-4">
                {editMode ? (
                  <div className="w-full">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="editTemplateName">
                      Template Name
                    </label>
                    <input
                      id="editTemplateName"
                      type="text"
                      value={templateName}
                      onChange={(e) => setTemplateName(e.target.value)}
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    />
                  </div>
                ) : (
                  <h2 className="text-xl font-semibold">{selectedTemplate.policyName}</h2>
                )}
                {!editMode && (
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setEditMode(true)}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-1 px-3 rounded text-sm"
                    >
                      Update
                    </button>
                    <button
                      onClick={handleDeleteTemplate}
                      className="bg-red-600 hover:bg-red-700 text-white font-bold py-1 px-3 rounded text-sm"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
              
              <p className="text-gray-600 mb-4">
                <strong>Created At:</strong> {new Date(selectedTemplate.createdAt).toLocaleString()}
              </p>
              
              <div className="mb-6">
                <h3 className="text-lg font-medium mb-3">Permissions</h3>
                <div className="space-y-4">
                  {PERMISSION_GROUPS.map(group => (
                    <div key={group.id} className="border rounded p-4">
                      <h4 className="font-medium mb-2">{group.label}</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {group.permissions.map(permission => (
                          <div key={permission.value} className="flex items-center">
                            {editMode ? (
                              <>
                                <input
                                  type="checkbox"
                                  id={`edit-${permission.value}`}
                                  checked={permissions[permission.value] || false}
                                  onChange={(e) => handlePermissionChange(permission.value, e.target.checked)}
                                  className="mr-2"
                                />
                                <label htmlFor={`edit-${permission.value}`}>{permission.label}</label>
                              </>
                            ) : (
                              <>
                                <input
                                  type="checkbox"
                                  checked={selectedTemplate.policy?.[permission.value] || false}
                                  readOnly
                                  className="mr-2"
                                />
                                <span>{permission.label}</span>
                              </>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {editMode && (
                <div className="flex space-x-3">
                  <button
                    onClick={handleUpdateTemplate}
                    className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
                  >
                    Save Changes
                  </button>
                  <button
                    onClick={() => setEditMode(false)}
                    className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">
                {templates.length > 0 
                  ? 'Select a template to view details' 
                  : 'Create your first template to get started'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};