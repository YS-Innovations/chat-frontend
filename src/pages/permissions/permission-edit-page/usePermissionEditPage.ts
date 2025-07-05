import { useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { useNavigate } from 'react-router-dom';
import { arrayToPermissionObject } from "../utils";

export function usePermissionEditPage(userId?: string) {
  const { getAccessTokenSilently } = useAuth0();
  const navigate = useNavigate();
  const [permissions, setPermissions] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [templates, setTemplates] = useState<any[]>([]);
  const [saveOptionsOpen, setSaveOptionsOpen] = useState(false);
  const [templateModalOpen, setTemplateModalOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = await getAccessTokenSilently();

        // Fetch templates
        const templatesResponse = await fetch(
          'http://localhost:3000/templates',
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const templatesData = await templatesResponse.json();
        setTemplates(templatesData);

        // Fetch target user info
        const userResponse = await fetch(
          `http://localhost:3000/auth/user/${userId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (!userResponse.ok) throw new Error('Failed to fetch user');
        const userData = await userResponse.json();

        if (userData.role === 'ADMIN') {
          setError('Cannot edit permissions for admin users');
          return;
        }

        // Fetch permissions
        const permResponse = await fetch(
          `http://localhost:3000/auth/permissions/user/${userId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (!permResponse.ok) throw new Error('Failed to fetch permissions');
        const permData = await permResponse.json();
        setPermissions(arrayToPermissionObject(permData.permissions));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    if (userId) fetchData();
  }, [userId, getAccessTokenSilently]);

  const handleSave = async (updatedPermissions: Record<string, boolean>) => {
    setSaving(true);
    try {
      const token = await getAccessTokenSilently();
      
      // Convert permission object to array
      const permissionsArray = Object.entries(updatedPermissions)
        .filter(([_, value]) => value)
        .map(([key]) => key);

      const response = await fetch(
        `http://localhost:3000/auth/permissions/${userId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ permissions: permissionsArray }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save permissions');
      }
      
      setPermissions(updatedPermissions);
      navigate(-1);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setSaving(false);
    }
  };

  const handleTemplateClick = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      setSelectedTemplate(template);
      setTemplateModalOpen(true);
    }
  };

  const handleUseTemplate = (
    perms: Record<string, boolean>, 
    action: 'apply' | 'saveAsTemplate', 
    name?: string
  ) => {
    if (action === 'apply') {
      setPermissions(perms);
      setSaveOptionsOpen(true);
    } else if (action === 'saveAsTemplate' && name) {
      setPermissions(perms);
      setSaveOptionsOpen(true);
    }
  };

  return {
    permissions,
    loading,
    error,
    saving,
    templates,
    saveOptionsOpen,
    templateModalOpen,
    selectedTemplate,
    setPermissions,
    setSaveOptionsOpen,
    setTemplateModalOpen,
    handleSave,
    handleTemplateClick,
    handleUseTemplate
  };
}