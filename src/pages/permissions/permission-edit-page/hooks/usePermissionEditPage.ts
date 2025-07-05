import { useState, useEffect, useCallback } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { useNavigate } from 'react-router-dom';
import type { PermissionValue, PermissionTemplate } from "../types";
import { arrayToPermissionObject } from '../../utils';

export function usePermissionEditPage(userId?: string) {
  const { getAccessTokenSilently } = useAuth0();
  const navigate = useNavigate();
  const [permissions, setPermissions] = useState<PermissionValue>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [templates, setTemplates] = useState<PermissionTemplate[]>([]);
  const [saveOptionsOpen, setSaveOptionsOpen] = useState(false);
  const [templateModalOpen, setTemplateModalOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<PermissionTemplate | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const token = await getAccessTokenSilently();

      // Fetch templates
      const templatesRes = await fetch('http://localhost:3000/templates', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const templatesData = await templatesRes.json();
      setTemplates(templatesData);

      // Fetch user permissions
      if (userId) {
        const userRes = await fetch(`http://localhost:3000/auth/user/${userId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const userData = await userRes.json();

        if (userData.role === 'ADMIN') {
          setError('Cannot edit permissions for admin users');
          return;
        }

        const permRes = await fetch(`http://localhost:3000/auth/permissions/user/${userId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const permData = await permRes.json();
        setPermissions(arrayToPermissionObject(permData.permissions));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [userId, getAccessTokenSilently]);

  useEffect(() => {
    if (userId) fetchData();
  }, [userId, fetchData]);

  const handleSave = useCallback(async (updatedPermissions: PermissionValue) => {
    setSaving(true);
    try {
      const token = await getAccessTokenSilently();
      const permissionsArray = Object.entries(updatedPermissions)
        .filter(([_, value]) => value)
        .map(([key]) => key);

      const res = await fetch(`http://localhost:3000/auth/permissions/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ permissions: permissionsArray }),
      });

      if (!res.ok) throw new Error('Failed to save permissions');
      
      setPermissions(updatedPermissions);
      navigate(-1);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setSaving(false);
    }
  }, [userId, getAccessTokenSilently, navigate]);

  const handleTemplateClick = useCallback((templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      setSelectedTemplate(template);
      setTemplateModalOpen(true);
    }
  }, [templates]);

  const handleUseTemplate = useCallback((
    perms: PermissionValue, 
    action: 'apply' | 'saveAsTemplate', 
    name?: string
  ) => {
    if (action === 'apply') {
      setPermissions(perms);
      setSaveOptionsOpen(true);
    } else if (action === 'saveAsTemplate' && name) {
      // Save template logic
    }
  }, []);

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